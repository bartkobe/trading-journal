interface ChartSkeletonProps {
  height?: number | string;
  title?: boolean;
}

export function ChartSkeleton({ height = 400, title = true }: ChartSkeletonProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className="rounded-lg bg-card border border-border p-6" style={{ height: heightStyle }}>
      <div className="h-full flex flex-col">
        {/* Chart Title Skeleton */}
        {title && <div className="h-5 bg-muted rounded animate-pulse w-1/4 mb-4" />}
        
        {/* Chart Area Skeleton */}
        <div className="flex-1 relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 bg-muted rounded animate-pulse" />
            ))}
          </div>
          
          {/* Chart body */}
          <div className="ml-14 h-full relative">
            <div className="absolute inset-0 bg-muted/20 rounded animate-pulse">
              {/* Simulated bar chart */}
              <div className="h-full flex items-end justify-around px-4 pb-4 gap-2">
                {[60, 80, 40, 70, 50, 90, 45, 75].map((height, i) => (
                  <div
                    key={i}
                    className="bg-muted/40 rounded-t animate-pulse"
                    style={{
                      height: `${height}%`,
                      flex: 1,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* X-axis labels */}
          <div className="ml-14 mt-2 flex justify-between">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 bg-muted rounded animate-pulse w-12" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardSkeletonProps {
  count?: number;
}

export function MetricCardSkeleton({ count = 4 }: MetricCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="h-4 bg-muted rounded animate-pulse w-2/3 mb-3" />
          <div className="h-8 bg-muted rounded animate-pulse w-1/2 mb-2" />
          <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
        </div>
      ))}
    </div>
  );
}

