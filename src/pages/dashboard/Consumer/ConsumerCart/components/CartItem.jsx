import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

const CartItem = ({ it, dec, inc, removeItem, busyRemove, savingQuantity, priceNum, money }) => {
  const href = `/products/${it.productId}`;
  const lineSubtotal = priceNum(it.price) * (Number(it.quantity) || 0);
  const removing = !!busyRemove[it.productId];
  const isSaving = !!savingQuantity[it.productId];

  return (
    <div className="h-full">
      <div className="bg-white border border-gray-200 rounded-xl h-full flex flex-col">
        <Link to={href} className="block rounded-t-xl overflow-hidden">
          <div className="w-full h-40 bg-gray-100">
            <img
              src={it.image || "https://placehold.co/600x450?text=না+ছবি"}
              alt={it.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/600x450?text=না+ছবি";
              }}
            />
          </div>
        </Link>
        <div className="p-4 bg-gray-50 rounded-b-xl flex-1 flex flex-col min-w-0">
          <Link
            to={href}
            className="text-sm font-semibold text-gray-800 line-clamp-1 min-h-[20px]"
          >
            {it.name}
          </Link>
          <div className="mt-1 text-xs text-gray-500 line-clamp-2 min-h-[34px]">
            {it.description || "—"}
          </div>
          <div className="mt-2 text-gray-700 text-sm">
            ৳ <span className="font-semibold">{money(it.price)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div
              className={`inline-flex items-center rounded-full border bg-white ${
                isSaving ? "opacity-70 pointer-events-none" : ""
              }`}
            >
              <button
                onClick={() => dec(it.productId)}
                className="px-2 py-1 text-lg leading-none"
                aria-label="পরিমাণ কমান"
              >
                −
              </button>
              <span className="px-3 select-none">{it.quantity}</span>
              <button
                onClick={() => inc(it.productId)}
                className="px-2 py-1 text-lg leading-none"
                aria-label="পরিমাণ বাড়ান"
              >
                +
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {isSaving ? (
                <span className="animate-pulse">সংরক্ষণ হচ্ছে…</span>
              ) : (
                <span>
                  সাবটোটাল{" "}
                  <span className="font-medium">৳ {money(lineSubtotal)}</span>
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => removeItem(it.productId)}
              disabled={removing}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                removing
                  ? "opacity-60 pointer-events-none"
                  : "hover:bg-red-50 hover:border-red-300 text-red-700"
              } bg-white`}
              title="সরান"
            >
              <FaTrash className="h-4 w-4" />
              সরান
            </button>
            <Link to={href} className="text-xs font-medium text-green hover:underline">
              বিস্তারিত দেখুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
