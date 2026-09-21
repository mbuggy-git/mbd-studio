import { getSessionRole } from "../_lib/auth.js";
import {
  fetchActiveProjectIds,
  fetchUninvoicedSummary,
  fetchUninvoicedTimeEntries,
  validateDateRange,
} from "../_lib/harvest.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const role = getSessionRole(req);
  if (!role) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }

  // Client sessions are locked to the configured client ID; only an admin
  // session may choose a different client via the `client` query param.
  const defaultClientId = process.env.HARVEST_CLIENT_ID ?? "";
  let clientId = defaultClientId;
  if (role === "admin" && req.query?.client != null && req.query.client !== "") {
    const requested = String(req.query.client);
    if (!/^\d+$/.test(requested)) {
      res.status(400).json({ error: "Invalid client id" });
      return;
    }
    clientId = requested;
  }
  if (!clientId) {
    res.status(500).json({ error: "Portal is not configured" });
    return;
  }

  const range = validateDateRange(req.query?.from, req.query?.to, clientId === defaultClientId);
  if ("error" in range) {
    res.status(400).json({ error: range.error });
    return;
  }

  if (range.empty) {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      summary: { hours: 0, amount: 0, currency: "USD" },
      entries: [],
      lastUpdated: new Date().toISOString(),
    });
    return;
  }

  try {
    const activeProjectIds = await fetchActiveProjectIds(clientId);
    const [summary, entries] = await Promise.all([
      fetchUninvoicedSummary(range.from, range.to, activeProjectIds, clientId),
      fetchUninvoicedTimeEntries(range.from, range.to, activeProjectIds, clientId),
    ]);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      summary,
      entries,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Portal uninvoiced fetch failed:", err?.message);
    res.status(502).json({ error: "Could not load time data right now. Please try again shortly." });
  }
}
