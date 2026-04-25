"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { UPDATES } from "@/lib/data";
import { useToast } from "@/components/ui/Toast";

interface Alert {
  id: string;
  title: string;
  desc: string;
  time: string;
  level: "critical" | "high";
  isLive?: boolean;
}

// Static fallback alerts
const STATIC_ALERTS: Alert[] = [
  {
    id: "ecs-fargate-deprecation",
    title: "AWS ECS Fargate Runtime Deprecation",
    desc: "ECS tasks using deprecated runtime will stop working after June 30, 2026",
    time: "2h ago",
    level: "critical",
  },
  {
    id: "codecommit-frozen",
    title: "AWS CodeCommit No Longer Available",
    desc: "CodeCommit closed to new customers. Migrate to CodeCatalyst or GitHub.",
    time: "5h ago",
    level: "critical",
  },
  {
    id: "iam-mandatory-mfa",
    title: "AWS IAM Mandatory MFA for Root Accounts",
    desc: "MFA will be enforced for all root accounts from May 2026. Enable now.",
    time: "1d ago",
    level: "critical",
  },
];

export default function CriticalAlertPopup({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>(STATIC_ALERTS);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("DevOps");
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("aws_pulse_role") || "DevOps";
    setUserRole(role);

    const fetchCritical = async () => {
      try {
        const res = await fetch(`/api/aws-updates?role=${encodeURIComponent(role)}&ai=false`);
        const data = await res.json();

        if (data.updates?.length > 0) {
          // Filter only critical/high from live RSS
          const liveAlerts: Alert[] = data.updates
            .filter((u: Record<string, string>) => u.priority === "critical" || u.priority === "high")
            .slice(0, 4)
            .map((u: Record<string, string>) => ({
              id: `rss-${u.id}`,
              title: u.title?.length > 60 ? u.title.slice(0, 60) + "…" : u.title,
              desc: u.summary?.length > 100 ? u.summary.slice(0, 100) + "…" : u.summary,
              time: u.timeAgo || "Recently",
              level: (u.priority === "critical" ? "critical" : "high") as "critical" | "high",
              isLive: true,
            }));

          if (liveAlerts.length > 0) {
            setAlerts(liveAlerts);
            setIsLive(true);
          } else {
            // Fallback to static critical updates from data.ts
            const staticCritical = UPDATES
              .filter((u) => u.priority === "critical")
              .slice(0, 3)
              .map((u) => ({
                id: u.id,
                title: u.title.length > 60 ? u.title.slice(0, 60) + "…" : u.title,
                desc: u.summary.length > 100 ? u.summary.slice(0, 100) + "…" : u.summary,
                time: u.timeAgo,
                level: "critical" as const,
              }));
            setAlerts(staticCritical);
          }
        }
      } catch {
        // Keep static fallback
      } finally {
        setLoading(false);
      }
    };

    fetchCritical();
  }, []);

  const handleDismissAll = () => {
    showToast("Notifications dismissed", "info", "🔕");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="alert-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-bg-card border-2 border-red-500 rounded-2xl shadow-2xl shadow-red-500/20 animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-red-500 text-lg">🔴</span>
              <h2 id="alert-title" className="text-base font-bold text-text-primary">Critical Updates</h2>
              {isLive && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-semibold">
                  LIVE
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary">
              {loading ? "Fetching latest alerts…" : `${alerts.length} unread alerts for ${userRole} Engineers`}
            </p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-bg-hover" aria-label="Close alerts">
            ✕
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="p-4 space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-bg-hover mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-bg-hover rounded mb-2" />
                  <div className="h-3 w-full bg-bg-hover rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alerts list */}
        {!loading && (
          <div className="p-3 space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-bg-hover transition-all">
                <div className="mt-1 flex-shrink-0">
                  <span className={`w-2.5 h-2.5 rounded-full block ${alert.level === "critical" ? "bg-red-500 pulse-dot" : "bg-orange-500"}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary leading-snug">{alert.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{alert.desc}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                  <span className="text-xs text-text-secondary whitespace-nowrap">{alert.time}</span>
                  <Link href={`/updates/${alert.id}`} className="text-xs text-accent-orange hover:underline font-medium whitespace-nowrap">
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-border">
          <button
            onClick={handleDismissAll}
            className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all text-sm font-medium"
          >
            Dismiss All
          </button>
          <Link
            href="/notifications"
            className="flex-1 py-2.5 rounded-lg bg-accent-orange hover:bg-orange-400 text-white text-sm font-semibold text-center transition-all"
          >
            View All Alerts →
          </Link>
        </div>
      </div>
    </div>
  );
}
