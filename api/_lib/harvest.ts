// Server-side Harvest API v2 client. Credentials never leave this process.
const HARVEST_BASE = "https://api.harvestapp.com/v2";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function harvestHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${requireEnv("HARVEST_ACCESS_TOKEN")}`,
    "Harvest-Account-Id": requireEnv("HARVEST_ACCOUNT_ID"),
    "User-Agent": "MBD Studio Client Portal",
  };
}

async function harvestGet(path: string, params: Record<string, string>): Promise<any> {
  const url = new URL(`${HARVEST_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { headers: harvestHeaders() });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Harvest API error ${res.status} on ${path}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

export interface PortalTimeEntry {
  date: string;
  project: string;
  task: string;
  description: string;
  hours: number;
  amount: number;
}

export interface PortalSummary {
  hours: number;
  amount: number;
  currency: string;
}

// Active (non-archived) Harvest clients, for the admin client switcher.
export async function fetchClients(): Promise<{ id: number; name: string }[]> {
  const clients: { id: number; name: string }[] = [];
  let page = 1;
  for (;;) {
    const data = await harvestGet("/clients", {
      is_active: "true",
      page: String(page),
      per_page: "100",
    });
    for (const c of data.clients ?? []) clients.push({ id: c.id, name: c.name ?? String(c.id) });
    if (!data.next_page) break;
    page = data.next_page;
  }
  clients.sort((a, b) => a.name.localeCompare(b.name));
  return clients;
}

// Active (non-archived) project IDs for a client. Archived
// projects are treated as settled, whatever their invoice linkage in Harvest
// (fixed-fee projects never link time entries to invoices).
export async function fetchActiveProjectIds(
  clientId: string = requireEnv("HARVEST_CLIENT_ID")
): Promise<Set<number>> {
  const ids = new Set<number>();
  let page = 1;
  for (;;) {
    const data = await harvestGet("/projects", {
      client_id: clientId,
      is_active: "true",
      page: String(page),
      per_page: "100",
    });
    for (const p of data.projects ?? []) ids.add(p.id);
    if (!data.next_page) break;
    page = data.next_page;
  }
  return ids;
}

// Uninvoiced report: summary totals for one client only.
export async function fetchUninvoicedSummary(
  from: string,
  to: string,
  activeProjectIds: Set<number>,
  clientIdParam: string = requireEnv("HARVEST_CLIENT_ID")
): Promise<PortalSummary> {
  const clientId = Number(clientIdParam);
  let page = 1;
  let hours = 0;
  let amount = 0;
  let currency = "USD";
  for (;;) {
    const data = await harvestGet("/reports/uninvoiced", {
      from,
      to,
      page: String(page),
      per_page: "1000",
    });
    for (const row of data.results ?? []) {
      if (row.client_id === clientId && activeProjectIds.has(row.project_id)) {
        hours += row.uninvoiced_hours ?? 0;
        amount += row.uninvoiced_amount ?? 0;
        if (row.currency) currency = row.currency;
      }
    }
    if (!data.next_page) break;
    page = data.next_page;
  }
  return { hours: round2(hours), amount: round2(amount), currency };
}

// Unbilled time entries for the configured client, newest first.
// Only the fields the dashboard needs are returned — no rates, no other clients.
export async function fetchUninvoicedTimeEntries(
  from: string,
  to: string,
  activeProjectIds: Set<number>,
  clientId: string = requireEnv("HARVEST_CLIENT_ID")
): Promise<PortalTimeEntry[]> {
  const entries: PortalTimeEntry[] = [];
  let page = 1;
  for (;;) {
    const data = await harvestGet("/time_entries", {
      client_id: clientId,
      is_billed: "false",
      from,
      to,
      page: String(page),
      per_page: "100",
    });
    for (const e of data.time_entries ?? []) {
      // Defense in depth: only billable, unbilled entries for the configured client.
      if (String(e.client?.id) !== String(clientId) || e.is_billed) continue;
      if (e.billable === false) continue;
      if (!activeProjectIds.has(e.project?.id)) continue;
      const hours = e.rounded_hours ?? e.hours ?? 0;
      entries.push({
        date: e.spent_date,
        project: e.project?.name ?? "",
        task: e.task?.name ?? "",
        description: e.notes ?? "",
        hours,
        // Billable rate is what the client is charged (not the internal cost
        // rate) — used for per-task cost totals on the dashboard.
        amount: round2(hours * (e.billable_rate ?? 0)),
      });
    }
    if (!data.next_page) break;
    page = data.next_page;
  }
  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return entries;
}

export interface TaskTotal {
  task: string;
  hours: number;
  amount: number;
}

export interface ToDateTotals {
  tasks: TaskTotal[];
  hours: number;
  amount: number;
}

// All billable time to date — invoiced and uninvoiced — grouped by task.
// `from` clamps out the pre-hourly fixed-price era (PORTAL_EARLIEST_DATE);
// omit it to include the client's full history.
export async function fetchToDateTaskTotals(
  activeProjectIds: Set<number>,
  clientId: string = requireEnv("HARVEST_CLIENT_ID"),
  from?: string
): Promise<ToDateTotals> {
  const totals = new Map<string, { hours: number; amount: number }>();
  let page = 1;
  for (;;) {
    const params: Record<string, string> = {
      client_id: clientId,
      page: String(page),
      per_page: "100",
    };
    if (from) params.from = from;
    const data = await harvestGet("/time_entries", params);
    for (const e of data.time_entries ?? []) {
      if (String(e.client?.id) !== String(clientId)) continue;
      if (e.billable === false) continue;
      if (!activeProjectIds.has(e.project?.id)) continue;
      const hours = e.rounded_hours ?? e.hours ?? 0;
      const task = e.task?.name ?? "";
      const t = totals.get(task) ?? { hours: 0, amount: 0 };
      t.hours += hours;
      t.amount += hours * (e.billable_rate ?? 0);
      totals.set(task, t);
    }
    if (!data.next_page) break;
    page = data.next_page;
  }
  const tasks = [...totals.entries()]
    .map(([task, t]) => ({ task, hours: round2(t.hours), amount: round2(t.amount) }))
    .sort((a, b) => b.hours - a.hours);
  let hours = 0;
  let amount = 0;
  for (const [, t] of totals) {
    hours += t.hours;
    amount += t.amount;
  }
  return { tasks, hours: round2(hours), amount: round2(amount) };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Date validation: YYYY-MM-DD, real dates, from <= to, span <= 365 days (Harvest report limit).
// applyEarliestClamp: PORTAL_EARLIEST_DATE marks when the default client's
// hourly billing began; it only makes sense for that client, so admin views
// of other clients skip the clamp.
export function validateDateRange(
  from: unknown,
  to: unknown,
  applyEarliestClamp = true
): { from: string; to: string; empty?: boolean } | { error: string } {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof from !== "string" || !pattern.test(from)) return { error: "Invalid 'from' date" };
  if (typeof to !== "string" || !pattern.test(to)) return { error: "Invalid 'to' date" };
  const fromDate = new Date(`${from}T00:00:00Z`);
  const toDate = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(fromDate.getTime()) || fromDate.toISOString().slice(0, 10) !== from) return { error: "Invalid 'from' date" };
  if (Number.isNaN(toDate.getTime()) || toDate.toISOString().slice(0, 10) !== to) return { error: "Invalid 'to' date" };
  if (fromDate > toDate) return { error: "'from' must be on or before 'to'" };
  const days = (toDate.getTime() - fromDate.getTime()) / 86400000;
  if (days > 365) return { error: "Date range cannot exceed 365 days" };
  // Hours tracked before the hourly arrangement began (billed as fixed-price
  // projects) are never linked to invoices in Harvest, so they'd show as
  // "uninvoiced" forever. PORTAL_EARLIEST_DATE clamps them out server-side.
  const earliest = process.env.PORTAL_EARLIEST_DATE;
  if (applyEarliestClamp && earliest && pattern.test(earliest)) {
    if (to < earliest) return { from: earliest, to: earliest, empty: true };
    if (from < earliest) return { from: earliest, to };
  }
  return { from, to };
}
