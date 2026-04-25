"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { UPDATES, Priority } from "@/lib/data";
import { PriorityBadge } from "@/components/ui/Badge";
import { getUser } from "@/lib/userStore";

interface TimelineItem {
  time: string;
  id: string;
  title: string;
  role: string;
  priority: Priority;
  isLive?: boolean;
}

interface TimelineDay {
  date: string;
  items: TimelineItem[];
}

// Static fallback data
const STATIC_TIMELINE: TimelineDay[] = [
  {
    date: "April 1, 2026",
    items: [
      { time: "10:00 AM", id: "ecs-fargate-deprecation", title: "ECS Runtime Deprecation", role: "DevOps", priority: "critical" },
      { time: "02:00 PM", id: "lambda-streaming-ga", title: "Lambda Streaming GA", role: "Developer", priority: "high" },
    ],
  },
  {
    date: "March 31, 2026",
    items: [
      { time: "09:00 AM", id: "codecommit-frozen", title: "CodeCommit Deprecation", role: "All Roles", priority: "critical" },
      { time: "03:00 PM", id: "data-transfer-cost-reduction", title: "S3 Lifecycle Policy Update", role: "Data Engineer", priority: "normal" },
    ],
  },
  {
    date: "March 30, 2026",
    items: [
      { time: "11:00 AM", id: "eks-129-ga", title: "EKS 1.29 Release", role: "DevOps", priority: "high" },
      { time: "04:00 PM", id: "redshift-serverless-price-cut", title: "RDS Aurora MySQL 8.0", role: "Data Engineer", priority: "normal" },
    ],
  },
  {
    date: "March 29, 2026",
    items: [
      { time: "08:00 AM", id: "java-sdk-v1-eol", title: "Java SDK v1 End of Support", role: "Developer", priority: "critical" },
      { time: "01:00 PM", id: "cloudwatch-logs-insights", title: "CloudWatch Logs Insights Update", role: "DevOps", priority: "normal" },
    ],
  },
];

// Also use static UPDATES for additional timeline items
const STATIC_ITEMS: TimelineDay[] = (() => {
  const grouped: Record<string, TimelineItem[]> = {};
  UPDATES.forEach((u) => {
    if (!grouped[u.date]) grouped[u.date] = [];
    grouped[u.date].push({
      time: "12:00 PM",
      id: u.id,
      title: u.title.length > 50 ? u.title.slice(0, 50) + "…" : u.title,
      role: u.roles[0] || "All Roles",
      priority: u.priority,
    });
  });
  return Object.entries(grouped).map(([date, items]) => ({ date, items }));
})();

const dotColors = {
  critical: "bg-red-500 ring-red-500/30",
  high: "bg-orange-500 ring-orange-500/30",
  normal: "bg-gray-500 ring-gray-500/30",
};

export default function TimelinePage() {
  const [filter, setFilter] = useState<"all" | Priority>("all");
  const [timelineData, setTimelineData] = useState<TimelineDay[]>(STATIC_TIMELINE);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const [userRole, setUserRole] = useState("DevOps");

  useEffect(() => {
    const user = getUser();
    const role = user?.role || localStorage.getItem("aws_pulse_role") || "DevOps";
    setUserRole(role);

    const fetchLiveTimeline = async () => {
      try {
        const res = await fetch(`/api/aws-updates?role=${encodeURIComponent(role)}&all=true&ai=false`);
        const data = await res.json();

        if (data.updates?.length > 0) {
          // Group live updates by date
          const grouped: Record<string, TimelineItem[]> = {};
          data.updates.forEach((item: Record<string, string>) => {
            const date = item.date || "Recent";
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push({
              time: new Date(item.pubDate || Date.now()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              id: `rss-${item.id}`,
              title: (item.title || "").length > 55 ? (item.title || "").slice(0, 55) + "…" : (item.title || ""),
              role: role,
              priority: (item.priority as Priority) || "normal",
              isLive: true,
            });
          });

          const liveDays: TimelineDay[] = Object.entries(grouped)
            .map(([date, items]) => ({ date, items }))
            .slice(0, 7); // Show last 7 days

          setLiveCount(data.updates.length);
          // Merge live + static, live first
          setTimelineData([...liveDays, ...STATIC_ITEMS.slice(0, 3)]);
        } else {
          setTimelineData(STATIC_TIMELINE);
        }
      } catch {
        setTimelineData(STATIC_TIMELINE);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveTimeline();
  }, []);

  const filtered = timelineData
    .map((day) => ({
      ...day,
      items: day.items.filter((i) => filter === "all" || i.priority === filter),
    }))
    .filter((day) => day.items.length > 0);

  const criticalCount = timelineData.flatMap((d) => d.items).filter((i) => i.priority === "critical").length;

  return (
    <div className="px-4 lg:px-6 py-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Timeline</h1>
          <p className="text-sm text-text-secondary mt-1">
            {loading ? "Loading live updates…" : (
              liveCount > 0
                ? <><span className="text-green-400 font-semibold">✓ {liveCount} live</span> AWS updates for <span className="text-accent-orange font-semibold">{userRole}</span></>
                : "Showing recent AWS updates"
            )}
          </p>
        </div>
        {criticalCount > 0 && !loading && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 pulse-dot" />
            <span className="text-xs font-semibold text-red-400">{criticalCount} critical</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(["all", "critical", "high", "normal"] as const).map((f) => {
          const labels = { all: "All", critical: "🔴 Critical", high: "🟠 High", normal: "⚪ Normal" };
          const count = f === "all"
            ? timelineData.flatMap((d) => d.items).length
            : timelineData.flatMap((d) => d.items).filter((i) => i.priority === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === f ? "bg-accent-orange/10 border-accent-orange text-accent-orange" : "border-border text-text-secondary hover:border-text-secondary"}`}
              aria-pressed={filter === f}
            >
              {labels[f]} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-border" />
                <div className="h-6 w-32 bg-bg-card rounded-full" />
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-3 pl-4">
                {Array(2).fill(0).map((_, j) => (
                  <div key={j} className="flex items-start gap-4">
                    <div className="w-20 flex flex-col items-center gap-1">
                      <div className="h-3 w-14 bg-bg-card rounded" />
                      <div className="w-3 h-3 rounded-full bg-bg-card" />
                    </div>
                    <div className="flex-1 bg-bg-card border border-border rounded-xl p-4">
                      <div className="h-4 w-3/4 bg-bg-hover rounded mb-2" />
                      <div className="h-3 w-1/2 bg-bg-hover rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      {!loading && (
        <div className="space-y-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-bg-card rounded-xl border border-border">
              <span className="text-4xl mb-4 block">📅</span>
              <p className="text-text-primary font-semibold mb-1">No updates found</p>
              <p className="text-text-secondary text-sm">Try changing the filter</p>
            </div>
          ) : (
            filtered.map((day) => (
              <div key={day.date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider px-3 py-1 bg-bg-card border border-border rounded-full">
                    {day.date}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-3 pl-4">
                  {day.items.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 flex-shrink-0 w-20">
                        <span className="text-xs text-text-secondary font-medium">{item.time}</span>
                        <div
                          className={`w-3 h-3 rounded-full ring-4 ${dotColors[item.priority]} ${item.priority === "critical" ? "pulse-dot" : ""}`}
                          aria-hidden="true"
                        />
                      </div>
                      <Link
                        href={item.isLive ? `/updates/rss-${item.id.replace("rss-", "")}` : `/updates/${item.id}`}
                        className="flex-1 bg-bg-card border border-border rounded-xl p-4 hover:bg-bg-hover hover:border-accent-orange/30 transition-all"
                      >
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <PriorityBadge priority={item.priority} />
                          <span className="text-xs text-text-secondary">{item.role}</span>
                          {item.isLive && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-semibold">
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
