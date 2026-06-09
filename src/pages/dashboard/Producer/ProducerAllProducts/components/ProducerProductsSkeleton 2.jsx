const ProducerProductsSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <div
        key={index}
        className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-sm"
      >
        <div className="h-52 animate-pulse bg-gray-100" />
        <div className="space-y-4 p-5">
          <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-16 animate-pulse rounded-2xl bg-gray-100" />
          </div>
          <div className="h-11 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    ))}
  </div>
);

export default ProducerProductsSkeleton;
