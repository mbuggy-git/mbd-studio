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
}

export interface PortalSummary {
  hours: number;
  amount: number;
  currency: string;
}

// Active (non-archived) project IDs for the configured client. Archived
// projects are treated as settled, whatever their invoice linkage in Harvest
// (fixed-fee projects never link time entries to invoices).
export async function fetchActiveProjectIds(): Promise<Set<number>> {
  const clientId = requireEnv("HARVEST_CLIENT_ID");
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

// Uninvoiced report: summary totals for the configured client only.
export async function fetchUninvoicedSummary(
  from: string,
  to: string,
  activeProjectIds: Set<number>
): Promise<PortalSummary> {
  const clientId = Number(requireEnv("HARVEST_CLIENT_ID"));
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
  activeProjectIds: Set<number>
): Promise<PortalTimeEntry[]> {
  const clientId = requireEnv("HARVEST_CLIENT_ID");
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
      entries.push({
        date: e.spent_date,
        project: e.project?.name ?? "",
        task: e.task?.name ?? "",
        description: e.notes ?? "",
        hours: e.rounded_hours ?? e.hours ?? 0,
      });
    }
    if (!data.next_page) break;
    page = data.next_page;
  }
  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return entries;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Date validation: YYYY-MM-DD, real dates, from <= to, span <= 365 days (Harvest report limit).
export function validateDateRange(
  from: unknown,
  to: unknown
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
  if (earliest && pattern.test(earliest)) {
    if (to < earliest) return { from: earliest, to: earliest, empty: true };
    if (from < earliest) return { from: earliest, to };
  }
  return { from, to };
}
