"use client";
import { Priority } from "@/lib/data";

interface BadgeProps {
  priority: Priority;
  size?: "sm" | "md";
}

export function PriorityBadge({ priority, size = "sm" }: BadgeProps) {
  const config = {
    critical: { label: "CRITICAL", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/40", dot: "bg-red-500" },
    high: { label: "HIGH", bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/40", dot: "bg-orange-500" },
    normal: { label: "NORMAL", bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/40", dot: "bg-gray-500" },
  };
  const c = config[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${priority === "critical" ? "pulse-dot" : ""}`} />
      {c.label}
    </span>
  );
}

interface TagProps {
  label: string;
  variant?: "service" | "role" | "orange";
}

export function Tag({ label, variant = "service" }: TagProps) {
  const styles = {
    service: "bg-gray-700/60 text-gray-300 border-gray-600/40",
    role: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[variant]}`}>
      {label}
    </span>
  );
}
