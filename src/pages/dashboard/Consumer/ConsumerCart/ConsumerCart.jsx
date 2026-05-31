/* eslint-disable react/prop-types */
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { UserProfileContext } from "../../../../providers/getUserProfile/getUserProfile";
import { Api } from "../../../../api/API";
import { emitShopStateChange } from "../../../../utils/shopSignals";
import CartHeader from "./components/CartHeader";
import CartItem from "./components/CartItem";
import CartSummary from "./components/CartSummary";
import CartPagination from "./components/CartPagination";
import SkeletonLoader from "../../../../components/common/SkeletonLoader";

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

function CardSkeleton() {
  return <SkeletonLoader variant="card" />;
}

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

const normalizeRow = (row) => {
  const p = row && typeof row.productId === "object" ? row.productId : row;
  const productId = String(p?._id || row.productId || "");
  return {
    cartId: String(row._id || `${productId}-${row.quantity || 1}`),
    productId,
    name: String(p?.productName || p?.name || row.productName || "পণ্য"),
    image:
      p?.image || row.image || "https://placehold.co/600x450?text=না+ছবি",
    description: String(p?.description || row.description || ""),
    category:
      p?.category?.name ||
      p?.categoryName ||
      (typeof p?.category === "string" ? p.category : "") ||
      "",
    price: priceNum(
      p?.price ?? p?.discountPrice ?? p?.previousPrice ?? row.price
    ),
    quantity: Number(row.quantity ?? p?.quantity) || 1,
    addedAt: row.createdAt || p?.createdAt || 0,
  };
};

export default function ConsumerCart() {
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
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const deliveryFee = 60;
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
        const normalized = list.map(normalizeRow);
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
    return () => {
      const timers = qtyTimersRef.current;
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
          setItems(list.map(normalizeRow));
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
    const lines = (Array.isArray(items) ? items : []).map((it) => ({
      id: it.productId,
      price: priceNum(it?.price ?? 0),
      qty: Number(it?.quantity) || 0,
    }));
    const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
    return total;
  }, [items]);

  const showSkeleton = loading || !fetched;

  const fullName = userProfile?.name || "ক্রেতা";
  const phoneNumber = userProfile?.phone || "";
  const city = userProfile?.district || userProfile?.division || "ঢাকা";
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
      const payload = {
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        })),
        shippingAddress: {
          fullName,
          phoneNumber,
          address: addressLine || "N/A",
          city,
        },
        paymentMethod,
        orderNotes: "",
        deliveryFee,
      };
      await axios.post(`${Api}/api/v1/order/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("অর্ডার তৈরি হয়েছে");
      if (typeof window !== "undefined") {
        window.localStorage.setItem("consumerProfile.activeTab", "orders");
        window.localStorage.setItem("consumerProfile.orderTab", "pending");
      }
      navigate("/consumer");
    } catch (e) {
      const msg = e?.response?.data?.message || "অর্ডার তৈরি করা যায়নি";
      toast.error(msg);
    } finally {
      setCheckingOut(false);
    }
  };

  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="w-full px-4 pt-6 pb-24 max-w-[1200px] lg:pt-[6rem] 2xl:max-w-[1400px] mx-auto ">
      <Toaster position="top-right" toastOptions={{ duration: 2200 }} />
      <CartHeader
        itemsLength={items.length}
        showSkeleton={showSkeleton}
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        limit={limit}
        setLimit={setLimit}
      />

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
            pageItems.map((it) => (
              <CartItem
                key={it.productId}
                it={it}
                dec={dec}
                inc={inc}
                removeItem={removeItem}
                busyRemove={busyRemove}
                savingQuantity={savingQuantity}
                priceNum={priceNum}
                money={money}
              />
            ))}
          {!showSkeleton && effectiveTotal === 0 && !error && (
            <div className="mt-2 w-full rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-600 col-span-full">
          আপনার কার্ট খালি।
            </div>
          )}
        </div>

        {(showSkeleton || items.length > 0) && (
          <CartSummary
            profileLoading={profileLoading}
            fullName={fullName}
            phoneNumber={phoneNumber}
            addressLine={addressLine}
            city={city}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            itemsLength={items.length}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            grandTotal={grandTotal}
            handleCheckout={handleCheckout}
            checkingOut={checkingOut}
            navigate={navigate}
          />
        )}
      </div>

      <CartPagination
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        loading={loading}
      />
    </div>
  );
}
