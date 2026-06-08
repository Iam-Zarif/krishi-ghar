/* eslint-disable react/prop-types */
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Api } from "../../../../api/API";
import { addProductToCart } from "../../../../api/shopActions";
import { emitShopStateChange } from "../../../../utils/shopSignals";
import {
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { IoBagCheckOutline } from "react-icons/io5";
import { UserProfileContext } from "../../../../providers/getUserProfile/getUserProfile";
import SkeletonLoader from "../../../../components/common/SkeletonLoader";

const n = (v) => (Number.isNaN(Number(v)) ? 0 : Number(v));
const money = (v) => n(v).toLocaleString();
const norm = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase();

const normalizeWishlistItem = (item = {}, index = 0) => {
  const product =
    item?.productId && typeof item.productId === "object"
      ? item.productId
      : item?.product && typeof item.product === "object"
        ? item.product
        : {};

  return {
    id: String(item?._id || item?.id || `wishlist-${index}`),
    productId: String(
      product?._id || product?.id || item?.productId || item?.product || ""
    ),
    productName:
      product?.productName || product?.name || item?.productName || item?.name || "",
    description: product?.description || item?.description || "",
    image: product?.image || item?.image || "",
    price:
      product?.price ??
      product?.discountPrice ??
      item?.price ??
      item?.discountPrice ??
      0,
    categoryId:
      product?.category?._id || product?.category || item?.categoryId || item?.category || "",
    categoryName:
      product?.category?.name || item?.categoryName || product?.categoryName || "",
    addedAt: item?.addedAt || item?.createdAt || item?.updatedAt || "",
    formattedDate: item?.formattedDate || "",
  };
};

function Chip({ children, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
        active
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function CardSkeleton() {
  return <SkeletonLoader variant="card" action="icon" />;
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

const SupersellerWishlist = () => {
   const { userProfile, profileLoading } =
     useContext(UserProfileContext);
     console.log("User Profile:", userProfile, profileLoading);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [catNameById, setCatNameById] = useState({});
  const [catIdByName, setCatIdByName] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [reloadTick, setReloadTick] = useState(0);
  const [busyRemove, setBusyRemove] = useState({});
  const [busyBuyNow, setBusyBuyNow] = useState({});
  const [filterCat, setFilterCat] = useState("all");
  const token = localStorage.getItem("token") || Cookies.get("token");
  const abortRef = useRef(null);

  useEffect(() => {
    const id = setTimeout(() => setQ(search.trim()), 250);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (!token) {
      toast.error("ইচ্ছাতালিকা দেখতে লগইন করুন");
      navigate("/auth/login");
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    axios
      .get(`${Api}/api/v1/wishlist/`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      .then((res) => {
        const data = res?.data?.data || {};
        const rawItems = Array.isArray(data.items)
          ? data.items
          : Array.isArray(res?.data?.items)
            ? res.data.items
            : [];
        const list = rawItems.map(normalizeWishlistItem);
        const cats = Array.isArray(data.categoryCounts)
          ? data.categoryCounts
          : [];
        setItems(list);
        setCategoryCounts(cats);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          const msg = err?.response?.data?.message || "ইচ্ছাতালিকা লোড করা যায়নি";
          setError(msg);
          setItems([]);
          toast.error(msg);
        }
      })
      .finally(() => {
        setFetched(true);
        setLoading(false);
      });
    return () => controller.abort();
  }, [reloadTick, navigate, token]);

  useEffect(() => {
    axios
      .get(`${Api}/api/v1/products/categories`)
      .then((res) => {
        const arr = Array.isArray(res?.data?.categories)
          ? res.data.categories
          : [];
        const byId = {};
        const byName = {};
        arr.forEach((c) => {
          const id = String(c._id || c.id || "");
          const nm = String(c.name || "");
          if (id && nm) {
            byId[id] = nm;
            byName[norm(nm)] = id;
          }
        });
        setCatNameById(byId);
        setCatIdByName(byName);
      })
      .catch(() => {});
  }, []);

  useEffect(() => setPage(1), [q, limit, filterCat]);

  const friendlyCats = useMemo(() => {
    return categoryCounts.map((c) => {
      const raw = String(c.category);
      const nm = catNameById[raw] || raw;
      return { key: raw, name: nm, count: c.count };
    });
  }, [categoryCounts, catNameById]);

  const filtered = useMemo(() => {
    let arr = [...items];
    if (filterCat !== "all") {
      const idTarget = /^[a-f0-9]{24}$/i.test(String(filterCat))
        ? String(filterCat)
        : catIdByName[norm(filterCat)] || "";
      const nameTarget = catNameById[filterCat] || filterCat;
      const nameNorm = norm(nameTarget);
      arr = arr.filter((i) => {
        const ids = [
          String(i.categoryId || ""),
          String(i.category?._id || ""),
          String(i.category || ""),
        ];
        const names = [norm(i.categoryName), norm(i.category?.name)];
        return (
          ids.includes(String(filterCat)) ||
          (idTarget && ids.includes(idTarget)) ||
          names.includes(nameNorm)
        );
      });
    }
    if (q) {
      const words = q.toLowerCase().split(/\s+/).filter(Boolean);
      arr = arr.filter((i) => {
        const hay = [
          i.productName,
          i.description,
          i.categoryName,
          i.producerনাম,
        ]
          .join(" ")
          .toLowerCase();
        return words.every((w) => hay.includes(w));
      });
    }
    if (sort === "newest")
      arr.sort(
        (a, b) =>
          new Date(b.addedAt || b.formattedDate || 0) -
          new Date(a.addedAt || a.formattedDate || 0)
      );
    else if (sort === "oldest")
      arr.sort(
        (a, b) =>
          new Date(a.addedAt || a.formattedDate || 0) -
          new Date(b.addedAt || b.formattedDate || 0)
      );
    else if (sort === "price_asc") arr.sort((a, b) => n(a.price) - n(b.price));
    else if (sort === "price_desc") arr.sort((a, b) => n(b.price) - n(a.price));
    return arr;
  }, [items, q, sort, filterCat, catIdByName, catNameById]);

  const effectiveTotal = filtered.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / limit));
  const pageStart = (page - 1) * limit;
  const pageItems = filtered.slice(pageStart, pageStart + limit);
  const showSkeleton = loading || !fetched;

  const removeItem = async (wishId) => {
    if (!wishId) return;
    setBusyRemove((m) => ({ ...m, [wishId]: true }));
    try {
      await toast.promise(
        axios.delete(`${Api}/api/v1/wishlist/${wishId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        {
        loading: "সরানো হচ্ছে...",
        success: "ইচ্ছাতালিকা থেকে সরানো হয়েছে",
          error: (e) => e?.response?.data?.message || "সরানো যায়নি",
        }
      );
      setItems((prev) => {
        const removed = prev.find((x) => x.id === wishId);
        const next = prev.filter((x) => x.id !== wishId);
        if (removed) {
          const key = String(
            removed.categoryId || removed.category || removed.categoryName
          );
          setCategoryCounts((cats) =>
            cats
              .map((c) =>
                String(c.category) === key
                  ? { ...c, count: Math.max(0, (c.count || 1) - 1) }
                  : c
              )
              .filter((c) => c.count > 0)
          );
        }
        emitShopStateChange({ wishlistDelta: -1 });
        return next;
      });
    } finally {
      setBusyRemove((m) => {
        const c = { ...m };
        delete c[wishId];
        return c;
      });
    }
  };

  const handleBuyNow = async (item) => {
    if (!item?.productId) return toast.error("পণ্য পাওয়া যায়নি");
    if (!token) {
      toast.error("কেনার জন্য লগইন করুন");
      navigate("/auth/login");
      return;
    }

    setBusyBuyNow((m) => ({ ...m, [item.id]: true }));
    try {
      await toast.promise(addProductToCart({ productId: item.productId, price: item.price, token }), {
        loading: "কার্টে যোগ করা হচ্ছে…",
        success: "কার্টে যোগ হয়েছে",
        error: (e) => e?.response?.data?.message || "কার্টে যোগ করা যায়নি",
      });
      navigate("/dashboard/superseller/cart");
    } finally {
      setBusyBuyNow((m) => {
        const next = { ...m };
        delete next[item.id];
        return next;
      });
    }
  };

  return (
    <div className="w-full px-4 pt-6 pb-24">
      <Toaster position="top-right" toastOptions={{ duration: 2200 }} />
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-semibold text-gray-800">ইচ্ছাতালিকা</h2>
          {showSkeleton ? (
            <span className="h-6 w-16 rounded-full bg-emerald-50 border border-emerald-200 animate-pulse" />
          ) : (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              মোট {effectiveTotal}
            </span>
          )}
          <div className="flex items-center gap-2">
            <Chip
              active={filterCat === "all"}
              onClick={() => setFilterCat("all")}
            >
              সব
            </Chip>
            {friendlyCats.map((c) => (
              <Chip
                key={c.key}
                active={String(filterCat) === c.key}
                onClick={() => setFilterCat(c.key)}
              >
                {c.name} {c.count}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ইচ্ছাতালিকায় খুঁজুন"
              className="w-full rounded-full border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="newest">সাজান: নতুন</option>
            <option value="oldest">সাজান: পুরাতন</option>
            <option value="price_asc">দাম: কম থেকে বেশি</option>
            <option value="price_desc">দাম: বেশি থেকে কম</option>
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
        <ErrorBlock
          message={error}
          onRetry={() => setReloadTick((t) => t + 1)}
        />
      )}

      <div
        className="w-full grid gap-6 items-stretch [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]"
        aria-busy={showSkeleton}
      >
        {showSkeleton &&
          Array.from({ length: Math.max(limit, 12) }).map((_, i) => (
            <CardSkeleton key={`sk-${i}`} />
          ))}

        {!showSkeleton &&
          pageItems.map((it) => {
            const added =
              it.formattedDate ||
              new Date(it.addedAt || Date.now()).toLocaleDateString();
            const href = `/products/${it.productId}`;
            return (
              <div key={it.id} className="h-full">
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
                        alt={it.productName}
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
                      {it.productName || "পণ্য"}
                    </Link>
                    <div className="mt-1 text-xs text-gray-500 line-clamp-2 min-h-[34px]">
                      {it.description || "—"}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="text-lg font-bold text-green-600">
                        ৳{money(it.price)}
                      </div>
                      <button
                        onClick={() => removeItem(it.id)}
                        disabled={!!busyRemove[it.id]}
                        aria-busy={!!busyRemove[it.id]}
                        className={`h-9 w-9 inline-flex items-center justify-center rounded-full border ${
                          busyRemove[it.id]
                            ? "opacity-50 pointer-events-none"
                            : "hover:border-red-500"
                        } bg-white`}
                        title="সরান"
                      >
                        <FaTrash className="text-gray-600" />
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      যোগ হয়েছে {added}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBuyNow(it)}
                      disabled={!!busyBuyNow[it.id]}
                      className="flex justify-center mt-3 items-center gap-2 rounded-full bg-green text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-green/90 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IoBagCheckOutline className="h-5 w-5" />
                      {busyBuyNow[it.id] ? "যোগ হচ্ছে..." : "এখনই কিনুন"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {!showSkeleton && effectiveTotal === 0 && !error && (
        <div className="mt-10 w-full rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-600">
          আপনার ইচ্ছাতালিকা খালি।
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          পৃষ্ঠা {page} / {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50 hover:border-green-500"
          >
            <FaChevronLeft className="h-3 w-3" /> পূর্ববর্তী
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50 hover:border-green-500"
          >
            পরবর্তী <FaChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupersellerWishlist;
