import { FaSearch } from "react-icons/fa";

const CartHeader = ({ itemsLength, showSkeleton, search, setSearch, sort, setSort, limit, setLimit }) => {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-semibold text-gray-800">কার্ট</h2>
        {showSkeleton ? (
          <span className="h-6 w-16 rounded-full bg-emerald-50 border border-emerald-200 animate-pulse" />
        ) : (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            মোট {itemsLength}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="কার্টে খুঁজুন"
            className="w-full rounded-full border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="recent">সাজান: সম্প্রতি যোগ করা</option>
          <option value="price_asc">দাম: কম থেকে বেশি</option>
          <option value="price_desc">দাম: বেশি থেকে কম</option>
          <option value="name_asc">নাম: ক → হ</option>
        </select>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value={12}>প্রতি পেইজ: ১২</option>
          <option value={24}>প্রতি পেইজ: ২৪</option>
          <option value={48}>প্রতি পেইজ: ৪৮</option>
        </select>
      </div>
    </div>
  );
};

export default CartHeader;