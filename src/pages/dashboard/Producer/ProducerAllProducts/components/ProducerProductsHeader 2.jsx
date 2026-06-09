import { FiCheckCircle, FiClock, FiPackage, FiRefreshCw, FiSearch } from "react-icons/fi";
import ProducerProductsSummaryCard from "./ProducerProductsSummaryCard";
import { STATUS_TABS } from "./producerProductConstants";

const ProducerProductsHeader = ({
  activeStatus,
  searchText,
  statusCounts,
  onRefresh,
  onSearchChange,
  onStatusChange,
}) => (
  <div className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-[#f9fff7] to-[#f4fbf2] p-6 shadow-sm">
    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
          <FiPackage className="text-base" />
          পণ্য ব্যবস্থাপনা
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-800">
          বিক্রয়ের জন্য সব পণ্য
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          আপনার সব পণ্য এক জায়গায় দেখুন, স্ট্যাটাস অনুযায়ী বাছাই করুন,
          এডিট করুন এবং অ্যাডমিন অনুমোদনের অবস্থা ট্র্যাক করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[540px]">
        <ProducerProductsSummaryCard
          icon={FiPackage}
          title="মোট পণ্য"
          value={statusCounts.all}
          accentClass="bg-emerald-50 text-emerald-600"
        />
        <ProducerProductsSummaryCard
          icon={FiClock}
          title="অপেক্ষমাণ"
          value={statusCounts.pending}
          accentClass="bg-amber-50 text-amber-600"
        />
        <ProducerProductsSummaryCard
          icon={FiCheckCircle}
          title="অনুমোদিত"
          value={statusCounts.approved}
          accentClass="bg-green-50 text-green-600"
        />
      </div>
    </div>

    <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap gap-3">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStatus === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusChange(tab.key)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
                isActive ? tab.activeClass : tab.inactiveClass
              }`}
            >
              <Icon className="text-base" />
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {statusCounts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-[280px]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="পণ্যের নাম, ক্যাটাগরি বা বিবরণ খুঁজুন"
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 shadow-sm outline-none transition focus:border-emerald-300"
          />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer"
        >
          <FiRefreshCw className="text-base" />
          রিফ্রেশ
        </button>
      </div>
    </div>
  </div>
);

export default ProducerProductsHeader;
