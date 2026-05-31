import { CiHeart } from "react-icons/ci";
import { FiShare2 } from "react-icons/fi";
import { Rating } from "@smastrom/react-rating";
import toast from "react-hot-toast";

const Chips = ({ children, tone = "green" }) => (
  <span
    className={[
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border",
      tone === "green"
        ? "bg-green/10 text-green border-green/30"
        : "bg-yellow/10 text-yellow border-yellow/30",
    ].join(" ")}
  >
    {children}
  </span>
);

const ProductInfo = ({
  productName,
  catLabel,
  createdDate,
  rating,
  price,
  previousPrice,
  quantity,
  currency,
  isConsumer,
  wishing,
  setWishing,
  addToWishlist,
  _id,
  isProducer,
  adding,
  setAdding,
  addToCart,
  buying,
  setBuying,
  cartPath,
  navigate,
}) => {
  const safeStr = (s, fallback = "—") =>
    typeof s === "string" && s.trim() ? s : fallback;

  return (
    <section className="w-full">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          {safeStr(productName, "নামহীন পণ্য")}
        </h1>
        <div className="flex items-center gap-2">
          {isConsumer && (
            <button
              className="p-2 rounded-lg border bg-white hover:bg-yellow-50 transition disabled:opacity-50 cursor-pointer"
              disabled={wishing}
              onClick={async () => {
                setWishing(true);
                await addToWishlist(_id);
                setWishing(false);
              }}
              title="ইচ্ছেতালিকায় যোগ করুন"
            >
              <CiHeart className="text-2xl" />
            </button>
          )}
          <button
            className="p-2 rounded-lg border bg-white hover:bg-yellow-50 transition cursor-pointer"
            onClick={() => {
              navigator.clipboard
                .writeText(window.location.href)
                .then(() => toast.success("লিংক কপি হয়েছে"))
                .catch(() => {});
            }}
            title="লিংক কপি করুন"
          >
            <FiShare2 className="text-xl" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <Chips tone="green">{catLabel}</Chips>
        {createdDate && <Chips tone="yellow">যোগ হয়েছে {createdDate}</Chips>}
      </div>

      {typeof rating === "number" &&
        Number.isFinite(rating) &&
        rating > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <Rating value={rating} readOnly style={{ maxWidth: 100 }} />
            <span className="text-sm text-gray-600">({rating})</span>
          </div>
        )}

      <div className="mt-4 rounded-xl border bg-white p-4 flex items-end gap-3">
        <p className="text-2xl md:text-3xl font-bold text-green">
          {currency(price)}
        </p>
        {previousPrice && Number(previousPrice) > Number(price) ? (
          <p className="text-sm md:text-base line-through text-gray-400">
            {currency(previousPrice)}
          </p>
        ) : null}
        {quantity && (
          <span className="ml-auto text-sm text-gray-600">
            স্টক: <span className="font-medium">{quantity}</span>
          </span>
        )}
      </div>

      {!isProducer && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            className="rounded-lg bg-green text-white px-6 py-2.5 hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={adding}
            onClick={async () => {
              setAdding(true);
              await addToCart(_id, 1);
              setAdding(false);
            }}
          >
            {adding ? "যোগ হচ্ছে…" : "কার্টে যোগ করুন"}
          </button>
          <button
            className="rounded-lg bg-white border px-6 py-2.5 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={buying}
            onClick={async () => {
              setBuying(true);
              const ok = await addToCart(_id, 1);
              setBuying(false);
              if (ok) navigate(cartPath);
            }}
          >
            {buying ? "প্রক্রিয়াধীন…" : "এখনই কিনুন"}
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductInfo;