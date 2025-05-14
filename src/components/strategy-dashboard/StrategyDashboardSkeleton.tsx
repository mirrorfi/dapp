export const StrategyDashboardSkeleton = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background/95 to-blue-950/20 text-foreground">
      <main className="p-6">
        {/* Header Skeleton */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-24">
                <div className="h-full rounded-full border-gray-600 border-2 bg-card overflow-hidden">
                  <div className="w-full h-full animate-pulse bg-muted" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-20">
              <div className="h-full rounded-full border-gray-600 border-2 bg-card overflow-hidden">
                <div className="w-full h-full animate-pulse bg-muted" />
              </div>
            </div>
            <div className="h-8 w-32">
              <div className="h-full rounded-full border-gray-600 border-2 bg-card overflow-hidden">
                <div className="w-full h-full animate-pulse bg-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* Grid View Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="overflow-hidden border-none backdrop-blur-sm relative min-h-[300px] rounded-lg bg-card"
            >
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-transparent h-32">
                  <div className="flex flex-col mt-3 px-5">
                    <div className="flex items-center justify-between w-full mb-4">
                      <div className="h-6 w-32 rounded-md overflow-hidden">
                        <div className="w-full h-full animate-pulse bg-muted" />
                      </div>
                      <div className="h-6 w-20 rounded-md overflow-hidden">
                        <div className="w-full h-full animate-pulse bg-muted" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((j) => (
                          <div
                            key={j}
                            className="w-6 h-6 rounded-full overflow-hidden"
                          >
                            <div className="w-full h-full animate-pulse bg-muted" />
                          </div>
                        ))}
                      </div>
                      <div className="h-6 w-16 rounded-full overflow-hidden">
                        <div className="w-full h-full animate-pulse bg-muted" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-x-0 top-[60px] bottom-0">
                <div className="w-full h-full animate-pulse bg-muted/20" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
