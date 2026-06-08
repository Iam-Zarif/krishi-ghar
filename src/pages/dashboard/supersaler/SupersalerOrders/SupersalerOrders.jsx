/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Api } from "../../../../api/API";
import { ApiPaths } from "../../../../api/apiPaths";
import toast, { Toaster } from "react-hot-toast";
import SupersalerPagination from "./SupersalerPagination";
import SupersalerOrderCard from "./SupersalerOrderCard";
import SupersalerorderHeading from "./SupersalerorderHeading";
import ChatWidget from "./ChatWidget";

const num = (v) => (Number.isNaN(Number(v)) ? 0 : Number(v));
const PAYMENT_TABS = [
  { key: "pending", label: "পেমেন্ট: pending" },
  { key: "paid", label: "পেমেন্ট: paid" },
];

const normalizePaymentStatus = (value) =>
  String(value || "pending").trim().toLowerCase();

const normalizeOrders = (orders) =>
  (Array.isArray(orders) ? orders : []).map((order) => ({
    ...order,
    items: Array.isArray(order.items) ? order.items : [],
  }));

function ErrorBlock({ message, onRetry }) {
  return (
    <div className="mb-5 w-full rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-center justify-between">
      <span className="truncate">{message}</span>
      <button
        onClick={onRetry}
        className="rounded-full border border-red-300 bg-white px-3 py-1.5 text-sm hover:bg-red-100 cursor-pointer"
      >
        আবার চেষ্টা করুন
      </button>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
      <div className="h-5 w-40 bg-gray-200 rounded" />
      <div className="mt-2 h-3 w-28 bg-gray-200 rounded" />
      <div className="mt-3 h-24 bg-gray-100 rounded-md" />
    </div>
  );
}

export default function SupersalerOrders() {
  const [activeChatOrder, setActiveChatOrder] = useState(null);
  const token = localStorage.getItem("token") || Cookies.get("token");
  const abortRef = useRef(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [orderBuckets, setOrderBuckets] = useState({ pending: [], paid: [] });
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [paymentTab, setPaymentTab] = useState("pending");
  const [reloadTick, setReloadTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setQ(search.trim().toLowerCase()), 250);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (!token) {
      toast.error("অর্ডার দেখতে লগইন করুন");
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    Promise.all([
      axios.get(`${Api}${ApiPaths.supersaler.ordersBuy}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      }),
      axios.get(`${Api}${ApiPaths.supersaler.ownProducts}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      }),
    ])
      .then(([pendingRes, paidRes]) => {
        const buyOrders = normalizeOrders(pendingRes?.data?.orders);
        const purchasedOrders = normalizeOrders(paidRes?.data?.orders);

        setOrderBuckets({
          pending: buyOrders.filter(
            (order) => normalizePaymentStatus(order?.paymentStatus) !== "paid"
          ),
          paid: purchasedOrders.filter(
            (order) => normalizePaymentStatus(order?.paymentStatus) === "paid"
          ),
        });
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          const msg = err?.response?.data?.message || "অর্ডার লোড করা যায়নি";
          setError(msg);
          setOrderBuckets({ pending: [], paid: [] });
          toast.error(msg);
        }
      })
      .finally(() => {
        setFetched(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [reloadTick, token]);

  const paymentCounts = useMemo(
    () => ({
      pending: orderBuckets.pending.length,
      paid: orderBuckets.paid.length,
    }),
    [orderBuckets]
  );

  const filtered = useMemo(() => {
    let arr = [...(orderBuckets[paymentTab] || [])];

    if (q) {
      const words = q.split(/\s+/).filter(Boolean);
      arr = arr.filter((o) => {
        const hay = [
          o.orderId,
          o.orderStatus,
          o.paymentStatus,
          ...(o.items || []).map((i) => `${i.productName} x${i.quantity}`),
        ]
          .join(" ")
          .toLowerCase();
        return words.every((w) => hay.includes(w));
      });
    }
    if (sort === "newest")
      arr.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    else if (sort === "oldest")
      arr.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      );
    else if (sort === "amount_asc")
      arr.sort((a, b) => num(a.totalAmount) - num(b.totalAmount));
    else if (sort === "amount_desc")
      arr.sort((a, b) => num(b.totalAmount) - num(a.totalAmount));
    return arr;
  }, [orderBuckets, paymentTab, q, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );
  const pagination = {
    currentPage,
    totalPages,
    totalOrders: filtered.length,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
  const showSkeleton = loading || !fetched;

  useEffect(() => {
    setPage(1);
  }, [paymentTab, q, sort, limit]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="w-full px-4 pt-6 pb-24">
      <Toaster position="top-right" toastOptions={{ duration: 2200 }} />
      <SupersalerorderHeading
        showSkeleton={showSkeleton}
        pagination={pagination}
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        limit={limit}
        setLimit={setLimit}
        setPage={setPage}
        loading={loading}
        setReloadTick={setReloadTick}
      />
      <div className="mb-5 grid gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:grid-cols-2">
        {PAYMENT_TABS.map((tab) => {
          const isActive = paymentTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setPaymentTab(tab.key)}
              className={`cursor-pointer rounded-lg border px-4 py-3 text-left transition ${
                isActive
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300"
              }`}
            >
              <span className="text-sm font-semibold">{tab.label}</span>
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  isActive
                    ? "bg-white text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {paymentCounts[tab.key].toLocaleString("bn-BD")}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <ErrorBlock
          message={error}
          onRetry={() => setReloadTick((t) => t + 1)}
        />
      )}
      <div className="grid gap-5">
        {showSkeleton &&
          Array.from({ length: Math.min(limit, 4) }).map((_, i) => (
            <CardSkeleton key={`sk-${i}`} />
          ))}
        {!showSkeleton &&
          pageItems.map((o) => {
            const items = Array.isArray(o.items) ? o.items : [];
            const created = o.createdAt
              ? new Date(o.createdAt).toLocaleString()
              : "—";
            const eta = o.estimatedDelivery
              ? new Date(o.estimatedDelivery).toLocaleDateString()
              : "—";
            const summary =
              items
                .map((it) => `${it.productName} ×${it.quantity}`)
                .join(", ") || "কোনো পণ্য নেই";
            return (
              <SupersalerOrderCard
                key={o._id || o.orderId}
                o={o}
                items={items}
                created={created}
                eta={eta}
                summary={summary}
                num={num}
                onContact={() => setActiveChatOrder({ o, items })}
              />
            );
          })}
        <ChatWidget
          orderData={activeChatOrder}
          onClose={() => setActiveChatOrder(null)}
        />
        {!showSkeleton && filtered.length === 0 && !error && (
          <div className="mt-6 w-full rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-600">
            {paymentTab === "paid"
              ? "পেইড অর্ডার পাওয়া যায়নি।"
              : "পেমেন্ট পেন্ডিং অর্ডার পাওয়া যায়নি।"}
          </div>
        )}
      </div>
      <SupersalerPagination
        pagination={pagination}
        loading={loading}
        setPage={setPage}
      />
    </div>
  );
}
