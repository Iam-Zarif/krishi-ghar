import { Toaster } from "react-hot-toast";
import PropTypes from "prop-types";
import { FaArrowRight, FaChevronLeft, FaSearch } from "react-icons/fa";
import { normalizeApiRole, resellerRoleLabel } from "../../../api/resellerProducts";
import { SkeletonCard, ErrorState } from "./reseller-products/ResellerProductsStates";
import ResellerProductCard from "./reseller-products/ResellerProductCard";
import useResellerApprovedProducts from "./reseller-products/useResellerApprovedProducts";

export default function ResellerApprovedProductsView({
  role,
  viewKey = "producer-products",
}) {
  const apiRole = normalizeApiRole(role);
  const isSupersalerAllProducts =
    apiRole === "supersaler" && viewKey === "all-products";
  const sourceKey = isSupersalerAllProducts ? "own-products" : viewKey;

  const {
    meta,
    search,
    setSearch,
    sort,
    setSort,
    currentPage,
    setPage,
    totalPages,
    total,
    loading,
    loaded,
    error,
    pageItems,
    busyMap,
    handleSell,
    retry,
  } = useResellerApprovedProducts({ role, viewKey, sourceKey });
  const displayMeta =
    apiRole === "wholesaler" && viewKey === "producer-products"
      ? {
          ...meta,
          title: "সুপারসেলারের অনুমোদিত বাল্ক পণ্য",
          empty: "এখনও কোনো সুপারসেলারের অনুমোদিত বাল্ক পণ্য পাওয়া যায়নি",
        }
      : meta;
  const searchPlaceholder =
    apiRole === "wholesaler"
      ? "পণ্য, ক্যাটাগরি বা সুপারসেলার খুঁজুন"
      : "পণ্য, ক্যাটাগরি বা উৎপাদক খুঁজুন";

  return (
    <div className="w-full px-4 pb-16 pt-6">
      <Toaster position="top-right" toastOptions={{ duration: 2600 }} />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">
            {displayMeta.title}
            {!loading ? (
              <span className="ml-2 text-green">({total.toLocaleString("bn-BD")})</span>
            ) : null}
          </h1>
          <span className="rounded-full border border-green/15 bg-green/10 px-3 py-1 text-xs font-medium text-green">
            {resellerRoleLabel(role)}
          </span>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <div className="relative min-w-0 sm:w-72">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-green"
          >
            <option value="latest">নতুন থেকে পুরাতন</option>
            <option value="oldest">পুরাতন থেকে নতুন</option>
            <option value="price_asc">দাম কম থেকে বেশি</option>
            <option value="price_desc">দাম বেশি থেকে কম</option>
            <option value="name_asc">নাম অনুযায়ী</option>
          </select>
        </div>
      </div>

      {error ? <ErrorState message={error} onRetry={retry} /> : null}

      {loading && !loaded ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-gray-800">{displayMeta.empty}</p>
          <p className="mt-2 text-sm text-gray-500">
            {sourceKey === "own-products"
              ? "অ্যাডমিন অনুমোদন করলে আপনার জমা দেওয়া পণ্য এখানে দেখা যাবে।"
              : sourceKey === "all-products"
              ? "যে পণ্যগুলো আপনি ক্রেতাদের জন্য প্রকাশ করবেন, সেগুলো এখানে দেখা যাবে।"
              : "অনুমোদিত পণ্য পাওয়া গেলে এখানে দেখানো হবে।"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((product) => (
              <ResellerProductCard
                key={product._id}
                product={product}
                busy={!!busyMap[product._id]}
                onSell={handleSell}
                showSellAction={meta.showSellAction}
                actionLabel={meta.actionLabel}
                busyLabel={meta.busyLabel}
                doneLabel={meta.doneLabel}
                viewKey={viewKey}
                role={role}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 hover:border-green cursor-pointer"
              >
                <FaChevronLeft className="text-xs" />
                <span>পূর্ববর্তী</span>
              </button>

              <div className="text-sm text-gray-600">
                {currentPage.toLocaleString("bn-BD")} / {totalPages.toLocaleString("bn-BD")}
              </div>

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 hover:border-green cursor-pointer"
              >
                <span>পরবর্তী</span>
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

ResellerApprovedProductsView.propTypes = {
  role: PropTypes.string.isRequired,
  viewKey: PropTypes.string,
};
