export default function HistoryLoading() {
  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 h-16 border-b border-white/[0.06]"
           style={{ background: "rgba(10,15,30,0.8)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="h-8 w-32 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-7 w-20 rounded-full bg-white/[0.06] animate-pulse" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-7 w-52 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-72 rounded bg-white/[0.04] animate-pulse" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
              <div className="h-5 w-5 rounded-md bg-white/[0.06] animate-pulse mx-auto" />
              <div className="h-6 w-12 rounded bg-white/[0.06] animate-pulse mx-auto" />
              <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse mx-auto" />
            </div>
          ))}
        </div>

        {/* Filter bar skeleton */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-3">
          <div className="h-10 w-full rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-7 w-16 rounded-lg bg-white/[0.06] animate-pulse" />
            ))}
          </div>
        </div>

        {/* Record list skeleton */}
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-16 rounded-md bg-white/[0.06] animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-white/[0.06] animate-pulse" />
                  <div className="h-3 w-full rounded bg-white/[0.04] animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-white/[0.04] animate-pulse" />
                  <div className="flex gap-1 pt-1">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-4 w-12 rounded bg-white/[0.04] animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
