/* eslint-disable react/prop-types */
import { FaRegCopy } from "react-icons/fa";
import SupersalerSummary from "./SupersalerSummary";
import toast, { Toaster } from "react-hot-toast";
import { FiMessageCircle } from "react-icons/fi";
import { Api } from "../../../../api/API";

const SupersalerOrderCard = ({ o, items, summary, num, onContact }) => {
  const FallbackImg = "https://placehold.co/80x80?text=না+ছবি";
  const resolveImage = (value) => {
    const path = String(value || "").trim();
    if (!path) return FallbackImg;
    if (/^https?:\/\//i.test(path)) return path;
    return `${Api}/${path.replace(/^\/+/, "")}`;
  };
  const money = (v) => `৳ ${num(v).toLocaleString()}`;
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("কপি করা হয়েছে");
    } catch (err) {
      toast.error("কপি করা যায়নি", err);
    }
  };
  return (
    <div
      key={o.orderId}
      className="relative bg-white/80 backdrop-blur-sm border border-gray-200/70 rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-gray-100">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 tracking-tight">
              #{o.orderId}
            </p>

            <button
              onClick={() => copy(o.orderId)}
              className="text-xs flex items-center gap-1 rounded-full bg-gray-50 border border-gray-200 px-3 py-1 hover:bg-gray-100 transition"
            >
              <FaRegCopy className="text-gray-500" />
              কপি
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {o.orderStatus}
            </span>

            <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              পেমেন্ট: {o.paymentStatus}
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-400">
          {new Date(o.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 leading-relaxed">
        {summary}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <div className="text-sm font-semibold text-gray-900">
            পণ্যসমূহ ({items.length})
          </div>

          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
              এই অর্ডারে কোনো পণ্য নেই
            </div>
          )}

          {items.map((it, idx) => {
            const line = num(it.totalPrice) || num(it.price) * num(it.quantity);

            return (
              <div
                key={`${o.orderId}-${idx}`}
                className="flex items-center gap-4 bg-gray-50 hover:bg-white border border-gray-100 rounded-2xl p-4 transition"
              >
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                  <img
                    src={resolveImage(it.productImage)}
                    alt={it.productName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => (e.currentTarget.src = FallbackImg)}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {idx + 1}. {it.productName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    পরিমাণ {it.quantity} • একক {money(it.price)}
                  </div>
                </div>

                <div className="text-sm font-semibold text-gray-900">
                  {money(line)}
                </div>
              </div>
            );
          })}
        </div>

        <SupersalerSummary
          o={o}
          created={o.createdAt}
          eta={o.eta}
          items={items}
          money={money}
        />
      </div>

      <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onContact}
          className="group inline-flex items-center gap-2 rounded-xl 
      bg-emerald-600 hover:bg-emerald-700 
      text-white text-sm font-medium px-5 py-2.5
      shadow-md hover:shadow-lg
      transition-all duration-300
      active:scale-95 cursor-pointer"
        >
          <FiMessageCircle className="text-base transition-transform group-hover:scale-110" />
          অ্যাডমিনের সাথে যোগাযোগ
        </button>
      </div>
    </div>
  );
};

export default SupersalerOrderCard;
