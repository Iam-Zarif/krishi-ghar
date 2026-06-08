import { useEffect, useMemo, useRef, useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const loadingItems = Array.from({ length: 8 });

const getPerView = (width) => {
  if (width >= 1280) return 5;
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  if (width >= 640) return 2;
  return 1.2;
};

const getGap = (width) => {
  if (width >= 1280) return 18;
  if (width >= 768) return 16;
  if (width >= 640) return 14;
  return 12;
};

const DealCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="h-44 animate-pulse bg-gray-100" />
    <div className="space-y-2 p-3.5">
      <div className="h-4 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
      <div className="h-5 w-1/2 animate-pulse rounded bg-gray-100" />
    </div>
  </div>
);

const getStatusBadge = (status) => {
  if (status === "pending") {
    return {
      label: "অপেক্ষমাণ",
      className: "bg-amber-50 text-amber-700 border border-amber-200",
    };
  }

  if (status === "rejected") {
    return {
      label: "বাতিল",
      className: "bg-red-50 text-red-700 border border-red-200",
    };
  }

  if (status === "approved") {
    return {
      label: "অনুমোদিত",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    };
  }

  return null;
};

const DealRating = ({ rating }) => {
  const filled = Math.max(0, Math.min(5, Math.round(Number(rating || 0))));

  return (
    <div className="mt-3 flex items-center gap-1 text-[15px] text-amber-400">
      {Array.from({ length: 5 }).map((_, index) =>
        index < filled ? <AiFillStar key={index} /> : <AiOutlineStar key={index} />,
      )}
    </div>
  );
};

const DealCard = ({ product }) => {
  const statusBadge = getStatusBadge(product.status);

  return (
    <Link to={`/products/${product.id}`} className="block h-full w-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative">
          <img
            src={product.image || "https://placehold.co/600x450?text=না+ছবি"}
            alt={product.name}
            className="h-44 w-full object-cover"
            loading="lazy"
          />
          <span className="absolute left-3 top-3 inline-flex rounded-full border border-white/80 bg-white/95 px-3 py-1 text-[11px] font-medium text-gray-700 shadow-sm">
            {product.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-3.5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {statusBadge ? (
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
            ) : null}
          </div>

          <h3 className="min-h-[40px] line-clamp-2 text-sm font-semibold leading-5 text-gray-800">
            {product.name}
          </h3>

          <div className="mt-auto pt-2">
            <div className="flex items-end gap-2">
              <span className="text-[1.65rem] font-extrabold leading-none text-green">
                ৳{Number(product.discountPrice || 0)}
              </span>
              <span className="pb-0.5 text-sm text-gray-400 line-through">
                ৳{Number(product.originalPrice || 0)}
              </span>
            </div>
            <div className="mt-2">
              <DealRating rating={product.rating} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

const TodaysBestDeal = ({ bestDeals, loadingProds }) => {
  const items = loadingProds ? loadingItems : bestDeals;
  const viewportRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return undefined;

    const measure = () => setViewportWidth(node.clientWidth || 0);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const perView = useMemo(() => getPerView(viewportWidth), [viewportWidth]);
  const gap = useMemo(() => getGap(viewportWidth), [viewportWidth]);
  const integerPerView = Math.max(1, Math.floor(perView));
  const step = integerPerView >= 5 ? 2 : 1;
  const maxIndex = Math.max(0, items.length - integerPerView);
  const slideWidth =
    viewportWidth > 0
      ? (viewportWidth - gap * (perView - 1)) / perView
      : 0;
  const translateX = currentIndex * (slideWidth + gap);
  const canSlide = !loadingProds && items.length > integerPerView;

  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (!canSlide) return undefined;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : Math.min(prev + step, maxIndex)));
    }, 4000);

    return () => window.clearInterval(interval);
  }, [canSlide, maxIndex, step]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : Math.max(prev - step, 0)));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : Math.min(prev + step, maxIndex)));
  };

  return (
    <section className="max-w-7xl mx-auto w-full px-4 lg:px-0 pt-6 lg:pt-18">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-xl font-medium text-gray-800 lg:text-3xl">
          🔥 আজকের সেরা অফারসমূহ
        </h2>
      </div>

      <div className="relative">
        {canSlide ? (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-0 top-[38%] z-20 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-yellow-100 cursor-pointer lg:inline-flex"
              aria-label="আগের অফার"
            >
              <FiChevronLeft className="text-2xl text-gray-700" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-0 top-[38%] z-20 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-yellow-100 cursor-pointer lg:inline-flex"
              aria-label="পরের অফার"
            >
              <FiChevronRight className="text-2xl text-gray-700" />
            </button>
          </>
        ) : null}

        <div ref={viewportRef} className="overflow-hidden">
          <div
            className="flex"
            style={{
              gap: `${gap}px`,
              transform: `translate3d(-${translateX}px, 0, 0)`,
              transition: "transform 600ms ease",
            }}
          >
            {items.map((product, index) => (
              <div
                key={loadingProds ? index : product.id}
                className="min-w-0 shrink-0 py-1"
                style={{ width: slideWidth ? `${slideWidth}px` : undefined }}
              >
                {loadingProds ? <DealCardSkeleton /> : product?.id ? <DealCard product={product} /> : <DealCardSkeleton />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TodaysBestDeal;
