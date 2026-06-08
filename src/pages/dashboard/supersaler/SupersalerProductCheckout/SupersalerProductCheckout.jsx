/* eslint-disable react/prop-types */
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { Api } from "../../../../api/API";
import { ApiPaths } from "../../../../api/apiPaths";
import { UserProfileContext } from "../../../../providers/getUserProfile/getUserProfile";

const Box = ({ children }) => (
  <div className="w-full bg-white border border-gray-200 rounded-xl p-5">
    {children}
  </div>
);

const KeyRow = ({ k, v }) => (
  <div className="flex items-start justify-between gap-4 text-sm">
    <span className="text-gray-500">{k}</span>
    <span className="font-medium text-gray-800 break-all text-right">
      {v || "—"}
    </span>
  </div>
);

const Spinner = () => (
  <div className="flex items-center gap-2 text-emerald-700">
    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse [animation-delay:120ms]" />
    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse [animation-delay:240ms]" />
  </div>
);

const money = (v) => {
  const n = typeof v === "number" ? v : Number(v || 0);
  return `৳ ${n.toLocaleString()}`;
};

const titleCase = (s = "") =>
  s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ")
    .trim();

const joinAddress = (...parts) => {
  const clean = parts
    .map((p) => (p || "").toString().trim())
    .filter(Boolean)
    .map(titleCase);
  return Array.from(new Set(clean)).join(", ");
};

const resolveImage = (value) => {
  const path = String(value || "").trim();
  if (!path) return "https://placehold.co/80x80?text=না+ছবি";
  if (/^https?:\/\//i.test(path)) return path;
  return `${Api}/${path.replace(/^\/+/, "")}`;
};

const toArr = (d) => {
  const x = d?.data?.data ?? d?.data ?? d;
  if (Array.isArray(x)) return x;
  if (Array.isArray(x?.orders)) return x.orders;
  if (Array.isArray(x?.items)) return x.items;
  if (Array.isArray(x?.data)) return x.data;
  return [];
};

const pickLatestPending = (list) => {
  const norm = list.map((o) => {
    const id = o?.orderId || o?.id || o?._id || "";
    const ts = o?.createdAt ? new Date(o.createdAt).getTime() : 0;
    const dstr =
      typeof id === "string" && id.includes("-") ? id.split("-")[1] : "";
    const dts = /^\d{8}$/.test(dstr)
      ? new Date(
          `${dstr.slice(0, 4)}-${dstr.slice(4, 6)}-${dstr.slice(
            6,
            8
          )}T00:00:00Z`
        ).getTime()
      : 0;
    return { raw: o, score: Math.max(ts, dts) };
  });
  const pend = norm.filter((n) => {
    const s = (n.raw?.orderStatus || n.raw?.status || "").toLowerCase();
    return s === "pending" || s === "" || !s;
  });
  const pool = pend.length ? pend : norm;
  pool.sort((a, b) => b.score - a.score);
  return pool[0]?.raw;
};

export default function SupersalerProductCheckout() {
  const { userProfile, profileLoading } = useContext(UserProfileContext);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token") || Cookies.get("token");
  const [phase, setPhase] = useState("init");
  const [err, setErr] = useState("");
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const busyRef = useRef(false);

  const stateObj =
    location.state && typeof location.state === "object"
      ? location.state
      : null;
  const stateOrderFromCheckout = stateObj?.order || null;
  const statePaymentFromCheckout = stateObj?.payment || null;
  const stateHasOrderShape =
    stateObj &&
    typeof stateObj.orderId === "string" &&
    typeof stateObj.totalAmount !== "undefined";
  const stateOrder = stateOrderFromCheckout || (stateHasOrderShape ? stateObj : null);
  const searchOrderId =
    new URLSearchParams(location.search).get("orderId") || "";
  const orderIdFromStateOrQuery = stateOrder?.orderId || searchOrderId || "";

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const refreshPayment = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${Api}${ApiPaths.supersaler.ordersBuy}`, {
        headers,
      });
      const list = Array.isArray(res?.data?.orders) ? res.data.orders : [];
      const matched =
        list.find((item) => item.orderId === order?.orderId) || list[0] || null;
      if (matched) setOrder(matched);
      toast.success("অর্ডারের অবস্থা রিফ্রেশ হয়েছে");
    } catch (e) {
      const msg = e?.response?.data?.message || "রিফ্রেশ করা যায়নি";
      toast.error(msg);
    } finally {
      setRefreshing(false);
    }
  };

  const resolveAndCheckout = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPhase("loading");
    setErr("");
    try {
      if (!token) {
        toast.error("অনুগ্রহ করে লগইন করুন");
        navigate("/auth/login");
        return;
      }
      if (stateOrder) {
        setOrder(stateOrder);
        setPayment(statePaymentFromCheckout);
        setPhase("success");
        return;
      }
      let oid = orderIdFromStateOrQuery;
      let o = stateOrder || null;
      if (!oid) {
        const listRes = await axios.get(`${Api}${ApiPaths.supersaler.ordersBuy}`, { headers });
        const arr = Array.isArray(listRes?.data?.orders)
          ? listRes.data.orders
          : toArr(listRes);
        const latest = pickLatestPending(arr);
        if (!latest) throw new Error("সাম্প্রতিক অর্ডার পাওয়া যায়নি");
        o = latest;
        oid = latest.orderId || latest.id || latest._id;
      }
      if (!oid) throw new Error("অর্ডার আইডি পাওয়া যায়নি");
      if (!o) {
        const listRes = await axios.get(`${Api}${ApiPaths.supersaler.ordersBuy}`, { headers });
        const arr = Array.isArray(listRes?.data?.orders)
          ? listRes.data.orders
          : toArr(listRes);
        o = arr.find((item) => item.orderId === oid || item._id === oid);
      }
      setOrder(o);
      setPhase("success");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "চেকআউট ব্যর্থ হয়েছে";
      setErr(msg);
      setPhase("error");
      toast.error(msg);
    } finally {
      busyRef.current = false;
    }
  };

  useEffect(() => {
    resolveAndCheckout();
  }, []);

  const items = Array.isArray(order?.items) ? order.items : [];
  const createdLabel = order?.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : "—";
  const totalAmount =
    typeof order?.totalAmount === "number" ? money(order.totalAmount) : "—";
  const paymentStatus = (
    payment?.status ||
    payment?.paymentStatus ||
    order?.paymentStatus ||
    "pending"
  ).toString();
  const paymentId = payment?.paymentId || payment?.id || payment?._id || "—";

  const fullName = titleCase(userProfile?.name || "ক্রেতা");
  const phoneNumber = (userProfile?.phone ?? "").toString();
  const city = titleCase(
    userProfile?.district || userProfile?.division || "ঢাকা"
  );
  const addressLine = joinAddress(
    userProfile?.address,
    userProfile?.thana,
    userProfile?.district,
    userProfile?.division
  );

  return (
    <div className="w-full px-4 pt-6 pb-16">
      <Toaster position="top-right" toastOptions={{ duration: 2200 }} />
      <div className="max-w-5xl mx-auto mb-5">
        <h1 className="text-xl font-semibold text-gray-800">চেকআউট</h1>
        <p className="text-sm text-gray-500">ক্যাশ অন ডেলিভারি</p>
      </div>

      {phase === "loading" && (
        <div className="max-w-5xl mx-auto">
          <Box>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">ক্যাশ অন ডেলিভারি শুরু হচ্ছে</p>
                <p className="text-sm text-gray-500">অনুগ্রহ করে অপেক্ষা করুন</p>
              </div>
              <Spinner />
            </div>
            <div className="mt-4 h-2 w-full bg-emerald-50 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-emerald-500 animate-[progress_1.4s_ease_infinite]" />
            </div>
            <style>{`@keyframes progress{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
          </Box>
        </div>
      )}

      {phase === "error" && (
        <div className="max-w-5xl mx-auto space-y-4">
          <Box>
            <div className="mb-3 w-full rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              {err}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resolveAndCheckout}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-white text-sm font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
              >
                আবার চেষ্টা করুন
              </button>
              <button
                onClick={() => navigate("/dashboard/superseller/cart")}
                className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm hover:bg-gray-50"
              >
                কার্টে ফিরুন
              </button>
            </div>
          </Box>
        </div>
      )}

      {phase === "success" && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] items-start gap-6">
          <Box>
            <div className="flex items-center justify-between">
              <p className="text-green-700 font-semibold">অর্ডার সারসংক্ষেপ</p>
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 border border-emerald-200 text-emerald-700">
                সফল
              </span>
            </div>
            <div className="mt-4 grid gap-4">
              {items.length === 0 && (
                <div className="rounded-lg border border-gray-200 p-6 text-center text-gray-600">
                  এই অর্ডারে কোনো আইটেম পাওয়া যায়নি
                </div>
              )}
              {items.length > 0 && (
                <div className="grid gap-4">
                  {items.map((it, idx) => {
                    const name = it.productName || it.name || "পণ্য";
                    const img = resolveImage(it.productImage || it.image);
                    const qty = Number(it.quantity) || 0;
                    const unit =
                      typeof it.price === "number"
                        ? it.price
                        : Number(it.price || 0);
                    const total =
                      typeof it.totalPrice === "number"
                        ? it.totalPrice
                        : unit * qty;
                    return (
                      <div
                        key={`${name}-${idx}`}
                        className="flex items-center gap-4 border border-gray-100 rounded-lg p-3"
                      >
                        <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={img}
                            alt={name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://placehold.co/80x80?text=না+ছবি";
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {name}
                          </div>
                          <div className="text-xs text-gray-500">পরিমাণ {qty}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-700">
                            {money(unit)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {money(total)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Box>

          <div className="space-y-4">
            <Box>
              <div className="font-semibold text-gray-800">শিপিং</div>
              <div className="mt-3 space-y-2">
                <KeyRow k="নাম" v={profileLoading ? "লোড হচ্ছে…" : fullName} />
                <KeyRow
                  k="ফোন"
                  v={profileLoading ? "" : phoneNumber || "—"}
                />
                <KeyRow
                  k="ঠিকানা"
                  v={
                    profileLoading
                      ? ""
                      : addressLine || "প্রোফাইলে ঠিকানা যোগ করুন"
                  }
                />
                <KeyRow k="শহর" v={profileLoading ? "" : city} />
              </div>
              <div className="mt-3">
                <button
                  onClick={() => navigate("/dashboard/superseller/profile")}
                  className="text-xs rounded-full border px-3 py-1 hover:bg-gray-50"
                >
                  প্রোফাইলে গিয়ে ঠিকানা এডিট করুন
                </button>
              </div>
            </Box>

            <Box>
              <div className="font-semibold text-gray-800">অর্ডার তথ্য</div>
              <div className="mt-3 space-y-2">
                <KeyRow k="অর্ডার আইডি" v={order?.orderId || order?._id} />
                <KeyRow k="তৈরির সময়" v={createdLabel} />
                <KeyRow
                  k="অর্ডারের অবস্থা"
                  v={order?.orderStatus || order?.status}
                />
                <KeyRow k="পেমেন্ট অবস্থা" v={paymentStatus} />
                <KeyRow k="মোট টাকা" v={totalAmount} />
              </div>
            </Box>

            <Box>
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-800">পেমেন্ট</div>
                <button
                  onClick={refreshPayment}
                  disabled={refreshing}
                  className="text-xs rounded-full border px-3 py-1 hover:bg-gray-50 disabled:opacity-60 cursor-pointer"
                >
                  {refreshing ? "রিফ্রেশ হচ্ছে..." : "অর্ডার রিফ্রেশ করুন"}
                </button>
              </div>
              <div className="mt-3 space-y-2">
                <KeyRow k="পেমেন্ট আইডি" v={paymentId} />
                <KeyRow k="অবস্থা" v={paymentStatus} />
              </div>
              <div className="mt-4 grid gap-2">
                <button
                  onClick={() =>
                    navigate("/dashboard/superseller/producer-products")
                  }
                  className="w-full inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-white text-sm font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  কেনাকাটা চালিয়ে যান
                </button>
                <button
                  onClick={() => navigate("/dashboard/superseller")}
                  className="w-full inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  ড্যাশবোর্ডে যান
                </button>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                কুরিয়ার ডেলিভারির সময় নগদ টাকা সংগ্রহ করবে। পেমেন্টের অবস্থা পরিবর্তন হলে আপনি আপডেট পাবেন।
              </div>
            </Box>
          </div>
        </div>
      )}
    </div>
  );
}
