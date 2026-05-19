export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border bg-card"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="h-80 animate-pulse rounded-2xl border bg-card lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-2xl border bg-card lg:col-span-3" />
      </div>
    </div>
  );
}
