import { IoBagCheckOutline } from "react-icons/io5";

const CartSummary = ({
  profileLoading,
  fullName,
  phoneNumber,
  addressLine,
  city,
  paymentMethod,
  setPaymentMethod,
  itemsLength,
  subtotal,
  deliveryFee,
  grandTotal,
  handleCheckout,
  checkingOut,
  navigate,
}) => {
  return (
    <aside
      className="bg-white border border-gray-200 rounded-xl p-4 h-max sticky top-20"
      key={itemsLength} // Simplified key
    >
      <p className="font-semibold text-gray-800">সারসংক্ষেপ</p>

      <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-1.5">
        <p className="text-sm font-semibold text-gray-800">শিপিং</p>
        <p className="text-sm">
          <span className="text-gray-500">নাম: </span>
          <span className="font-medium text-gray-800">
            {profileLoading ? "লোড হচ্ছে…" : fullName}
          </span>
        </p>
        <p className="text-sm">
          <span className="text-gray-500">ফোন: </span>
          <span className="text-gray-800">
            {profileLoading ? "" : phoneNumber || "—"}
          </span>
        </p>
        <p className="text-sm">
          <span className="text-gray-500">ঠিকানা: </span>
          <span className="text-gray-800 break-words">
            {profileLoading ? "" : addressLine || "প্রোফাইলে ঠিকানা যোগ করুন"}
          </span>
        </p>
        <p className="text-sm">
          <span className="text-gray-500">শহর: </span>
          <span className="text-gray-800">
            {profileLoading ? "" : city}
          </span>
        </p>
      </div>

      <div className="mt-3 rounded-lg border border-gray-200 p-3 space-y-2">
        <p className="text-sm font-semibold text-gray-800">পেমেন্ট পদ্ধতি</p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="pm"
            value="cash_on_delivery"
            checked={paymentMethod === "cash_on_delivery"}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="h-4 w-4"
          />
          <span>ক্যাশ অন ডেলিভারি</span>
        </label>
      </div>

      <div className="mt-3 space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>আইটেম</span>
          <span>{itemsLength}</span>
        </div>
        <div className="flex justify-between">
          <span>সাবটোটাল</span>
          <span>৳ {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>ডেলিভারি</span>
          <span>৳ {deliveryFee.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t flex justify-between items-center">
        <span className="text-sm text-gray-600">মোট</span>
        <span className="text-lg font-bold text-green-700">
          ৳ {grandTotal.toLocaleString()}
        </span>
      </div>

      <button
        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 transition-colors disabled:opacity-50 cursor-pointer"
        onClick={handleCheckout}
        disabled={checkingOut || !itemsLength || profileLoading}
      >
        <IoBagCheckOutline className="h-5 w-5" />
        {checkingOut ? "প্রসেস হচ্ছে..." : "চেকআউট"}
      </button>

      <button
        className="mt-2 w-full rounded-full border px-5 py-2 text-sm hover:bg-gray-50 cursor-pointer"
        onClick={() => navigate("/products")}
      >
        কেনাকাটা চালিয়ে যান
      </button>
    </aside>
  );
};

export default CartSummary;
