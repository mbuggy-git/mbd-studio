import { resolvePortalClient } from "../_lib/accounts.js";
import {
  fetchActiveProjectIds,
  fetchToDateTaskTotals,
  fetchUnpaidInvoices,
  scopeProjectIds,
} from "../_lib/harvest.js";

// Project-to-date totals per task (all billable time, invoiced and not), plus
// unpaid invoices. Neither follows the date filter; both follow the project filter.
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
    const projectIds = scopeProjectIds(await fetchActiveProjectIds(clientId), req.query?.project);
    if (!projectIds) {
      res.status(400).json({ error: "Invalid project" });
      return;
    }
    const projectId = req.query?.project ? Number(req.query.project) : undefined;
    const [totals, unpaid] = await Promise.all([
      fetchToDateTaskTotals(projectIds, clientId, earliestDate),
      // Unpaid is a bonus figure — a token without invoice access shouldn't sink the card.
      fetchUnpaidInvoices(clientId, projectId).catch((err) => {
        console.error("Portal unpaid fetch failed:", err?.message);
        return null;
      }),
    ]);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ ...totals, unpaid, lastUpdated: new Date().toISOString() });
  } catch (err: any) {
    console.error("Portal to-date fetch failed:", err?.message);
    res.status(502).json({ error: "Could not load project totals right now. Please try again shortly." });
  }
}
