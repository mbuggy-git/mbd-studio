import { resolvePortalClient } from "../_lib/accounts.js";
import { fetchActiveProjectIds, fetchToDateTaskTotals } from "../_lib/harvest.js";

// Project-to-date totals per task: all billable time, invoiced and not.
export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const resolved = resolvePortalClient(req);
  if ("error" in resolved) {
    res.status(resolved.status).json({ error: resolved.error });
    return;
  }
  const { clientId, earliestDate } = resolved;

  try {
    const activeProjectIds = await fetchActiveProjectIds(clientId);
    const totals = await fetchToDateTaskTotals(activeProjectIds, clientId, earliestDate);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ ...totals, lastUpdated: new Date().toISOString() });
  } catch (err: any) {
    console.error("Portal to-date fetch failed:", err?.message);
    res.status(502).json({ error: "Could not load project totals right now. Please try again shortly." });
  }
}
