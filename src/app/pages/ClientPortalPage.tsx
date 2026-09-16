import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface PortalEntry {
  date: string;
  project: string;
  task: string;
  description: string;
  hours: number;
}

interface PortalData {
  summary: { hours: number; amount: number; currency: string };
  entries: PortalEntry[];
  lastUpdated: string;
}

type Preset = "this-month" | "last-month" | "this-year" | "custom";

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function presetRange(preset: Preset): { from: string; to: string } {
  const now = new Date();
  if (preset === "this-month") {
    return { from: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)), to: toISODate(now) };
  }
  if (preset === "last-month") {
    return {
      from: toISODate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      to: toISODate(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  }
  // this-year (default)
  return { from: `${now.getFullYear()}-01-01`, to: toISODate(now) };
}

const CLIENT_NAME = "Design in Mind";

const PRESETS: { key: Preset; label: string }[] = [
  { key: "this-month", label: "This Month" },
  { key: "last-month", label: "Last Month" },
  { key: "this-year", label: "This Year" },
  { key: "custom", label: "Custom" },
];

export function ClientPortalPage() {
  const navigate = useNavigate();
  const defaultRange = useMemo(() => presetRange("this-year"), []);
  const [preset, setPreset] = useState<Preset>("this-year");
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (fromDate: string, toDate: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/portal/uninvoiced?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`
        );
        if (res.status === 401) {
          navigate("/client/login", { replace: true });
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Could not load your hours right now.");
        }
        setData(await res.json());
      } catch (err: any) {
        setError(err?.message ?? "Could not load your hours right now.");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    load(defaultRange.from, defaultRange.to);
  }, [load, defaultRange]);

  function selectPreset(p: Preset) {
    setPreset(p);
    if (p !== "custom") {
      const range = presetRange(p);
      setFrom(range.from);
      setTo(range.to);
      load(range.from, range.to);
    }
  }

  function applyCustomRange(e: React.FormEvent) {
    e.preventDefault();
    const days = (new Date(to).getTime() - new Date(from).getTime()) / 86400000;
    if (!from || !to || new Date(from) > new Date(to)) {
      setError("Please choose a valid date range.");
      return;
    }
    if (days > 365) {
      setError("Date range cannot exceed 365 days.");
      return;
    }
    load(from, to);
  }

  async function handleSignOut() {
    await fetch("/api/portal/logout", { method: "POST" }).catch(() => {});
    navigate("/client/login", { replace: true });
  }

  const currencyFormat = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: data?.summary.currency || "USD",
        maximumFractionDigits: 0,
      }),
    [data?.summary.currency]
  );

  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5928CB] to-[#F65CE1] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/20">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">MBD Studio</h1>
            <p className="text-xs uppercase tracking-[0.2em] text-white/80 mt-0.5">
              Client Portal · Hours &amp; Project Activity
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm font-medium text-white/80 hover:text-white transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-8">{CLIENT_NAME}</h2>

        {/* Date filter */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => selectPreset(p.key)}
              className={
                preset === p.key
                  ? "px-3.5 py-1.5 rounded-full text-sm font-bold bg-white text-[#5928CB]"
                  : "px-3.5 py-1.5 rounded-full text-sm font-medium text-white border border-white/40 hover:border-white transition"
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <form onSubmit={applyCustomRange} className="flex flex-wrap items-end gap-3 mb-8">
            <div>
              <label htmlFor="from-date" className="block text-xs font-medium text-white/80 mb-1">
                From
              </label>
              <input
                id="from-date"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg bg-white border border-white px-3 py-2 text-sm text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="to-date" className="block text-xs font-medium text-white/80 mb-1">
                To
              </label>
              <input
                id="to-date"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-lg bg-white border border-white px-3 py-2 text-sm text-gray-900"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-2 text-sm text-[#5928CB] font-bold hover:bg-white/90 transition"
            >
              Apply
            </button>
          </form>
        )}

        {error && (
          <div className="mb-8 rounded-lg bg-white/95 px-4 py-3 text-sm text-red-700 shadow">
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <div className="bg-white rounded-2xl shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-6">
            <p className="text-sm text-gray-500">Current Uninvoiced Hours</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
              {loading ? "—" : `${data?.summary.hours ?? 0} hrs`}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-6">
            <p className="text-sm text-gray-500">Current Uninvoiced Total</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
              {loading ? "—" : currencyFormat.format(data?.summary.amount ?? 0)}
            </p>
          </div>
        </div>

        {/* Time entries */}
        <div className="bg-white rounded-2xl shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-6 sm:p-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Time Entries</h2>
          {data?.lastUpdated && !loading && (
            <p className="text-xs text-gray-400">
              Last updated{" "}
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              }).format(new Date(data.lastUpdated))}
            </p>
          )}
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-gray-400">Loading your hours…</p>
        ) : !data || data.entries.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400 border-t border-gray-100">
            No uninvoiced time in this period.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-400">
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Project</th>
                  <th className="py-3 pr-4 font-medium">Task</th>
                  <th className="py-3 pr-4 font-medium">Description</th>
                  <th className="py-3 text-right font-medium">Hours</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 pr-4 whitespace-nowrap text-gray-600">
                      {dateFormat.format(new Date(`${entry.date}T00:00:00`))}
                    </td>
                    <td className="py-3 pr-4 text-gray-900 font-medium">{entry.project}</td>
                    <td className="py-3 pr-4 text-gray-600">{entry.task}</td>
                    <td className="py-3 pr-4 text-gray-600 max-w-xs">{entry.description}</td>
                    <td className="py-3 text-right text-gray-900 whitespace-nowrap">
                      {entry.hours.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </main>

      <footer className="border-t border-white/20">
        <p className="max-w-4xl mx-auto px-6 py-6 text-center text-xs text-white/70">
          Time tracking powered by Harvest
        </p>
      </footer>
    </div>
  );
}
