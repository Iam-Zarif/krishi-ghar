import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import {
  createSellPostForRole,
  getApprovedProductsForRole,
  getBulkPostsForRole,
  getOwnProductsForSupersaler,
  getPurchasedProductsForWholesaler,
  getPurchasedProductsForSupersaler,
  getProducerApprovedProductsForSupersaler,
  normalizeApiRole,
} from "../../../../api/resellerProducts";
import { addProductToCart } from "../../../../api/shopActions";
import { ITEMS_PER_PAGE, VIEW_META } from "./constants";
import { filterAndSortProducts } from "./utils";

export default function useResellerApprovedProducts({
  role,
  viewKey,
  sourceKey = viewKey,
}) {
  const token = localStorage.getItem("token") || Cookies.get("token");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [reloadTick, setReloadTick] = useState(0);
  const [busyMap, setBusyMap] = useState({});

  const meta =
    VIEW_META[sourceKey] || VIEW_META[viewKey] || VIEW_META["producer-products"];

  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(search.trim().toLowerCase());
      setPage(1);
    }, 250);

    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    const apiRole = normalizeApiRole(role);
    const loader =
      sourceKey === "producer-products" && apiRole === "supersaler"
        ? getProducerApprovedProductsForSupersaler
        : sourceKey === "approved-products" && apiRole === "supersaler"
        ? getApprovedProductsForRole
        : sourceKey === "own-products" && apiRole === "supersaler"
        ? getOwnProductsForSupersaler
        : sourceKey === "all-products" && apiRole === "supersaler"
        ? getOwnProductsForSupersaler
        : sourceKey === "all-products"
        ? getBulkPostsForRole
        : sourceKey === "sell-post" && apiRole === "wholesaler"
          ? getPurchasedProductsForWholesaler
        : sourceKey === "sell-post" && apiRole === "supersaler"
          ? getPurchasedProductsForSupersaler
          : getApprovedProductsForRole;

    loader({
      role,
      token,
      signal: controller.signal,
    })
      .then((list) => {
        setProducts(list);
      })
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.name === "AbortError") {
          return;
        }
        setError(err?.response?.data?.message || "পণ্য লোড করা যায়নি");
      })
      .finally(() => {
        setLoading(false);
        setLoaded(true);
      });

    return () => controller.abort();
  }, [role, sourceKey, token, reloadTick]);

  const visibleProducts = useMemo(
    () =>
      filterAndSortProducts({
        products,
        query,
        sort,
        viewKey: sourceKey,
      }),
    [products, query, sort, sourceKey]
  );

  const total = visibleProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = visibleProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleSell = async (product, sellPostPayload = null) => {
    if (!product?._id || !token) {
      toast.error("লগইন ছাড়া এই কাজটি করা যাবে না");
      return;
    }

    setBusyMap((prev) => ({ ...prev, [product._id]: true }));
    try {
      if (viewKey === "producer-products") {
        await toast.promise(
          addProductToCart({
            productId: product._id,
            quantity: 1,
            price: product.priceNumber || product.price,
            token,
            role,
          }),
          {
            loading: meta.busyLabel || "কার্টে যোগ হচ্ছে…",
            success: meta.doneLabel || "কার্টে যোগ হয়েছে",
            error: (err) =>
              err?.response?.data?.message || "কার্টে যোগ করা যায়নি",
          }
        );
        return;
      }

      const payload = {
        productId: product.detailProductId || product._id,
        sellType: sellPostPayload?.sellType || "bulk",
        quantity: Number(sellPostPayload?.quantity || product.quantity || 1),
        unit: sellPostPayload?.unit || product.unit || "kg",
        sellingPricePerKg: Number(
          sellPostPayload?.sellingPricePerKg ||
            product.pricePerKg ||
            product.priceNumber ||
            product.price ||
            0
        ),
      };

      if (!payload.productId) {
        toast.error("পণ্যের আইডি পাওয়া যায়নি");
        return;
      }

      if (!payload.quantity || payload.quantity <= 0) {
        toast.error("সঠিক পরিমাণ দিন");
        return;
      }

      if (!payload.sellingPricePerKg || payload.sellingPricePerKg <= 0) {
        toast.error("সঠিক বিক্রয় মূল্য দিন");
        return;
      }

      const res = await toast.promise(
        createSellPostForRole({
          role,
          token,
          payload,
        }),
        {
          loading: "সেল পোস্ট তৈরি হচ্ছে…",
          success: (data) =>
            data?.message || "সেল পোস্ট তৈরি হয়েছে",
          error: (err) =>
            err?.response?.data?.message || "সেল পোস্ট তৈরি করা যায়নি",
        }
      );

      if (res?.sellPost?._id) {
        setProducts((prev) =>
          prev.map((item) =>
            item._id === product._id ? { ...item, isSelling: true } : item
          )
        );
      } else {
        setReloadTick((prev) => prev + 1);
      }
    } finally {
      setBusyMap((prev) => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
    }
  };

  return {
    meta,
    search,
    setSearch,
    sort,
    setSort,
    currentPage,
    setPage,
    totalPages,
    total,
    loading,
    loaded,
    error,
    pageItems,
    busyMap,
    handleSell,
    retry: () => setReloadTick((prev) => prev + 1),
  };
}
