import Link from "next/link";
import { Priority } from "@/lib/data";
import { PriorityBadge } from "@/components/ui/Badge";

interface TrendingCardProps {
  id: string;
  title: string;
  views: string;
  role: string;
  priority: Priority;
  trend?: string;
}

export default function TrendingCard({ id, title, views, role, priority, trend }: TrendingCardProps) {
  return (
    <Link
      href={`/updates/${id}`}
      className="flex-shrink-0 w-56 bg-bg-card border border-border rounded-xl p-4 hover:bg-bg-hover hover:border-accent-orange/30 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <PriorityBadge priority={priority} />
        {trend && <span className="text-xs text-green-400 font-semibold">↑ {trend}</span>}
      </div>
      <p className="text-sm font-semibold text-text-primary leading-snug mb-2 line-clamp-2">{title}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">{views}</span>
        <span className="text-xs bg-bg-secondary px-2 py-0.5 rounded-md text-text-secondary border border-border">{role}</span>
      </div>
    </Link>
  );
}
