import { getSessionRole } from "../_lib/auth.js";
import { fetchActiveProjectIds, fetchToDateTaskTotals } from "../_lib/harvest.js";

// Project-to-date totals per task: all billable time, invoiced and not.
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

  // The pre-hourly fixed-price era only applies to the default client.
  const earliest = process.env.PORTAL_EARLIEST_DATE;
  const from =
    clientId === defaultClientId && earliest && /^\d{4}-\d{2}-\d{2}$/.test(earliest)
      ? earliest
      : undefined;

  try {
    const activeProjectIds = await fetchActiveProjectIds(clientId);
    const totals = await fetchToDateTaskTotals(activeProjectIds, clientId, from);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ ...totals, lastUpdated: new Date().toISOString() });
  } catch (err: any) {
    console.error("Portal to-date fetch failed:", err?.message);
    res.status(502).json({ error: "Could not load project totals right now. Please try again shortly." });
  }
}
