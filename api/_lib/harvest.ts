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

// Active (non-archived) projects for a client, for the portal's project filter.
// Archived projects are treated as settled, whatever their invoice linkage in
// Harvest (fixed-fee projects never link time entries to invoices).
export async function fetchActiveProjects(
  clientId: string = requireEnv("HARVEST_CLIENT_ID")
): Promise<{ id: number; name: string }[]> {
  const projects: { id: number; name: string }[] = [];
  let page = 1;
  for (;;) {
    const data = await harvestGet("/projects", {
      client_id: clientId,
      is_active: "true",
      page: String(page),
      per_page: "100",
    });
    for (const p of data.projects ?? []) projects.push({ id: p.id, name: p.name ?? String(p.id) });
    if (!data.next_page) break;
    page = data.next_page;
  }
  projects.sort((a, b) => a.name.localeCompare(b.name));
  return projects;
}

export async function fetchActiveProjectIds(
  clientId: string = requireEnv("HARVEST_CLIENT_ID")
): Promise<Set<number>> {
  return new Set((await fetchActiveProjects(clientId)).map((p) => p.id));
}

// Narrows a client's active project IDs to one project when the portal's
// project filter is set. Returns null for an id outside the client's projects,
// so a request can never reach another client's project.
export function scopeProjectIds(
  activeProjectIds: Set<number>,
  projectParam: unknown
): Set<number> | null {
  if (projectParam == null || projectParam === "") return activeProjectIds;
  if (!/^\d+$/.test(String(projectParam))) return null;
  const id = Number(projectParam);
  return activeProjectIds.has(id) ? new Set([id]) : null;
}

export interface UnpaidSummary {
  amount: number;
  count: number;
  currency: string;
}

// Sent-but-unpaid invoices (Harvest state "open") for one client, regardless of
// date filter. With a project filter, each invoice contributes its line items
// for that project, scaled by the share of the invoice still due.
export async function fetchUnpaidInvoices(
  clientId: string,
  projectId?: number
): Promise<UnpaidSummary> {
  let amount = 0;
  let count = 0;
  let currency = "USD";
  let page = 1;
  for (;;) {
    const data = await harvestGet("/invoices", {
      client_id: clientId,
      state: "open",
      page: String(page),
      per_page: "100",
    });
    for (const inv of data.invoices ?? []) {
      if (String(inv.client?.id) !== String(clientId)) continue;
      const due = inv.due_amount ?? 0;
      if (due <= 0) continue;
      let share = due;
      if (projectId != null) {
        const total = inv.amount ?? 0;
        const projectAmount = (inv.line_items ?? [])
          .filter((li: any) => li.project?.id === projectId)
          .reduce((sum: number, li: any) => sum + (li.amount ?? 0), 0);
        if (projectAmount <= 0 || total <= 0) continue;
        share = projectAmount * (due / total);
      }
      amount += share;
      count += 1;
      if (inv.currency) currency = inv.currency;
    }
    if (!data.next_page) break;
    page = data.next_page;
  }
  return { amount: round2(amount), count, currency };
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
// `from` clamps out the pre-hourly fixed-price era (the account's earliest date);
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
// earliest: the date the viewed client's hourly billing began, if configured
// (PORTAL_EARLIEST_DATE / EXABEAM_EARLIEST_DATE — see _lib/accounts.ts).
export function validateDateRange(
  from: unknown,
  to: unknown,
  earliest?: string
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
  // "uninvoiced" forever. The earliest date clamps them out server-side.
  if (earliest && pattern.test(earliest)) {
    if (to < earliest) return { from: earliest, to: earliest, empty: true };
    if (from < earliest) return { from: earliest, to };
  }
  return { from, to };
}
