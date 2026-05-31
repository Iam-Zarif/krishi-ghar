import { useState } from "react";
import { ProductSkeleton } from "./ProductSkeleton";
import { Link } from "react-router-dom";
import { CiHeart } from "react-icons/ci";
import { Rating } from "@smastrom/react-rating";
import { IoIosArrowForward } from "react-icons/io";


const LatestProducts = ({ latestProducts, loadingProds, handleWishlist }) => {
  const [latestVisibleCount, setLatestVisibleCount] = useState(10);
  return (
    <div className="pt-12 lg:pt-24 max-w-7xl mx-auto w-full px-4 ">
      <h2 className="text-xl lg:text-3xl font-medium text-gray-800 mb-6">
         সর্বশেষ পণ্যসমূহ
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 lg:gap-4">
        {(loadingProds
          ? Array.from({ length: latestVisibleCount })
          : latestProducts.slice(0, latestVisibleCount)
        ).map((p, i) => {
          if (loadingProds) {
            return (
              <div
                key={i}
                className="relative bg-white cursor-pointer border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <ProductSkeleton />
              </div>
            );
          }

          return (
            <Link
              key={p.postId || p.id || i}
              to={p.linkTo || `/products/${p.id}`}
              aria-label={p.productName || p.name || "Product"}
              className="relative block bg-white cursor-pointer border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <CiHeart
                onClick={handleWishlist}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleWishlist(e);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="ইচ্ছেতালিকায় যোগ করুন"
                className="absolute top-2 right-2 md:top-3 md:right-3 bg-white p-1 rounded-full text-2xl md:text-3xl cursor-pointer border"
              />{" "}
              <img
                src={p.image || "https://placehold.co/600x450?text=না+ছবি"}
                alt={p.productName || p.name}
                className="w-full h-36 sm:h-40 md:h-48 object-cover rounded-t-xl"
                loading="lazy"
              />
              <div className="p-3 md:p-4">
                <h3 className="text-sm md:text-md font-semibold text-gray-800 line-clamp-1">
                  {p.productName || p.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-500">
                  {p.category?.name || "বিভাগ"}
                </p>
                <div className="mt-1.5 md:mt-2 flex items-center gap-2">
                  <span className="text-base md:text-lg font-bold text-green-600">
                    ${Number(p.price ?? p.discountPrice ?? 0)}
                  </span>
                  {p.originalPrice && (
                    <span className="text-xs md:text-sm line-through text-gray-400">
                          ৳{Number(p.originalPrice)}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 md:mt-2 flex justify-between items-center text-xs md:text-sm text-gray-500">
                  <span>{(Number(p.sold || 0) / 1000).toFixed(1)} বিক্রি</span>
                  <Rating
                    value={Number(p.rating || 4.2)}
                    readOnly
                    style={{ maxWidth: 80 }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {!loadingProds && latestProducts.length > latestVisibleCount && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setLatestVisibleCount((prev) => prev + 20)}
            className="px-6 flex items-center gap-2 py-2.5 rounded-lg text-white bg-green transition duration-300 shadow-md hover:shadow-yellow-300"
          >
            আরও দেখুন <IoIosArrowForward />
          </button>
        </div>
      )}
    </div>
  );
};

export default LatestProducts
