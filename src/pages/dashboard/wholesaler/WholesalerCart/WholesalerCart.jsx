// src/pages/dashboard/wholesaler/WholesalerCart/WholesalerCart.jsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import {
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";
import { IoBagCheckOutline } from "react-icons/io5";
import { Api } from "../../../../api/API";
import { ApiPaths } from "../../../../api/apiPaths";
import { UserProfileContext } from "../../../../providers/getUserProfile/getUserProfile";
import { emitShopStateChange } from "../../../../utils/shopSignals";
import { CardSkeleton } from "../CardSkeleton/CardSkeleton";
import { ErrorBlock } from "../ErrorBlock/ErrorBlock";
import { NormalizeRow } from "../NormalizeRow/NormalizeRow";

const priceNum = (v) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const money = (v) => priceNum(v).toLocaleString();
const clamp = (v, min = 1, max = 999999) => Math.max(min, Math.min(max, v));







export default function WholesalerCart() {
  const { userProfile, profileLoading } = useContext(UserProfileContext);
  const [savingQuantity, setSavingQuantity] = useState({});
  const qtyTimersRef = useRef({});


  const navigate = useNavigate();
  const token = localStorage.getItem("token") || Cookies.get("token");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recent");
  const [limit, setLimit] = useState(12);
  const [page, setPage] = useState(1);

  const [busyRemove, setBusyRemove] = useState({});
  const abortRef = useRef(null);




  useEffect(() => {
    const id = window.setTimeout(() => setQ(search.trim()), 250);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (!token) {
      toast.error("কার্ট দেখতে লগইন করুন");
      navigate("/auth/login");
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    axios
      .get(`${Api}/api/v1/addToCart/`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      .then((res) => {
        const data = res?.data?.data || res?.data || {};
        const list = Array.isArray(data.items) ? data.items : [];
        const normalized = list.map(NormalizeRow).filter(Boolean);
        setItems(normalized);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          const msg = err?.response?.data?.message || "কার্ট লোড করা যায়নি";
          setError(msg);
          toast.error(msg);
          setItems([]);
        }
      })
      .finally(() => {
        setFetched(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [navigate, token]);

  useEffect(() => setPage(1), [q, sort, limit]);


useEffect(() => {
  const timers = qtyTimersRef.current;
  return () => {
    Object.values(timers).forEach((t) => clearTimeout(t));
  };
}, []);

const changeQuantity = (productId, next) => {
  const val = clamp(next, 1);
  setItems((prev) =>
    prev.map((it) =>
      it.productId === productId ? { ...it, quantity: val } : it
    )
  );
  setSavingQuantity((m) => ({ ...m, [productId]: true }));
  const timers = qtyTimersRef.current;
  if (timers[productId]) clearTimeout(timers[productId]);
  timers[productId] = setTimeout(async () => {
    try {
      await axios.put(
        `${Api}/api/v1/addToCart/update`,
        { productId, quantity: val },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("পরিমাণ আপডেট হয়েছে");
    } catch {
      toast.error("পরিমাণ আপডেট করা যায়নি");
      try {
        const res = await axios.get(`${Api}/api/v1/addToCart/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res?.data?.data || res?.data || {};
        const list = Array.isArray(data.items) ? data.items : [];
        setItems(list.map(NormalizeRow).filter(Boolean));
      } catch {
        setItems((prev) =>
          prev.map((it) =>
            it.productId === productId ? { ...it, quantity: 1 } : it
          )
        );
      }
    } finally {
      setSavingQuantity((m) => {
        const n = { ...m };
        delete n[productId];
        return n;
      });
      delete qtyTimersRef.current[productId];
    }
  }, 350);
};

const dec = (productId) => {
  const cur = items.find((i) => i.productId === productId)?.quantity || 1;
  changeQuantity(productId, cur - 1);
};

const inc = (productId) => {
  const cur = items.find((i) => i.productId === productId)?.quantity || 1;
  changeQuantity(productId, cur + 1);
};



  const removeItem = async (productId) => {
    setBusyRemove((m) => ({ ...m, [productId]: true }));
    const prev = items;
    setItems((arr) => arr.filter((it) => it.productId !== productId));
    try {
      await axios.delete(`${Api}/api/v1/addToCart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      emitShopStateChange({ cartDelta: -1 });
      toast.success("কার্ট থেকে সরানো হয়েছে");
    } catch {
      toast.error("সরানো যায়নি");
      setItems(prev);
    } finally {
      setBusyRemove((m) => {
        const c = { ...m };
        delete c[productId];
        return c;
      });
    }
  };

  const filtered = useMemo(() => {
    let arr = [...items];
    if (q) {
      const words = q.toLowerCase().split(/\s+/).filter(Boolean);
      arr = arr.filter((i) => {
        const hay = [i.name, i.description, i.category].join(" ").toLowerCase();
        return words.every((w) => hay.includes(w));
      });
    }
    if (sort === "recent")
      arr.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    else if (sort === "price_asc") arr.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") arr.sort((a, b) => b.price - a.price);
    else if (sort === "name_asc")
      arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [items, q, sort]);

  const effectiveTotal = filtered.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / limit));
  const pageStart = (page - 1) * limit;
  const pageItems = filtered.slice(pageStart, pageStart + limit);


  const subtotal = useMemo(() => {
    return (Array.isArray(items) ? items : []).reduce(
      (sum, item) => sum + priceNum(item?.price ?? 0) * (Number(item?.quantity) || 0),
      0,
    );
  }, [items]);

  const showSkeleton = loading || !fetched;
  const deliveryFee = 0;
  const fullName = userProfile?.name || "Wholesaler";
  const phoneNumber = userProfile?.phone || "N/A";
  const city = userProfile?.district || userProfile?.division || "N/A";
  const addressLine = [
    userProfile?.address,
    userProfile?.thana,
    userProfile?.district,
    userProfile?.division,
  ]
    .filter(Boolean)
    .join(", ");

  const handleCheckout = async () => {
    if (!items.length) {
      toast.error("কার্ট খালি");
      return;
    }

    setCheckingOut(true);
    try {
      await axios.post(
        `${Api}${ApiPaths.order.create}`,
        {
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress: {
            fullName,
            phoneNumber,
            address: addressLine || "N/A",
            city,
          },
          paymentMethod: "cash_on_delivery",
          orderNotes: "পাইকার ক্যাশ অন ডেলিভারি অর্ডার",
          deliveryFee,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      emitShopStateChange({ cartDelta: -items.length });
      setItems([]);
      toast.success("অর্ডার তৈরি হয়েছে");
      navigate("/dashboard/wholesaler/sell-post");
    } catch (e) {
      const msg = e?.response?.data?.message || "অর্ডার তৈরি করা যায়নি";
      toast.error(msg);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="w-full px-4 pt-6 pb-24">
      <Toaster position="top-right" toastOptions={{ duration: 2200 }} />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-semibold text-gray-800">কার্ট</h2>
          {showSkeleton ? (
            <span className="h-6 w-16 rounded-full bg-emerald-50 border border-emerald-200 animate-pulse" />
          ) : (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              মোট {items.length}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="কার্টে খুঁজুন"
              className="w-full rounded-full border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="recent">সাজান: সম্প্রতি যোগ করা</option>
            <option value="price_asc">দাম: কম থেকে বেশি</option>
            <option value="price_desc">দাম: বেশি থেকে কম</option>
            <option value="name_asc">নাম: ক → হ</option>
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value={12}>প্রতি পেইজ: ১২</option>
            <option value={24}>প্রতি পেইজ: ২৪</option>
            <option value={48}>প্রতি পেইজ: ৪৮</option>
          </select>
        </div>
      </div>

      {error && (
        <ErrorBlock message={error} onRetry={() => window.location.reload()} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div
          className="w-full grid gap-6 items-stretch [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]"
          aria-busy={showSkeleton}
        >
          {showSkeleton &&
            Array.from({ length: Math.max(limit, 6) }).map((_, i) => (
              <CardSkeleton key={`sk-${i}`} />
            ))}

          {!showSkeleton &&
            pageItems.map((it) => {
              const href = `/products/${it.productId}`;
              const lineSubtotal =
                priceNum(it.price) * (Number(it.quantity) || 0);
              const removing = !!busyRemove[it.productId];
              const isSaving = !!savingQuantity[it.productId];

              return (
                <div key={it.cartId} className="h-full">
                  <div className="bg-white border border-gray-200 rounded-xl h-full flex flex-col">
                    <Link
                      to={href}
                      className="block rounded-t-xl overflow-hidden"
                    >
                      <div className="w-full h-40 bg-gray-100">
                        <img
                          src={
                            it.image ||
                            "https://placehold.co/600x450?text=না+ছবি"
                          }
                          alt={it.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/600x450?text=না+ছবি";
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
                        ৳{" "}
                        <span className="font-semibold">{money(it.price)}</span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div
                          className={`inline-flex items-center rounded-full border bg-white ${
                            isSaving ? "opacity-70 pointer-events-none" : ""
                          }`}
                        >
                          <button
                            onClick={() => dec(it.productId)}
                            className="px-2 py-1 text-lg leading-none cursor-pointer"
                            aria-label="পরিমাণ কমান"
                          >
                            −
                          </button>
                          <span className="px-3 select-none">
                            {it.quantity}
                          </span>
                          <button
                            onClick={() => inc(it.productId)}
                            className="px-2 py-1 text-lg leading-none cursor-pointer"
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
                              <span className="font-medium">
                                ৳ {money(lineSubtotal)}
                              </span>
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
                          } bg-white cursor-pointer`}
                          title="সরান"
                        >
                          <FaTrash className="h-4 w-4" />
                          সরান
                        </button>

                        <Link
                          to={href}
                          className="text-xs font-medium text-green hover:underline"
                        >
                          বিস্তারিত দেখুন
                        </Link>
                      </div>

                    
                    </div>
                  </div>
                </div>
              );
            })}

          {!showSkeleton && effectiveTotal === 0 && !error && (
            <div className="mt-2 w-full rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-600 col-span-full">
              আপনার কার্ট খালি।
            </div>
          )}
        </div>

        {(showSkeleton || items.length > 0) && (
          <aside className="bg-white border border-gray-200 rounded-xl p-4 h-max sticky top-20">
            <p className="font-semibold text-gray-800">সারসংক্ষেপ</p>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>আইটেম</span>
              <span>{items.length}</span>
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
              ৳ {(subtotal + deliveryFee).toLocaleString()}
            </span>
          </div>
          <button
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 transition-colors cursor-pointer"
            onClick={handleCheckout}
            disabled={checkingOut || !items.length || profileLoading}
          >
            <IoBagCheckOutline className="h-5 w-5" />
            {checkingOut ? "অর্ডার তৈরি হচ্ছে…" : "চেকআউট"}
          </button>
            <button
              className="mt-2 w-full rounded-full border px-5 py-2 text-sm hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate("/products")}
            >
              কেনাকাটা চালিয়ে যান
            </button>
          </aside>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          পৃষ্ঠা {page} / {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50 hover:border-green-500 cursor-pointer"
          >
            <FaChevronLeft className="h-3 w-3" /> পূর্ববর্তী
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50 hover:border-green-500 cursor-pointer"
          >
            পরবর্তী <FaChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
