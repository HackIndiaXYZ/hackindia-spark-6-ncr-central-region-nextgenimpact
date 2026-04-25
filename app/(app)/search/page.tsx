"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UPDATES } from "@/lib/data";
import { PriorityBadge, Tag } from "@/components/ui/Badge";

const ALL_SERVICES = Array.from(new Set(UPDATES.flatMap((u) => u.services))).sort();

const ALL_ROLES = ["DevOps","Developer","Architect","Data Engineer","SRE","ML Engineer","Security Engineer","FinOps","All Roles"];

const DATE_RANGES = [
  { label: "Today", days: 1 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

const QUICK = ["CodeCommit","Lambda","ECS","S3","SDK","Deprecation","Pricing","EKS","IAM","Bedrock"];
const RECENT_SEARCHES = ["ECS runtime","Java SDK","Lambda Python","GuardDuty","Bedrock Claude"];

function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return <>{parts.map((p, i) => p.toLowerCase() === query.toLowerCase() ? <mark key={i} className="bg-accent-orange/30 text-accent-orange rounded px-0.5">{p}</mark> : p)}</>;
}

function Dropdown({ label, icon, options, selected, onToggle, onClear }: {
  label: string; icon: string; options: string[];
  selected: string[]; onToggle: (v: string) => void; onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  const active = selected.length > 0;
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${active ? "bg-accent-orange/10 border-accent-orange text-accent-orange" : "bg-bg-card border-border text-text-secondary hover:border-text-secondary hover:text-text-primary"}`}>
        <span>{icon}</span>
        <span>{active ? `${label} (${selected.length})` : label}</span>
        <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-bg-card border border-border rounded-xl shadow-2xl min-w-[200px] overflow-hidden">
          {active && (
            <button onClick={() => { onClear(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 border-b border-border">
              ✕ Clear {label}
            </button>
          )}
          <div className="max-h-64 overflow-y-auto">
            {options.map(opt => {
              const sel = selected.includes(opt);
              return (
                <button key={opt} onClick={() => onToggle(opt)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all text-left ${sel ? "bg-accent-orange/10 text-accent-orange" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"}`}>
                  <span>{opt}</span>
                  {sel && <span className="text-accent-orange text-xs font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DateDropdown({ selected, onSelect, onClear }: { selected: number | null; onSelect: (d: number) => void; onClear: () => void; }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  const label = DATE_RANGES.find(d => d.days === selected)?.label;
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${selected ? "bg-accent-orange/10 border-accent-orange text-accent-orange" : "bg-bg-card border-border text-text-secondary hover:border-text-secondary hover:text-text-primary"}`}>
        <span>📅</span>
        <span>{label || "Date Range"}</span>
        <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-bg-card border border-border rounded-xl shadow-2xl min-w-[180px] overflow-hidden">
          {selected && (
            <button onClick={() => { onClear(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 border-b border-border">
              ✕ Clear Date Range
            </button>
          )}
          {DATE_RANGES.map(d => (
            <button key={d.days} onClick={() => { onSelect(d.days); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all ${selected === d.days ? "bg-accent-orange/10 text-accent-orange" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"}`}>
              <span>{d.label}</span>
              {selected === d.days && <span className="text-accent-orange text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [days, setDays] = useState<number | null>(null);
  const [sort, setSort] = useState<"relevance"|"date">("relevance");
  const [liveResults, setLiveResults] = useState<typeof UPDATES>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [showLive, setShowLive] = useState(false);

  // Fetch live RSS results when query changes
  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setLiveResults([]);
      return;
    }
    const role = localStorage.getItem("aws_pulse_role") || "DevOps";
    setLiveLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/aws-updates?role=${encodeURIComponent(role)}&all=true&ai=false`);
        const data = await res.json();
        if (data.updates?.length > 0) {
          const q = query.toLowerCase();
          const matched = data.updates
            .filter((u: Record<string, string>) =>
              u.title?.toLowerCase().includes(q) ||
              u.summary?.toLowerCase().includes(q) ||
              u.category?.toLowerCase().includes(q)
            )
            .slice(0, 5)
            .map((u: Record<string, string>) => ({
              id: `rss-${u.id}`,
              title: u.title || "",
              date: u.date || "Recent",
              timeAgo: u.timeAgo || "Recently",
              priority: (u.priority as "critical" | "high" | "normal") || "normal",
              roles: [role as never],
              services: [],
              category: u.category || "AWS Update",
              summary: u.summary || "",
              summaryHi: u.summary || "",
              summaryHg: u.summary || "",
              originalContent: "",
              isRead: false,
              isBookmarked: false,
              views: 0,
              sourceUrl: u.link || "https://aws.amazon.com/new/",
            }));
          setLiveResults(matched);
          setShowLive(matched.length > 0);
        }
      } catch { /* ignore */ }
      finally { setLiveLoading(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const hasFilters = services.length > 0 || priorities.length > 0 || roles.length > 0 || days !== null;
  const isSearching = query.trim() || hasFilters;

  const results = UPDATES.filter(u => {
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!u.title.toLowerCase().includes(q) && !u.summary.toLowerCase().includes(q) &&
          !u.services.some(s => s.toLowerCase().includes(q)) && !u.category.toLowerCase().includes(q)) return false;
    }
    if (services.length > 0 && !u.services.some(s => services.includes(s))) return false;
    if (priorities.length > 0 && !priorities.includes(u.priority)) return false;
    if (roles.length > 0 && !u.roles.some(r => roles.includes(r))) return false;
    if (days !== null) {
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
      const d = new Date(u.date);
      if (!isNaN(d.getTime()) && d < cutoff) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sort === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
    const p = { critical: 0, high: 1, normal: 2 };
    return p[a.priority] - p[b.priority];
  });

  const clearAll = () => { setServices([]); setPriorities([]); setRoles([]); setDays(null); setQuery(""); setLiveResults([]); };

  const PRIORITY_OPTS = [
    { val: "critical", label: "🔴 Critical" },
    { val: "high",     label: "🟠 High" },
    { val: "normal",   label: "⚪ Normal" },
  ];

  return (
    <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Search</h1>

      {/* Search bar */}
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-lg">🔍</span>
        <input type="search" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search AWS updates, services, features..."
          className="w-full bg-bg-card border-2 border-border focus:border-accent-orange rounded-xl pl-12 pr-12 py-4 text-text-primary placeholder-text-secondary/50 focus:outline-none transition-all text-base shadow-lg"
          autoFocus />
        {query && (
          <button onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary w-6 h-6 flex items-center justify-center rounded-full hover:bg-bg-hover transition-all">✕</button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Dropdown label="Service" icon="🔧" options={ALL_SERVICES} selected={services}
          onToggle={v => toggle(services, v, setServices)} onClear={() => setServices([])} />
        <Dropdown label="Priority" icon="⚡"
          options={PRIORITY_OPTS.map(p => p.label)}
          selected={priorities.map(p => PRIORITY_OPTS.find(o => o.val === p)?.label || p)}
          onToggle={v => { const raw = PRIORITY_OPTS.find(o => o.label === v)?.val || v; toggle(priorities, raw, setPriorities); }}
          onClear={() => setPriorities([])} />
        <DateDropdown selected={days} onSelect={setDays} onClear={() => setDays(null)} />
        <Dropdown label="Role" icon="👤" options={ALL_ROLES} selected={roles}
          onToggle={v => toggle(roles, v, setRoles)} onClear={() => setRoles([])} />
        {hasFilters && (
          <button onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all">
            ✕ Clear all
          </button>
        )}
        {isSearching && (
          <div className="ml-auto flex items-center bg-bg-card border border-border rounded-lg p-0.5 gap-0.5">
            {(["relevance","date"] as const).map(s => (
              <button key={s} onClick={() => setSort(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${sort === s ? "bg-accent-orange text-white" : "text-text-secondary hover:text-text-primary"}`}>
                {s === "relevance" ? "⭐ Relevance" : "📅 Date"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-5">
          {services.map(s => (
            <span key={s} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs text-blue-400 font-medium">
              🔧 {s} <button onClick={() => setServices(services.filter(x => x !== s))}>✕</button>
            </span>
          ))}
          {priorities.map(p => (
            <span key={p} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs text-orange-400 font-medium">
              {p === "critical" ? "🔴" : p === "high" ? "🟠" : "⚪"} {p}
              <button onClick={() => setPriorities(priorities.filter(x => x !== p))}>✕</button>
            </span>
          ))}
          {roles.map(r => (
            <span key={r} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs text-purple-400 font-medium">
              👤 {r} <button onClick={() => setRoles(roles.filter(x => x !== r))}>✕</button>
            </span>
          ))}
          {days && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-xs text-green-400 font-medium">
              📅 {DATE_RANGES.find(d => d.days === days)?.label}
              <button onClick={() => setDays(null)}>✕</button>
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {!isSearching && (
        <>
          <div className="mb-6">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {QUICK.map(q => (
                <button key={q} onClick={() => setQuery(q)}
                  className="px-3 py-1.5 bg-bg-card border border-border rounded-full text-sm text-text-secondary hover:border-accent-orange hover:text-accent-orange transition-all">{q}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Recent searches</p>
            <div className="space-y-1">
              {RECENT_SEARCHES.map(r => (
                <button key={r} onClick={() => setQuery(r)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-bg-card transition-all text-left">
                  <span className="text-text-secondary text-sm">🕐</span>
                  <span className="text-sm text-text-secondary">{r}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Results */}
      {isSearching && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-secondary">
              <span className="text-text-primary font-semibold">{results.length} result{results.length !== 1 ? "s" : ""}</span>
              {query && <> for &quot;<span className="text-accent-orange">{query}</span>&quot;</>}
              {hasFilters && <span className="text-text-secondary/60"> · filtered</span>}
              {showLive && liveResults.length > 0 && (
                <span className="text-green-400 ml-2">+ {liveResults.length} live from AWS</span>
              )}
            </p>
          </div>

          {/* Live RSS Results */}
          {showLive && liveResults.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-green-400 uppercase tracking-wider">🟢 Live from AWS RSS</span>
                <div className="h-px flex-1 bg-green-500/20" />
              </div>
              <div className="space-y-2">
                {liveResults.map((u) => (
                  <a key={u.id} href={u.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="block bg-bg-card border border-green-500/20 rounded-xl p-4 hover:bg-bg-hover hover:border-green-500/40 transition-all group">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.priority === "critical" ? "bg-red-500/10 text-red-400 border border-red-500/20" : u.priority === "high" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-gray-500/10 text-gray-400 border border-gray-500/20"}`}>
                        {u.priority === "critical" ? "🔴" : u.priority === "high" ? "🟠" : "⚪"} {u.priority}
                      </span>
                      <span className="text-xs text-green-400 font-medium">📡 Live</span>
                      <span className="text-xs text-text-secondary">{u.category}</span>
                    </div>
                    <h3 className="text-sm font-bold text-text-primary mb-1 leading-snug group-hover:text-accent-orange transition-colors">
                      {highlight(u.title, query)}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2">{highlight(u.summary, query)}</p>
                    <p className="text-xs text-text-secondary mt-1">{u.timeAgo} · ↗ aws.amazon.com</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Live loading indicator */}
          {liveLoading && query.length >= 3 && (
            <div className="flex items-center gap-2 mb-4 text-xs text-text-secondary">
              <span className="animate-spin">⟳</span> Searching live AWS updates…
            </div>
          )}

          {/* Static results */}
          {results.length === 0 && !liveLoading ? (
            <div className="text-center py-16 bg-bg-card rounded-xl border border-border">
              <span className="text-4xl mb-4 block">🔍</span>
              <p className="text-text-primary font-semibold mb-1">No results found</p>
              <p className="text-text-secondary text-sm mb-4">Try different keywords or remove some filters</p>
              <button onClick={clearAll} className="px-4 py-2 bg-accent-orange text-white rounded-lg text-sm font-semibold">Clear all filters</button>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map(u => (
                <Link key={u.id} href={`/updates/${u.id}`}
                  className="block bg-bg-card border border-border rounded-xl p-5 hover:bg-bg-hover hover:border-accent-orange/30 transition-all group">
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    <PriorityBadge priority={u.priority} />
                    {u.services.slice(0, 3).map(s => <Tag key={s} label={s} />)}
                    {u.roles.slice(0, 2).map(r => <Tag key={r} label={r} variant="role" />)}
                  </div>
                  <h3 className="text-base font-bold text-text-primary mb-1.5 leading-snug group-hover:text-accent-orange transition-colors">
                    {highlight(u.title, query)}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed mb-3">
                    {highlight(u.summary, query)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span>📅 {u.date}</span>
                    <span>·</span>
                    <span>📂 {u.category}</span>
                    <span>·</span>
                    <span>👁️ {u.views.toLocaleString()} views</span>
                    {u.actionRequired && <><span>·</span><span className="text-red-400 font-medium">⚠️ Action required</span></>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
