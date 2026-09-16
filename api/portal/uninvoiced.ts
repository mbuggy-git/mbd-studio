import { isAuthenticated } from "../_lib/auth";
import {
  fetchUninvoicedSummary,
  fetchUninvoicedTimeEntries,
  validateDateRange,
} from "../_lib/harvest";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }

  // The client ID comes only from server config — the browser cannot choose it.
  const range = validateDateRange(req.query?.from, req.query?.to);
  if ("error" in range) {
    res.status(400).json({ error: range.error });
    return;
  }

  try {
    const [summary, entries] = await Promise.all([
      fetchUninvoicedSummary(range.from, range.to),
      fetchUninvoicedTimeEntries(range.from, range.to),
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
