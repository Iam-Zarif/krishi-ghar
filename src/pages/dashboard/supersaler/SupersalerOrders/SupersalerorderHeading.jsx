/* eslint-disable react/prop-types */
import { Toaster } from "react-hot-toast";
import { FaSearch } from "react-icons/fa";
import { LuRefreshCw } from "react-icons/lu";


const SupersalerorderHeading = ({ showSkeleton, pagination, search, setSearch, sort, setSort, limit, setLimit, setPage, loading, setReloadTick }) => {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Toaster position="top-right" toastOptions={{ duration: 2200 }} />

      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-semibold text-gray-800">অর্ডারসমূহ</h2>
        {showSkeleton ? (
          <span className="h-6 w-16 rounded-full bg-emerald-50 border border-emerald-200 animate-pulse" />
        ) : (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            মোট {pagination.totalOrders}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="যেমন ORD-20260505-774590 / স্ট্যাটাস / পণ্য"
            className="w-full rounded-full border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <select
          value={sort}
          onChange={(e) => {
            setPage(1);
            setSort(e.target.value);
          }}
          className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="newest">সাজান: নতুন আগে</option>
          <option value="oldest">সাজান: পুরাতন আগে</option>
          <option value="amount_asc">পরিমাণ: কম → বেশি</option>
          <option value="amount_desc">পরিমাণ: বেশি → কম</option>
        </select>
        <select
          value={limit}
          onChange={(e) => {
            setPage(1);
            setLimit(Number(e.target.value));
          }}
          className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value={10}>প্রতি পৃষ্ঠা: ১০</option>
          <option value={20}>প্রতি পৃষ্ঠা: ২০</option>
          <option value={50}>প্রতি পৃষ্ঠা: ৫০</option>
        </select>
        <button
          onClick={() => setReloadTick((t) => t + 1)}
          className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-gray-50"
          disabled={loading}
          title="রিফ্রেশ"
        >
          <LuRefreshCw className={loading ? "animate-spin" : ""} />
          রিফ্রেশ
        </button>
      </div>
    </div>
  );
};

export default SupersalerorderHeading;
