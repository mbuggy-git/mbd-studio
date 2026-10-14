import { resolvePortalClient } from "../_lib/accounts.js";
import {
  fetchActiveProjects,
  fetchUninvoicedSummary,
  fetchUninvoicedTimeEntries,
  scopeProjectIds,
  validateDateRange,
} from "../_lib/harvest.js";

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

  const range = validateDateRange(req.query?.from, req.query?.to, earliestDate);
  if ("error" in range) {
    res.status(400).json({ error: range.error });
    return;
  }

  try {
    // `projects` (all of the client's active projects) feeds the project filter.
    const projects = await fetchActiveProjects(clientId);
    const projectIds = scopeProjectIds(new Set(projects.map((p) => p.id)), req.query?.project);
    if (!projectIds) {
      res.status(400).json({ error: "Invalid project" });
      return;
    }

    if (range.empty) {
      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({
        summary: { hours: 0, amount: 0, currency: "USD" },
        entries: [],
        projects,
        lastUpdated: new Date().toISOString(),
      });
      return;
    }

    const [summary, entries] = await Promise.all([
      fetchUninvoicedSummary(range.from, range.to, projectIds, clientId),
      fetchUninvoicedTimeEntries(range.from, range.to, projectIds, clientId),
    ]);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      summary,
      entries,
      projects,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Portal uninvoiced fetch failed:", err?.message);
    res.status(502).json({ error: "Could not load time data right now. Please try again shortly." });
  }
}
