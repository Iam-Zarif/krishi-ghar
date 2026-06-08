import PropTypes from "prop-types";

const lineWidths = ["w-3/4", "w-1/2", "w-2/3"];

export const SkeletonBlock = ({ className = "h-4 w-full" }) => (
  <span
    className={`block animate-pulse rounded bg-gray-100 ${className}`}
    aria-hidden="true"
  />
);

const ProductCardSkeleton = ({ action = "button" }) => (
  <div className="h-full rounded-xl border border-gray-200 bg-white">
    <SkeletonBlock className="aspect-[4/3] w-full rounded-t-xl" />
    <div className="space-y-2 p-3">
      <SkeletonBlock className="h-4 w-3/4" />
      <SkeletonBlock className="h-3 w-1/2" />
      <div className="flex items-center justify-between pt-2">
        <SkeletonBlock className="h-5 w-24" />
        {action === "icon" ? (
          <SkeletonBlock className="h-8 w-8 rounded-full" />
        ) : (
          <SkeletonBlock className="h-8 w-20 rounded-full" />
        )}
      </div>
    </div>
  </div>
);

const PageSkeleton = ({ count }) => (
  <div className="min-h-[60vh] bg-[#ffffde2e] pb-16 pt-28">
    <div className="mx-auto max-w-[1200px] px-4 2xl:max-w-[1400px]">
      <div className="rounded-2xl border bg-white p-6 sm:p-8">
        <SkeletonBlock className="h-7 w-48" />
        <SkeletonBlock className="mt-4 h-4 w-3/4" />
        <SkeletonBlock className="mt-2 h-4 w-2/3" />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: count }).map((_, index) => (
            <ProductCardSkeleton key={index} action="none" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ProductDetailSkeleton = () => (
  <div className="bg-[#ffffde2e] pb-16 pt-24">
    <div className="mx-auto max-w-[1200px] px-4 2xl:max-w-[1400px]">
      <SkeletonBlock className="mb-4 h-4 w-40" />
      <div className="grid gap-8 lg:grid-cols-2">
        <SkeletonBlock className="h-80 rounded-2xl md:h-[26rem]" />
        <div className="space-y-4">
          <SkeletonBlock className="h-8 w-2/3" />
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-10 w-1/2" />
          <SkeletonBlock className="h-32 w-full" />
        </div>
      </div>
    </div>
  </div>
);

const ReviewSkeleton = ({ count }) => (
  <div className="space-y-4" aria-busy="true">
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-green/5 p-3">
      <SkeletonBlock className="h-4 w-20" />
      <SkeletonBlock className="h-7 w-12" />
      <SkeletonBlock className="h-4 w-28" />
    </div>

    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border p-3">
          <div className="flex items-center justify-between gap-2">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-3 w-16" />
          </div>
          {lineWidths.map((width) => (
            <SkeletonBlock key={width} className={`mt-3 h-3 ${width}`} />
          ))}
        </div>
      ))}
    </div>

    <div className="rounded-xl border bg-gray-50 p-4">
      <SkeletonBlock className="h-5 w-28" />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SkeletonBlock className="h-10 bg-white" />
        <SkeletonBlock className="h-10 bg-white" />
      </div>
      <SkeletonBlock className="mt-3 h-28 bg-white" />
      <SkeletonBlock className="mt-3 h-10 w-32" />
    </div>
  </div>
);

const ResellerCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <SkeletonBlock className="h-48 w-full rounded-none bg-gray-200" />
    <div className="space-y-3 p-4">
      <SkeletonBlock className="h-4 w-2/3 bg-gray-200" />
      <SkeletonBlock className="h-3 w-1/3 bg-gray-200" />
      <SkeletonBlock className="h-6 w-24 bg-gray-200" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonBlock className="h-16 rounded-xl" />
        <SkeletonBlock className="h-16 rounded-xl" />
      </div>
    </div>
  </div>
);

const SkeletonLoader = ({ variant = "card", count = 1, action = "button" }) => {
  if (variant === "page") return <PageSkeleton count={count} />;
  if (variant === "product-detail") return <ProductDetailSkeleton />;
  if (variant === "reviews") return <ReviewSkeleton count={count} />;
  if (variant === "reseller-card") return <ResellerCardSkeleton />;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} action={action} />
      ))}
    </>
  );
};

SkeletonBlock.propTypes = {
  className: PropTypes.string,
};

SkeletonLoader.propTypes = {
  variant: PropTypes.oneOf(["card", "page", "product-detail", "reviews", "reseller-card"]),
  count: PropTypes.number,
  action: PropTypes.oneOf(["button", "icon", "none"]),
};

ProductCardSkeleton.propTypes = {
  action: PropTypes.oneOf(["button", "icon", "none"]),
};

PageSkeleton.propTypes = {
  count: PropTypes.number.isRequired,
};

ReviewSkeleton.propTypes = {
  count: PropTypes.number.isRequired,
};

export default SkeletonLoader;
