import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { FaCreditCard, FaRedo, FaSearch } from "react-icons/fa";
import {
  getWholesalerOrders,
  payWholesalerOrder,
  resolveResellerProductImage,
} from "../../../../api/resellerProducts";

const STATUS_TABS = [
  { key: "all", label: "সব" },
  { key: "pending", label: "পেন্ডিং" },
  { key: "approved", label: "অনুমোদিত" },
  { key: "rejected", label: "রিজেক্টেড" },
];

const money = (value) =>
  (Number(value) || 0).toLocaleString("bn-BD", {
    maximumFractionDigits: 2,
  });

const getProduct = (order) =>
  order?.product && typeof order.product === "object" ? order.product : {};

const getProducer = (order) =>
  order?.producer && typeof order.producer === "object" ? order.producer : {};

const normalizeStatus = (value) =>
  String(value || "pending").trim().toLowerCase();

export default function WholesalerOrders() {
  const token = localStorage.getItem("token") || Cookies.get("token");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [reloadTick, setReloadTick] = useState(0);
  const [payingId, setPayingId] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setQuery(search.trim().toLowerCase()), 250);
    return () => window.clearTimeout(id);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    getWholesalerOrders({ token, signal: controller.signal })
      .then(setOrders)
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        const message = err?.response?.data?.message || "অর্ডার লোড করা যায়নি";
        setError(message);
        toast.error(message);
      })
      .finally(() => {
        setLoaded(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [reloadTick, token]);

  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (status !== "all") {
      list = list.filter((order) => normalizeStatus(order?.orderStatus) === status);
    }

    if (query) {
      list = list.filter((order) => {
        const product = getProduct(order);
        const producer = getProducer(order);
        return [
          order?.orderId,
          order?.orderStatus,
          order?.paymentStatus,
          product?.productName,
          producer?.name,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
    }

    return list.sort(
      (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
    );
  }, [orders, query, status]);

  const handlePay = async (order) => {
    if (!order?.orderId) return;

    try {
      setPayingId(order.orderId);
      const response = await payWholesalerOrder({ token, orderId: order.orderId });
      toast.success(response?.message || "পেমেন্ট paid হয়েছে");
      setOrders((current) =>
        current.map((item) =>
          item.orderId === order.orderId ? { ...item, ...response.order } : item
        )
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "পেমেন্ট আপডেট করা যায়নি");
    } finally {
      setPayingId("");
    }
  };

  const showSkeleton = loading || !loaded;

  return (
    <div className="w-full px-4 pb-16 pt-6">
      <Toaster position="top-right" toastOptions={{ duration: 2400 }} />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">হোলসেলার অর্ডার</h1>
          <p className="mt-1 text-sm text-gray-500">
            মোট {filteredOrders.length.toLocaleString("bn-BD")} অর্ডার
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative sm:w-72">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="অর্ডার, পণ্য বা স্ট্যাটাস খুঁজুন"
              className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/10"
            />
          </div>
          <button
            type="button"
            onClick={() => setReloadTick((value) => value + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-green disabled:opacity-60"
          >
            <FaRedo className={loading ? "animate-spin" : ""} />
            রিফ্রেশ
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatus(tab.key)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              status === tab.key
                ? "border-green bg-green text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-green"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : null}

      {showSkeleton ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl border border-gray-200 bg-white"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          কোনো হোলসেলার অর্ডার পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => {
            const product = getProduct(order);
            const producer = getProducer(order);
            const isPaid = normalizeStatus(order?.paymentStatus) === "paid";
            const image = resolveResellerProductImage(product?.image);

            return (
              <article
                key={order?._id || order?.orderId}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <img
                    src={image || "https://placehold.co/160x120?text=No+Image"}
                    alt={product?.productName || "পণ্য"}
                    className="h-24 w-full rounded-lg bg-gray-100 object-cover md:w-32"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://placehold.co/160x120?text=No+Image";
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="line-clamp-1 text-base font-semibold text-gray-900">
                        {product?.productName || "নামহীন পণ্য"}
                      </h2>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                        {order?.orderId}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      সুপারসেলার: {producer?.name || "—"} {producer?.phone ? `(${producer.phone})` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                        অর্ডার: {order?.orderStatus || "pending"}
                      </span>
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-medium text-blue-700">
                        পেমেন্ট: {order?.paymentStatus || "pending"}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-[180px] space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between gap-4">
                      <span>পরিমাণ</span>
                      <span className="font-semibold">{order?.quantity}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>ইউনিট</span>
                      <span className="font-semibold">৳ {money(order?.unitPrice)}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-t pt-2">
                      <span>মোট</span>
                      <span className="font-bold text-green">৳ {money(order?.totalAmount)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePay(order)}
                      disabled={isPaid || payingId === order.orderId}
                      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FaCreditCard />
                      {isPaid
                        ? "Paid"
                        : payingId === order.orderId
                        ? "আপডেট হচ্ছে…"
                        : "COD Paid করুন"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
