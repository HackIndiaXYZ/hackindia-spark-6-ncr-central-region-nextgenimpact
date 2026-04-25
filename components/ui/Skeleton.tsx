export function SkeletonCard() {
  return (
    <div className="rounded-xl bg-bg-card border border-border p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-md" />
      </div>
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="skeleton h-16 w-full rounded" />
      <div className="flex gap-2">
        <div className="skeleton h-8 w-28 rounded-lg" />
        <div className="skeleton h-8 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="rounded-xl bg-bg-card border border-border p-5 animate-pulse">
      <div className="skeleton h-8 w-16 rounded mb-2" />
      <div className="skeleton h-4 w-24 rounded mb-1" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  );
}
