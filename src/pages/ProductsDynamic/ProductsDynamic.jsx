import { lazy, Suspense, useContext, useEffect, useMemo, useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { addProductToCart, addProductToWishlist } from "../../api/shopActions";
import { seoDefaultImage, toAbsoluteSeoUrl, usePageSeo } from "../../utils/seo";
import { UserProfileContext } from "../../providers/getUserProfile/getUserProfile";
import { useProductReviews } from "./hooks/useProductReviews";
import ReviewsPanelSkeleton from "./components/ReviewsPanelSkeleton";
import ProductBreadcrumb from "./components/ProductBreadcrumb";
import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";
import ProductProducer from "./components/ProductProducer";
import SkeletonLoader from "../../components/common/SkeletonLoader";

const ProductReviewsPanel = lazy(() =>
  import("./components/ProductReviewsPanel")
);
const ProductFaqPanel = lazy(() => import("./components/ProductFaqPanel"));

const currency = (n) => {
  const num = Number(n ?? 0);
  if (!Number.isFinite(num)) return "—";
  return "৳" + num.toLocaleString();
};
const safeStr = (s, fallback = "—") =>
  typeof s === "string" && s.trim() ? s : fallback;
const imgOk = (url) =>
  typeof url === "string" && /^https?:\/\//i.test(url)
    ? url
    : "https://via.placeholder.com/800x600?text=%20";

const Skeleton = () => <SkeletonLoader variant="product-detail" />;

export default function ProductsDynamic() {
  const navigate = useNavigate();
  const loaderRes = useLoaderData();
  const { userProfile } = useContext(UserProfileContext);
  const [err, setErr] = useState("");
  const [loading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [wishing, setWishing] = useState(false);
  const token = localStorage.getItem("token") || Cookies.get("token");

  const product =
    loaderRes?.product ||
    loaderRes?.data?.product ||
    (loaderRes?.data && !loaderRes?.data?.message ? loaderRes?.data : null) ||
    null;

  usePageSeo({
    title: product?.productName
      ? `${product.productName} | কৃষিঘর`
      : "পণ্যের বিবরণ | কৃষিঘর",
    description:
      product?.description?.slice(0, 160) ||
      "কৃষিঘরে পণ্যের বিবরণ, মূল্য, ক্যাটাগরি, রেটিং এবং সম্পর্কিত তথ্য দেখুন।",
    keywords: [
      product?.productName,
      product?.category?.name,
      "কৃষিঘর পণ্য",
      "বাংলাদেশ কৃষি মার্কেটপ্লেস",
    ]
      .filter(Boolean)
      .join(", "),
    path: product?._id ? `/products/${product._id}` : "/products",
    image: product?.image || seoDefaultImage,
    schema: product
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.productName || "পণ্য",
          description:
            product.description ||
            "কৃষিঘর পণ্যের বিস্তারিত পাতা",
          image: [toAbsoluteSeoUrl(product.image || seoDefaultImage)],
          sku: product._id,
          category: product.category?.name || product.categoryName || "কৃষিপণ্য",
          offers: {
            "@type": "Offer",
            priceCurrency: "BDT",
            price: Number(product.price ?? 0),
            availability:
              Number(product.quantity ?? 0) > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: toAbsoluteSeoUrl(`/products/${product._id}`),
          },
        }
      : null,
  });

  const allProducts = useMemo(() => {
    const list =
      loaderRes?.products ||
      loaderRes?.data?.products ||
      (Array.isArray(loaderRes) ? loaderRes : []);
    return Array.isArray(list) ? list : [];
  }, [loaderRes]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const list = [
      imgOk(product.image),
      ...(Array.isArray(product.secondaryImages)
        ? product.secondaryImages.map(imgOk)
        : []),
    ].filter(Boolean);
    return Array.from(new Set(list));
  }, [product]);

  const [idx, setIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [faqCount, setFaqCount] = useState(0);
  const main = gallery[idx] || imgOk(product?.image);

  useEffect(() => {
    if (!product && !loading) setErr("পণ্য পাওয়া যায়নি।");
  }, [product, loading]);

  const productReviews = useMemo(() => {
    if (Array.isArray(product?.reviews) && product.reviews.length > 0) {
      return product.reviews.map((r, i) => ({
        id: r._id || "r-" + i,
        name: r.name || r.userName || "ক্রেতা",
        rating: Number(r.rating || 0),
        comment: r.comment || r.feedback || "",
        date: r.createdAt || new Date().toISOString(),
      }));
    }
    return [];
  }, [product]);

  const productFaqs = useMemo(() => {
    if (Array.isArray(product?.faqs) && product.faqs.length > 0) {
      return product.faqs.map((f, i) => ({
        id: f._id || "f-" + i,
        question: f.question || "",
        answer: f.answer || "",
        askedBy: f.askedBy || "ক্রেতা",
        askedAt: f.createdAt || new Date().toISOString(),
      }));
    }
    return [];
  }, [product]);

  useEffect(() => {
    setIdx(0);
    setActiveTab("description");
  }, [product?._id]);

  useEffect(() => {
    setFaqCount(productFaqs.length);
  }, [productFaqs.length]);

  const role = String(userProfile?.role || "").toLowerCase();
  const isProducer = role === "producer";
  const isConsumer = role === "consumer";
  const cartPath =
    role === "wholesaler"
      ? "/dashboard/wholesaler/cart"
      : role === "supersaler"
        ? "/dashboard/superseller/cart"
        : "/consumer/cart";

  const {
    reviews,
    loadingReviews,
    reviewsError,
    reviewForm,
    setReviewForm,
    submittingReview,
    submitReview,
    retryReviews,
    averageRating,
  } = useProductReviews({
    productId: product?._id,
    token,
    userProfile,
    initialReviews: productReviews,
    onAuthRequired: () => navigate("/auth/login"),
  });

  const addToCart = async (productId, quantity = 1) => {
    if (isProducer) {
      toast.error("উৎপাদকরা কার্ট ব্যবহার করতে পারবেন না");
      return false;
    }
    if (!token) {
      toast.error("কার্টে যোগ করতে লগইন করুন");
      navigate("/auth/login");
      return false;
    }
    try {
      await toast.promise(
        addProductToCart({ productId, quantity, price: product?.price, token, role }),
        {
          loading: "কার্টে যোগ করা হচ্ছে...",
          success: "কার্টে যোগ হয়েছে",
          error: (e) => e?.response?.data?.message || "কার্টে যোগ করা যায়নি",
        }
      );
      return true;
    } catch {
      return false;
    }
  };

  const addToWishlist = async (productId) => {
    if (!isConsumer) {
      toast.error("ইচ্ছেতালিকা শুধু ক্রেতাদের জন্য");
      return;
    }
    if (!token) {
      toast.error("ইচ্ছেতালিকা ব্যবহার করতে লগইন করুন");
      navigate("/auth/login");
      return;
    }
    try {
      await toast.promise(
        addProductToWishlist({ productId, token }),
        {
          loading: "সংরক্ষণ হচ্ছে…",
          success: "ইচ্ছেতালিকায় যোগ হয়েছে",
          error: (e) => e?.response?.data?.message || "ইচ্ছেতালিকায় যোগ করা যায়নি",
        }
      );
    } catch {
      console.error("Add to wishlist failed");
    }
  };

  if (loading) return <Skeleton />;

  if (err)
    return (
      <div className="max-w-7xl mx-auto px-4 pt-28">
        <Toaster position="top-right" toastOptions={{ duration: 2200 }} />
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          <FiChevronLeft /> ফিরে যান
        </button>
      </div>
    );

  if (!product) return <Skeleton />;

  const {
    _id,
    productName,
    description,
    price,
    previousPrice,
    quantity,
    category,
    categoryName,
    producer,
    createdAt,
    rating,
  } = product;

  const catLabel =
    (typeof category === "string" ? category : category?.name) ||
    categoryName ||
    "বিভাগ";

  const getCategoryId = (cat) => {
    if (!cat) return null;
    if (typeof cat === "string") return cat;
    return cat._id || cat.id || null;
  };

  const catId = getCategoryId(category);
  const createdDate = createdAt
    ? new Date(createdAt).toLocaleDateString("bn-BD")
    : null;

  return (
    <div className="py-24 ">
      <Toaster position="top-right" toastOptions={{ duration: 2200 }} />
      <div className="max-w-7xl mx-auto px-4">
        <ProductBreadcrumb productName={productName} />

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <ProductGallery
            main={main}
            gallery={gallery}
            idx={idx}
            setIdx={setIdx}
            productName={productName}
          />

          <ProductInfo
            productName={productName}
            catLabel={catLabel}
            createdDate={createdDate}
            rating={rating}
            price={price}
            previousPrice={previousPrice}
            quantity={quantity}
            currency={currency}
            isConsumer={isConsumer}
            wishing={wishing}
            setWishing={setWishing}
            addToWishlist={addToWishlist}
            _id={_id}
            isProducer={isProducer}
            adding={adding}
            setAdding={setAdding}
            addToCart={addToCart}
            buying={buying}
            setBuying={setBuying}
            cartPath={cartPath}
            navigate={navigate}
          />
        </div>

        <ProductProducer producer={producer} />

        <section className="mt-8">
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="border-b bg-gray-50 p-2 md:p-3">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveTab("description")}
                  className={
                    "rounded-lg px-3 py-2 text-sm md:text-base font-medium transition " +
                    (activeTab === "description"
                      ? "bg-green text-white shadow"
                      : "bg-white text-gray-700 hover:bg-green/10")
                  }
                >
                  বিবরণ
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={
                    "rounded-lg px-3 py-2 text-sm md:text-base font-medium transition " +
                    (activeTab === "reviews"
                      ? "bg-green text-white shadow"
                      : "bg-white text-gray-700 hover:bg-green/10")
                  }
                >
                  রিভিউ ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab("faq")}
                  className={
                    "rounded-lg px-3 py-2 text-sm md:text-base font-medium transition " +
                    (activeTab === "faq"
                      ? "bg-green text-white shadow"
                      : "bg-white text-gray-700 hover:bg-green/10")
                  }
                >
                  প্রশ্নোত্তর ({faqCount})
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {activeTab === "description" && (
                <div>
                  <p className="text-lg font-semibold text-gray-800">পণ্যের বিবরণ</p>
                  <div className="mt-3 text-gray-700 whitespace-pre-line leading-relaxed">
                    {safeStr(description, "কোনো বিবরণ দেওয়া হয়নি।")}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <Suspense fallback={<ReviewsPanelSkeleton />}>
                  <ProductReviewsPanel
                    averageRating={averageRating}
                    reviews={reviews}
                    loadingReviews={loadingReviews}
                    reviewsError={reviewsError}
                    reviewForm={reviewForm}
                    setReviewForm={setReviewForm}
                    submittingReview={submittingReview}
                    submitReview={submitReview}
                    retryReviews={retryReviews}
                  />
                </Suspense>
              )}

              {activeTab === "faq" && (
                <Suspense fallback={<ReviewsPanelSkeleton />}>
                  <ProductFaqPanel
                    initialFaqs={productFaqs}
                    token={token}
                    onAuthRequired={() => navigate("/auth/login")}
                    onFaqCountChange={setFaqCount}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </section>

        {catId && allProducts.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                {catLabel} বিভাগের আরও পণ্য
              </h2>
              <Link
                to="/products"
                className="text-sm text-green hover:underline"
              >
                সব দেখুন
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {allProducts
                .filter(
                  (p) => p?._id !== _id && getCategoryId(p?.category) === catId
                )
                .slice(0, 8)
                .map((p) => {
                  const id = p._id;
                  const name = p.productName || p.title || "নামহীন পণ্য";
                  const img =
                    imgOk(p.image) ||
                    (Array.isArray(p.secondaryImages) &&
                      imgOk(p.secondaryImages[0])) ||
                    "https://via.placeholder.com/600x400?text=%20";
                  return (
                    <Link
                      to={`/products/${id}`}
                      key={id}
                      className="group rounded-xl border bg-white hover:shadow-sm transition overflow-hidden"
                      aria-label={name}
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                        <img
                          src={img}
                          alt={name}
                          className="h-full w-full object-cover group-hover:scale-[1.02] transition"
                          onError={(e) =>
                            (e.currentTarget.src =
                              "https://via.placeholder.com/600x400?text=%20")
                          }
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium line-clamp-2 text-gray-800">
                          {name}
                        </p>
                        {p.price && (
                          <p className="mt-1 text-sm text-green font-semibold">
                            {currency(p.price)}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
