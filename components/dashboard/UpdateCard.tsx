"use client";
import Link from "next/link";
import { Update } from "@/lib/data";
import { PriorityBadge, Tag } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

// Extended type for AI-classified updates from RSS feed
interface AIUpdate extends Update {
  aiPowered?: boolean;
  roleImpact?: string;
  aiReason?: string;
}

interface UpdateCardProps {
  update: AIUpdate;
  onToggleRead: (id: string) => void;
}

export default function UpdateCard({ update, onToggleRead }: UpdateCardProps) {
  const { showToast } = useToast();
  const borderColors = { critical: "border-red-500", high: "border-orange-500", normal: "border-gray-500" };

  const handleToggleRead = () => {
    onToggleRead(update.id);
    showToast(update.isRead ? "Marked as unread" : "✓ Marked as read", update.isRead ? "info" : "success", update.isRead ? "↩" : "✓");
  };

  return (
    <article
      className={`rounded-xl bg-bg-card border-l-4 border border-border hover:bg-bg-hover transition-all duration-200 p-5 ${borderColors[update.priority]} ${update.isRead ? "opacity-70" : ""}`}
      aria-label={`${update.priority} priority update: ${update.title}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center flex-wrap gap-2">
          <PriorityBadge priority={update.priority} />
          {update.roles.map((r) => <Tag key={r} label={r} variant="role" />)}
          {update.services.slice(0, 2).map((s) => <Tag key={s} label={s} />)}
          {/* AI Powered badge */}
          {update.aiPowered && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30"
              title={update.aiReason || "Priority classified by AI"}
            >
              ✦ AI Classified
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!update.isRead && (
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 flex-shrink-0" aria-label="Unread" />
          )}
        </div>
      </div>

      {/* Role Impact (AI-generated) */}
      {update.roleImpact && (
        <div className="mb-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-1.5">
          <span className="mt-0.5 flex-shrink-0">🎯</span>
          <span>{update.roleImpact}</span>
        </div>
      )}

      {/* Title */}
      <h3 className="text-base font-bold text-text-primary leading-snug mb-1.5">
        <Link href={`/updates/${update.id}`} className="hover:text-accent-orange transition-colors">
          {update.title}
        </Link>
      </h3>

      {/* Date */}
      <p className="text-xs text-text-secondary mb-3">{update.date} · {update.timeAgo}</p>

      {/* Summary */}
      <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-3">{update.summary}</p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-bg-hover border border-border text-xs font-medium text-text-secondary hover:text-text-primary transition-all"
            aria-label={update.isRead ? "Mark as unread" : "Mark as read"}
          >
            {update.isRead ? "↩ Mark Unread" : "✓ Mark Read"}
          </button>
          <Link
            href={`/updates/${update.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-accent-orange/10 border border-border hover:border-accent-orange/30 text-xs font-medium text-text-secondary hover:text-accent-orange transition-all"
          >
            → View Details
          </Link>
        </div>
        {update.services[0] && (
          <Tag label={update.services[0]} variant="orange" />
        )}
      </div>
    </article>
  );
}
