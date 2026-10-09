/** Shimmer skeleton blocks. */
export function SkeletonLine({ className = '' }) {
  return <div className={`shimmer h-4 ${className}`} />
}

export function HackathonCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="shimmer !rounded-none h-40" />
      <div className="p-5 space-y-3">
        <SkeletonLine className="w-2/3 !h-6" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-5/6" />
        <div className="flex gap-2 pt-2">
          <div className="shimmer h-6 w-16 !rounded-full" />
          <div className="shimmer h-6 w-20 !rounded-full" />
          <div className="shimmer h-6 w-14 !rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
          <div className="shimmer !rounded-full w-11 h-11 shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="w-1/3" />
            <SkeletonLine className="w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
