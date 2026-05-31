import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { CiSearch, CiCircleRemove } from "react-icons/ci";
import { FaArrowLeft } from "react-icons/fa6";
import { Api } from "../../api/API";
import SkeletonLoader from "../../components/common/SkeletonLoader";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\w\u0980-\u09FF]/g, "");

const withId = (doc = {}) => ({
  ...doc,
  id: doc._id ?? doc.id,
});

const getCategoryText = (product) => {
  const category = product?.category;
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.name || category.title || category.categoryName || "";
};

const isInCategory = (product, keywords) => {
  const haystack = normalizeText(
    [
      getCategoryText(product),
      product?.productName,
      product?.name,
      product?.description,
    ].join(" "),
  );
  return keywords.some((keyword) => haystack.includes(normalizeText(keyword)));
};

const getProductName = (product) =>
  product?.productName || product?.name || "নামহীন পণ্য";

const getProductImage = (product) =>
  product?.image || product?.bannerImage || "https://placehold.co/600x400?text=%20";

const CategoryProductsPage = ({ title, searchPlaceholder, keywords }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`${Api}/api/v1/products`);
        if (ignore) return;
        const rows = Array.isArray(response.data?.products)
          ? response.data.products
          : [];
        setProducts(rows.map(withId).filter((item) => isInCategory(item, keywords)));
      } catch (err) {
        if (!ignore) {
          setError(err?.response?.data?.message || "পণ্য লোড করা যায়নি");
          setProducts([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProducts();
    return () => {
      ignore = true;
    };
  }, [keywords]);

  const visibleProducts = useMemo(() => {
    const query = normalizeText(search);
    const filtered = query
      ? products.filter((product) =>
          normalizeText(
            [getProductName(product), getCategoryText(product), product?.description].join(" "),
          ).includes(query),
        )
      : [...products];

    if (sort === "priceLow") {
      filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sort === "priceHigh") {
      filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sort === "latest") {
      filtered.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0),
      );
    }

    return filtered;
  }, [products, search, sort]);

  return (
    <div className="min-h-screen bg-[#ffffde2e] px-4 pb-16 pt-28">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
              aria-label="পেছনে যান"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                সার্ভার থেকে পাওয়া পণ্য দেখানো হচ্ছে
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px] md:w-[520px]">
            <div className="relative">
              <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-10 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-red-500"
                  aria-label="সার্চ মুছুন"
                >
                  <CiCircleRemove className="text-xl" />
                </button>
              )}
            </div>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">সাজান</option>
              <option value="latest">সর্বশেষ</option>
              <option value="priceLow">কম দাম আগে</option>
              <option value="priceHigh">বেশি দাম আগে</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <SkeletonLoader count={8} action="none" />
          </div>
        ) : visibleProducts.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <img
                  src={getProductImage(product)}
                  alt={getProductName(product)}
                  className="h-52 w-full object-cover"
                  loading="lazy"
                />
                <div className="space-y-2 p-4">
                  <p className="text-xs font-medium text-emerald-700">
                    {getCategoryText(product) || "ক্যাটাগরি নেই"}
                  </p>
                  <h2 className="line-clamp-2 min-h-12 font-semibold text-gray-900">
                    {getProductName(product)}
                  </h2>
                  <p className="text-lg font-bold text-emerald-700">
                    ৳ {Number(product.price || 0).toLocaleString("bn-BD")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
            <p className="text-lg font-semibold text-gray-800">পণ্য পাওয়া যায়নি</p>
            <p className="mt-2 text-sm text-gray-500">
              এই ক্যাটাগরির জন্য সার্ভার থেকে কোনো পণ্য পাওয়া যায়নি।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;
