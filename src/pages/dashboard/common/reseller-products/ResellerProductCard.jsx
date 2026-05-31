import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaShoppingCart,
  FaStore,
  FaUserTie,
} from "react-icons/fa";
import logo from "../../../../../public/photos/auth/brandLogo.svg";
import { normalizeApiRole } from "../../../../api/resellerProducts";

export default function ResellerProductCard({
  product,
  busy,
  onSell,
  showSellAction,
  actionLabel,
  busyLabel,
  doneLabel,
  viewKey,
  role,
}) {
  const [sellPostForm, setSellPostForm] = useState({
    sellType: "bulk",
    quantity: product.quantity || 1,
    unit: product.unit || "kg",
    sellingPricePerKg: product.pricePerKg || product.priceNumber || product.price || "",
  });
  const unitLabel = product.unit || "kg";
  const producerLabel =
    normalizeApiRole(role) === "wholesaler" ? "সুপারসেলার" : "উৎপাদক";
  const quantityLabel =
    product.quantity || product.quantity === 0
      ? `${Number(product.quantity).toLocaleString("bn-BD")} ${unitLabel}`
      : "—";
  const detailPath = `/products/${product.detailProductId || product._id}`;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={detailPath} className="block cursor-pointer">
        <div className="relative">
          <img
            src={product.image || "https://placehold.co/800x600?text=No+Image"}
            alt={product.productName || "পণ্য"}
            className="h-44 w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/800x600?text=No+Image";
            }}
          />
          <img
            src={logo}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-auto h-20 w-20 opacity-[0.04]"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute left-3 top-3">
            {product.categoryName ? (
              <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[11px] font-semibold text-gray-700 shadow-sm backdrop-blur">
                {product.categoryName}
              </span>
            ) : null}
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm">
              <FaBoxOpen className="text-green" />
              {quantityLabel}
            </span>
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-4 pt-3">
        <div className="space-y-1.5">
          <h3 className="line-clamp-1 text-base font-semibold text-gray-900">
            {product.productName || "নামহীন পণ্য"}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaUserTie className="text-green" />
            <span className="line-clamp-1">
              {product.producer?.name || producerLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-green">
            ৳ {product.priceNumber.toLocaleString("bn-BD")}
          </span>
          {product.previousPriceNumber > product.priceNumber ? (
            <span className="text-sm text-gray-400 line-through">
              ৳ {product.previousPriceNumber.toLocaleString("bn-BD")}
            </span>
          ) : null}
        </div>

        {showSellAction && viewKey === "sell-post" ? (
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <label className="col-span-2 text-xs font-medium text-gray-600">
              ধরন
              <select
                value={sellPostForm.sellType}
                onChange={(e) =>
                  setSellPostForm((prev) => ({ ...prev, sellType: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green"
              >
                <option value="bulk">বাল্ক</option>
                <option value="retail">রিটেইল</option>
              </select>
            </label>

            <label className="text-xs font-medium text-gray-600">
              পরিমাণ
              <input
                type="number"
                min="1"
                value={sellPostForm.quantity}
                onChange={(e) =>
                  setSellPostForm((prev) => ({ ...prev, quantity: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green"
              />
            </label>

            <label className="text-xs font-medium text-gray-600">
              ইউনিট
              <input
                value={sellPostForm.unit}
                onChange={(e) =>
                  setSellPostForm((prev) => ({ ...prev, unit: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green"
              />
            </label>

            <label className="col-span-2 text-xs font-medium text-gray-600">
              প্রতি কেজি বিক্রয় মূল্য
              <input
                type="number"
                min="1"
                value={sellPostForm.sellingPricePerKg}
                onChange={(e) =>
                  setSellPostForm((prev) => ({
                    ...prev,
                    sellingPricePerKg: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green"
              />
            </label>
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <Link
            to={detailPath}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:border-green hover:text-green cursor-pointer"
          >
            <FaSearch className="text-xs" />
            <span>দেখুন</span>
          </Link>

          {showSellAction ? (
            <button
              type="button"
              onClick={() => onSell(product, sellPostForm)}
              disabled={busy}
              className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold text-white cursor-pointer ${
                product.isSelling && !actionLabel
                  ? "bg-green/70"
                  : "bg-green hover:bg-green/90"
              } disabled:opacity-70`}
            >
              {product.isSelling && !actionLabel ? (
                <>
                  <FaCheckCircle />
                  <span>{doneLabel || "প্রকাশিত"}</span>
                </>
              ) : busy ? (
                <>
                  <FaClock className="animate-spin" />
                  <span>{busyLabel || "প্রকাশ হচ্ছে…"}</span>
                </>
              ) : (
                <>
                  {viewKey === "sell-post" ? <FaStore /> : <FaShoppingCart />}
                  <span>{actionLabel || "ক্রেতার জন্য প্রকাশ করুন"}</span>
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

ResellerProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string,
    detailProductId: PropTypes.string,
    productName: PropTypes.string,
    image: PropTypes.string,
    categoryName: PropTypes.string,
    quantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    unit: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    pricePerKg: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    priceNumber: PropTypes.number,
    previousPriceNumber: PropTypes.number,
    isSelling: PropTypes.bool,
    producer: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
  busy: PropTypes.bool,
  onSell: PropTypes.func.isRequired,
  showSellAction: PropTypes.bool,
  actionLabel: PropTypes.string,
  busyLabel: PropTypes.string,
  doneLabel: PropTypes.string,
  viewKey: PropTypes.string,
  role: PropTypes.string,
};
