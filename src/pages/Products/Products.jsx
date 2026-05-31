import { useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Api } from "../../api/API";
import { Rating } from "@smastrom/react-rating";
import { CiHeart } from "react-icons/ci";
import { IoIosArrowForward } from "react-icons/io";
import { FiRefreshCw } from "react-icons/fi";
import { Link, useSearchParams } from "react-router-dom";
import { normalizeSearchTerm, saveRecentSearch } from "../../utils/searchHistory";
import { usePageSeo } from "../../utils/seo";
import { UserProfileContext } from "../../providers/getUserProfile/getUserProfile";
import SkeletonLoader from "../../components/common/SkeletonLoader";

const Products = () => {
  const { userProfile } = useContext(UserProfileContext);
  const isConsumer = String(userProfile?.role || "").toLowerCase() === "consumer";
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [catsError, setCatsError] = useState("");
  const [q, setQ] = useState(() => searchParams.get("search") || "");
  const [sort, setSort] = useState("latest");
  const [cat, setCat] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [visible, setVisible] = useState(20);
  const [skeletonCount, setSkeletonCount] = useState(10);
  const debounceRef = useRef(null);

  usePageSeo({
    title: q
      ? `${q} সম্পর্কিত পণ্য | কৃষিঘর`
      : "সকল পণ্য | কৃষিঘর",
    description: q
      ? `কৃষিঘরে ${q} সম্পর্কিত পণ্য খুঁজুন। প্রাসঙ্গিক কৃষিপণ্য, দাম ও ক্যাটাগরি একসাথে দেখুন।`
      : "কৃষিঘরের সকল কৃষিপণ্য, ক্যাটাগরি, মূল্য এবং ফিল্টার সুবিধা একসাথে দেখুন।",
    keywords: q
      ? `${q}, কৃষিপণ্য, কৃষিঘর অনুসন্ধান, বাংলাদেশ কৃষিপণ্য`
      : "সকল পণ্য, কৃষিপণ্য, বাংলাদেশ কৃষি মার্কেটপ্লেস, কৃষিঘর পণ্য",
    path: q ? `/products?search=${encodeURIComponent(q)}` : "/products",
  });

  const slug = (s) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const fetchCategories = async (source) => {
    try {
      setCatsError("");
      setCatsLoading(true);
      const token = localStorage.getItem("token");
      const auth = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${Api}/api/v1/products/categories`, {
        headers: auth,
        cancelToken: source.token,
      });
      const raw = Array.isArray(res.data?.categories)
        ? res.data.categories
        : [];
      setCategories(
        raw.map((c) => ({
          id: c._id || c.id,
          name: c.name,
          icon: c.icon,
          to: `/${slug(c.name)}`,
        }))
      );
    } catch (e) {
      if (!axios.isCancel(e))
        setCatsError(
          e.response?.data?.message || e.message || "ক্যাটাগরি লোড করা যায়নি"
        );
    } finally {
      setCatsLoading(false);
    }
  };

  const fetchProducts = async (source) => {
    try {
      setError("");
      setLoading(true);
      const token = localStorage.getItem("token");
      const auth = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${Api}/api/v1/products`, {
        headers: auth,
        cancelToken: source.token,
      });
      const arr = Array.isArray(res.data?.products) ? res.data.products : [];
      setProducts(arr);
    } catch (e) {
      if (!axios.isCancel(e))
        setError(
          e.response?.data?.message || e.message || "পণ্য লোড করা যায়নি"
        );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const source = axios.CancelToken.source();
    fetchCategories(source);
    fetchProducts(source);
    return () => source.cancel("Unmounted");
  }, []);

  useEffect(() => {
    const nextSearch = searchParams.get("search") || "";
    if (nextSearch !== q) {
      setQ(nextSearch);
      setVisible(20);
    }
  }, [searchParams, q]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setVisible(20);
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [q, sort, cat, minPrice, maxPrice]);

  useEffect(() => {
    const updateSkeletonCount = () => {
      const width = window.innerWidth;

      if (width >= 1280) {
        setSkeletonCount(10);
        return;
      }
      if (width >= 768) {
        setSkeletonCount(8);
        return;
      }
      if (width >= 640) {
        setSkeletonCount(6);
        return;
      }

      setSkeletonCount(4);
    };

    updateSkeletonCount();
    window.addEventListener("resize", updateSkeletonCount);
    return () => window.removeEventListener("resize", updateSkeletonCount);
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          String(p.productName || p.name || "")
            .toLowerCase()
            .includes(s) ||
          String(p.category?.name || "")
            .toLowerCase()
            .includes(s)
      );
    }
    if (cat !== "all")
      list = list.filter(
        (p) => String(p.category?.name || "").toLowerCase() === cat
      );
    const min = Number(minPrice) || 0;
    const max = Number(maxPrice) || 0;
    if (min > 0)
      list = list.filter((p) => Number(p.price ?? p.discountPrice ?? 0) >= min);
    if (max > 0)
      list = list.filter((p) => Number(p.price ?? p.discountPrice ?? 0) <= max);
    if (sort === "latest")
      list.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    if (sort === "low")
      list.sort(
        (a, b) =>
          Number(a.price ?? a.discountPrice ?? 0) -
          Number(b.price ?? b.discountPrice ?? 0)
      );
    if (sort === "high")
      list.sort(
        (a, b) =>
          Number(b.price ?? b.discountPrice ?? 0) -
          Number(a.price ?? a.discountPrice ?? 0)
      );
    if (sort === "popular")
      list.sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0));
    return list;
  }, [products, q, sort, cat, minPrice, maxPrice]);

  const resetFilters = () => {
    setQ("");
    setSort("latest");
    setCat("all");
    setMinPrice("");
    setMaxPrice("");
    setVisible(20);
    setSearchParams({}, { replace: true });
  };

  const applySearch = (value) => {
    const term = normalizeSearchTerm(value);
    if (!term) {
      setSearchParams({}, { replace: true });
      return;
    }

    setSearchParams({ search: term }, { replace: true });

    const matchedProduct = products.find((product) =>
      String(product?.productName || product?.name || "")
        .toLowerCase()
        .includes(term.toLowerCase())
    );

    saveRecentSearch({
      id: matchedProduct?._id || matchedProduct?.id || term.toLowerCase(),
      term,
      name: matchedProduct?.productName || matchedProduct?.name || term,
      image: matchedProduct?.image || "",
    });
  };

  return (
    <div className="pt-28 pb-20 bg-[#ffffde2e]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-800">
            সকল পণ্য
          </h1>
          <div className="mt-1 text-sm text-gray-500">
            {loading ? "লোড হচ্ছে..." : `${filtered.length}টি পণ্য`}
          </div>
        </div>

        {(error || catsError) && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <span>{error || catsError}</span>
            <button
              onClick={() => {
                const src = axios.CancelToken.source();
                fetchCategories(src);
                fetchProducts(src);
              }}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 hover:bg-white"
            >
              <FiRefreshCw /> আবার চেষ্টা করুন
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6 items-start">
          <aside className="lg:sticky lg:top-28">
            <div className="rounded-xl border bg-white p-4 sm:p-5 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-gray-800">ফিল্টার</p>
                  <p className="text-xs text-gray-500 mt-1">ক্যাটাগরি, দাম ও সর্টিং</p>
                </div>
                <button
                  onClick={resetFilters}
                  className="whitespace-nowrap rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                  title="ফিল্টার রিসেট করুন"
                >
                  রিসেট
                </button>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">অনুসন্ধান</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    applySearch(q);
                  }}
                >
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-green"
                    placeholder="পণ্য বা ক্যাটাগরি খুঁজুন"
                  />
                </form>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">ক্যাটাগরি</p>
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white"
                >
                  <option value="all">সব ক্যাটাগরি</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name.toLowerCase()}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {!catsLoading && categories.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">দ্রুত বাছাই</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/products"
                      onClick={() => setCat("all")}
                      className={`px-3 py-1.5 rounded-full border text-sm ${
                        cat === "all"
                          ? "bg-green text-white border-green"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      সব
                    </Link>
                    {categories.slice(0, 12).map((c) => (
                      <Link
                        key={c.id}
                        to={c.to}
                        onClick={(e) => {
                          e.preventDefault();
                          setCat(c.name.toLowerCase());
                        }}
                        className={`px-3 py-1.5 rounded-full border text-sm ${
                          cat === c.name.toLowerCase()
                            ? "bg-green text-white border-green"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">দামের সীমা</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-green"
                    placeholder="সর্বনিম্ন ৳"
                  />
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-green"
                    placeholder="সর্বোচ্চ ৳"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">সর্টিং</p>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white"
                >
                  <option value="latest">সর্বশেষ</option>
                  <option value="popular">সবচেয়ে জনপ্রিয়</option>
                  <option value="low">দাম: কম থেকে বেশি</option>
                  <option value="high">দাম: বেশি থেকে কম</option>
                </select>
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 rounded-xl border bg-white px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {q ? `"${q}"` : "সকল পণ্য"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {loading ? "লোড হচ্ছে..." : `${filtered.length}টি পণ্য পাওয়া গেছে`}
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  সর্টিং:{" "}
                  <span className="font-medium text-gray-700">
                    {sort === "latest"
                      ? "সর্বশেষ"
                      : sort === "popular"
                        ? "সবচেয়ে জনপ্রিয়"
                        : sort === "low"
                          ? "দাম: কম থেকে বেশি"
                          : "দাম: বেশি থেকে কম"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: skeletonCount }).map((_, i) => (
                <SkeletonLoader key={i} variant="card" action="none" />
              ))
            : filtered.slice(0, visible).map((p, i) => {
                const id = p?._id || p?.id;
                const price = Number(p.price ?? p.discountPrice ?? 0);
                const orig = Number(p.originalPrice ?? 0);

                // If no id, render a non-link block to avoid broken routes
                const CardTag = id ? Link : "div";
                const cardProps = id ? { to: `/products/${id}` } : {};

                return (
                  <CardTag
                    key={id || i}
                    {...cardProps}
                    className="group block relative bg-white cursor-pointer border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    {isConsumer && (
                      <CiHeart
                        className="absolute top-2 right-2 md:top-3 md:right-3 bg-white p-1 rounded-full text-2xl md:text-3xl cursor-pointer border"
                        onClick={(e) => e.preventDefault()}
                        title="ইচ্ছেতালিকায় যোগ করুন"
                      />
                    )}
                    <img
                      src={p.image}
                      alt={p.productName || p.name || "পণ্য"}
                      className="w-full h-36 sm:h-40 md:h-48 object-cover rounded-t-xl"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/400x300?text=%20";
                      }}
                    />
                    <div className="p-3 md:p-4">
                      <h3 className="text-sm md:text-md font-semibold text-gray-800 line-clamp-1 group-hover:underline">
                        {p.productName || p.name || "নাম দেওয়া হয়নি"}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500">
                        {p.category?.name || "বিভাগ"}
                      </p>
                      <div className="mt-1.5 md:mt-2 flex items-center gap-2">
                        <span className="text-base md:text-lg font-bold text-green-600">
                          ৳{price}
                        </span>
                        {!!orig && orig > price && (
                          <span className="text-xs md:text-sm line-through text-gray-400">
                            ৳{orig}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 md:mt-2 flex justify-between items-center text-xs md:text-sm text-gray-500">
                        <span>
                          {Number(p.sold || 0) >= 1000
                            ? `${(Number(p.sold || 0) / 1000).toFixed(1)}k`
                            : Number(p.sold || 0)}{" "}
                          বিক্রি
                        </span>
                        <Rating
                          value={Number(p.rating || 4.2)}
                          readOnly
                          style={{ maxWidth: 80 }}
                        />
                      </div>
                    </div>
                  </CardTag>
                );
              })}
            </div>

            {!loading && filtered.length === 0 && (
              <div className="mt-12 rounded-xl border bg-white p-8 text-center text-gray-600">
                কোনও পণ্য মেলেনি।
              </div>
            )}

            {!loading && filtered.length > visible && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setVisible((v) => v + 20)}
                  className="px-6 flex items-center gap-2 py-2.5 rounded-lg text-white bg-green transition duration-300 shadow-md hover:shadow-yellow-300"
                >
                  আরও দেখুন <IoIosArrowForward />
                </button>
              </div>
            )}
          </section>
      </div>
    </div>
    </div>
  );
};

export default Products;
