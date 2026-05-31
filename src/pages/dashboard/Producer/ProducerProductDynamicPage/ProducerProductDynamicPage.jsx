import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { useContext, useMemo, useState } from "react";
import { Api } from "../../../../api/API";
import { ApiPaths } from "../../../../api/apiPaths";
import { RxCross1 } from "react-icons/rx";
import { IoIosArrowBack } from "react-icons/io";
import {
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEdit2,
  FiGrid,
  FiImage,
  FiPackage,
  FiTag,
  FiTrash2,
  FiXCircle,
} from "react-icons/fi";

import axios from "axios";
import Cookies from "js-cookie";
import {
  normalizeProducerCategoryName,
  resolveProductImageUrl,
} from "../../../../utils/producerProduct";
import { UserProfileContext } from "../../../../providers/getUserProfile/getUserProfile";
import ProductReviewsPanel from "../../../ProductsDynamic/components/ProductReviewsPanel";
import ProductFaqPanel from "../../../ProductsDynamic/components/ProductFaqPanel";
import { useProductReviews } from "../../../ProductsDynamic/hooks/useProductReviews";

const STATUS_META = {
  pending: {
    label: "অপেক্ষমাণ",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: FiClock,
  },
  approved: {
    label: "অনুমোদিত",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: FiCheckCircle,
  },
  rejected: {
    label: "বাতিল",
    className: "bg-red-50 text-red-700 border border-red-200",
    icon: FiXCircle,
  },
};

const cleanDescription = (value) => {
  if (!value) return "কোনো বিবরণ দেওয়া হয়নি।";

  return String(value)
    .replace(/\r/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^\s*---+\s*$/gm, "")
    .replace(/^\s*#+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const ProducerProductDynamicPage = () => {
  const loaderData = useLoaderData();
  const product = loaderData?.product;
  const navigate = useNavigate();
  const { userProfile } = useContext(UserProfileContext);
  const [showModal, setShowModal] = useState(false);
  const [deleteloading, setDeleteLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [faqCount, setFaqCount] = useState(0);
  const token = Cookies.get("token") || localStorage.getItem("token") || "";

  const toggleModal = () => setShowModal((prev) => !prev);

  const handleDelete = async () => {
    if (!product?._id) return;
    const token = Cookies.get("token") || localStorage.getItem("token");
    try {
      setDeleteLoading(true);
      const res = await axios.delete(
        `${Api}${ApiPaths.producer.deleteProduct(product._id)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        navigate("/dashboard/producerAllProducts");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formattedProduct = useMemo(() => {
    if (!product || typeof product !== "object") return null;
    const image = resolveProductImageUrl(product.image, Api);
    const secondaryImages = Array.isArray(product.secondaryImages)
      ? product.secondaryImages.map((img) => resolveProductImageUrl(img, Api))
      : [];
    return {
      name: product.name || product.productName || "নাম দেওয়া হয়নি",
      price: product.price || 0,
      quantity: product.stock ?? product.quantity ?? 0,
      category: normalizeProducerCategoryName(product.category),
      description: cleanDescription(product.description),
      image,
      secondaryImages,
      status: String(product.status || "pending").toLowerCase(),
      approvedAt: product.approvedAt,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }, [product]);

  if (!formattedProduct) {
    return (
      <div className="p-6 text-center text-red-500 text-lg">
        পণ্যের তথ্য সঠিক নয় বা পাওয়া যায়নি।
      </div>
    );
  }

  const galleryImages = [
    formattedProduct.image,
    ...formattedProduct.secondaryImages,
  ].filter(Boolean);
  const activeImage = galleryImages[selectedImage] || formattedProduct.image;
  const statusInfo = STATUS_META[formattedProduct.status] || STATUS_META.pending;
  const StatusIcon = statusInfo.icon;
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
    initialReviews: product?.reviews || [],
    onAuthRequired: () => navigate("/auth/login"),
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 mt-6 lg:p-0">
      {showModal && (
        <div className="fixed top-0 inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 cursor-pointer"
            >
              <RxCross1 className="w-5 h-5 cursor-pointer" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              মুছে ফেলার নিশ্চয়তা
            </h2>
            <p className="text-gray-600 mt-4 text-sm">
              আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </p>
            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={toggleModal}
                className="px-4 py-2 text-gray-700 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                বাতিল
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
              >
                {deleteloading ? "মুছে ফেলা হচ্ছে..." : "মুছুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-emerald-50 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <Link
              to="/dashboard/producerAllProducts"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-gray-50 cursor-pointer"
            >
              <IoIosArrowBack className="text-2xl" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-[24px] bg-gray-100">
            <img
              src={activeImage}
              alt={formattedProduct.name}
              className="h-[360px] w-full object-cover lg:h-[460px]"
              loading="lazy"
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImage((prev) =>
                      prev === 0 ? galleryImages.length - 1 : prev - 1,
                    )
                  }
                  className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-gray-700 shadow-sm transition hover:bg-white cursor-pointer"
                >
                  <FiChevronLeft className="text-2xl" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImage((prev) =>
                      prev === galleryImages.length - 1 ? 0 : prev + 1,
                    )
                  }
                  className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-gray-700 shadow-sm transition hover:bg-white cursor-pointer"
                >
                  <FiChevronRight className="text-2xl" />
                </button>
              </>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 lg:grid-cols-5">
              {galleryImages.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-2xl border transition cursor-pointer ${
                    selectedImage === index
                      ? "border-emerald-500 ring-2 ring-emerald-100"
                      : "border-gray-200 hover:border-emerald-200"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${formattedProduct.name} ${index + 1}`}
                    className="h-20 w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="rounded-[28px] border border-emerald-50 bg-white p-6 shadow-sm">
            <div className="border-b border-gray-100 pb-5">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${statusInfo.className}`}
                >
                  <StatusIcon className="text-base" />
                  {statusInfo.label}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3.5 py-1.5 text-sm font-medium text-gray-600">
                  <FiGrid className="text-base" />
                  {formattedProduct.category}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-bold leading-tight text-gray-900">
                {formattedProduct.name}
              </h2>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to={`/dashboard/producer/product-edit/${product._id}`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green/90 cursor-pointer"
                >
                  <FiEdit2 className="text-base" />
                  এডিট
                </Link>
                <button
                  type="button"
                  onClick={toggleModal}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 cursor-pointer"
                >
                  <FiTrash2 className="text-base" />
                  মুছুন
                </button>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
              <div className="pt-5">
                <p className="text-sm font-medium text-gray-500">মূল্য</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  ৳ {formattedProduct.price}
                </p>
              </div>
              <div className="mt-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <FiTag className="text-xl" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <FiPackage className="text-base text-emerald-600" />
                  পরিমাণ
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-800">
                  {formattedProduct.quantity}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <FiGrid className="text-base text-emerald-600" />
                  ক্যাটাগরি
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-800">
                  {formattedProduct.category}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <FiImage className="text-base text-emerald-600" />
                  মোট ছবি
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-800">
                  {galleryImages.length}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <StatusIcon className="text-base text-emerald-600" />
                  স্ট্যাটাস
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-800">
                  {statusInfo.label}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <FiCalendar className="mt-0.5 text-base text-gray-400" />
                <div>
                  <p className="font-medium text-gray-700">প্রকাশের সময়</p>
                  <p>{new Date(formattedProduct.createdAt).toLocaleString("bn-BD")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-gray-600">
                <FiCalendar className="mt-0.5 text-base text-gray-400" />
                <div>
                  <p className="font-medium text-gray-700">সর্বশেষ আপডেট</p>
                  <p>{new Date(formattedProduct.updatedAt).toLocaleString("bn-BD")}</p>
                </div>
              </div>

              {formattedProduct.approvedAt && (
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <FiCheckCircle className="mt-0.5 text-base text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-700">অনুমোদনের সময়</p>
                    <p>{new Date(formattedProduct.approvedAt).toLocaleString("bn-BD")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-emerald-50 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={
                "rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer " +
                (activeTab === "description"
                  ? "bg-green text-white shadow"
                  : "bg-white text-gray-700 hover:bg-green/10")
              }
            >
              বিবরণ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={
                "rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer " +
                (activeTab === "reviews"
                  ? "bg-green text-white shadow"
                  : "bg-white text-gray-700 hover:bg-green/10")
              }
            >
              রিভিউ ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("faq")}
              className={
                "rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer " +
                (activeTab === "faq"
                  ? "bg-green text-white shadow"
                  : "bg-white text-gray-700 hover:bg-green/10")
              }
            >
              প্রশ্নোত্তর ({faqCount})
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {activeTab === "description" && (
            <div>
              <p className="text-lg font-semibold text-gray-800">পণ্যের বিবরণ</p>
              <div className="mt-4 space-y-3 whitespace-pre-line text-[15px] leading-7 text-gray-700">
                {formattedProduct.description
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, index) => (
                    <p key={`${line}-${index}`}>{line}</p>
                  ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
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
          )}

          {activeTab === "faq" && (
            <ProductFaqPanel
              initialFaqs={[]}
              token={token}
              onAuthRequired={() => navigate("/auth/login")}
              onFaqCountChange={setFaqCount}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default ProducerProductDynamicPage;
