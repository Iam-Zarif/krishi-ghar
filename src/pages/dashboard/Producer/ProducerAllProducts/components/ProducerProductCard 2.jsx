import { Link } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit2, FiEye, FiTag, FiTrash2 } from "react-icons/fi";
import { MdOutlineCategory } from "react-icons/md";
import {
  normalizeProducerCategoryName,
  resolveProductImageUrl,
} from "../../../../../utils/producerProduct";
import { Api } from "../../../../../api/API";
import { statusMeta } from "./producerProductConstants";

const ProducerProductCard = ({
  dropdownRef,
  openDropdown,
  product,
  setDeleteModal,
  setSelectedProductId,
  toggleDropdown,
}) => {
  const statusKey = String(product.status || "pending").toLowerCase();
  const statusInfo = statusMeta[statusKey] || statusMeta.pending;
  const productName = product.name || product.productName || "নামহীন পণ্য";

  return (
    <div className="group overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <img
          src={resolveProductImageUrl(product.image, Api)}
          alt={productName}
          className="h-56 w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />

        <div className="absolute left-4 top-4">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
          >
            {statusInfo.label}
          </span>
        </div>

        <div
          className="absolute right-4 top-4"
          ref={openDropdown === product._id ? dropdownRef : null}
        >
          <button
            onClick={() => toggleDropdown(product._id)}
            className="rounded-full bg-white/95 p-2 text-gray-700 shadow-sm transition hover:bg-white cursor-pointer"
          >
            <BsThreeDotsVertical className="text-lg" />
          </button>

          {openDropdown === product._id && (
            <div className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              <Link
                to={`/dashboard/product/${product._id}`}
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <FiEye className="text-base" />
                দেখুন
              </Link>
              <Link
                to={`/dashboard/producer/product-edit/${product._id}`}
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <FiEdit2 className="text-base" />
                এডিট
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSelectedProductId(product._id);
                  setDeleteModal(true);
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <FiTrash2 className="text-base" />
                মুছুন
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-gray-800">
          {productName}
        </h3>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FiTag className="text-base text-emerald-600" />
            <span>{product.price} টাকা</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MdOutlineCategory className="text-[18px] text-gray-400" />
            <span>{normalizeProducerCategoryName(product.category)}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2.5">
          <Link
            to={`/dashboard/product/${product._id}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <FiEye className="text-base" />
            দেখুন
          </Link>
          <Link
            to={`/dashboard/producer/product-edit/${product._id}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green px-4 py-3 text-sm font-semibold text-white hover:bg-green/90 cursor-pointer"
          >
            <FiEdit2 className="text-base" />
            এডিট
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProducerProductCard;
