// Admin-only: list active Harvest clients for the portal's client switcher.
import { getSessionRole } from "../_lib/auth.js";
import { fetchClients } from "../_lib/harvest.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (getSessionRole(req) !== "admin") {
    res.status(401).json({ error: "Not authorized" });
    return;
  }
  try {
    const clients = await fetchClients();
    const defaultId = Number(process.env.HARVEST_CLIENT_ID) || null;
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ clients, defaultId });
  } catch (err: any) {
    console.error("Portal clients fetch failed:", err?.message);
    res.status(502).json({ error: "Could not load the client list right now." });
  }
}
