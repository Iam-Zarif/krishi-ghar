import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHome, FaLeaf } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { usePageSeo } from "../../utils/seo";

const BRAND_LOGO_SRC = "/photos/auth/brandLogo.svg";

const NotFound = () => {
  const navigate = useNavigate();

  usePageSeo({
    title: "পৃষ্ঠা খুঁজে পাওয়া যায়নি | কৃষিঘর",
    description:
      "আপনি যে পৃষ্ঠাটি খুঁজছেন তা পাওয়া যায়নি। কৃষিঘরের হোম বা আগের পাতায় ফিরে যান।",
    robots: "noindex, follow",
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-yellow-50 px-4 py-10 text-center">
      <div className="absolute left-6 top-10 h-20 w-20 rounded-full bg-emerald-200/40 blur-2xl" />
      <div className="absolute bottom-10 right-6 h-28 w-28 rounded-full bg-yellow-200/50 blur-2xl" />

      <section className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-200/50 blur-xl animate-pulse" />
          <img
            src={BRAND_LOGO_SRC}
            alt="কৃষিঘর লোগো"
            className="relative h-24 w-24 rounded-full border-4 border-white bg-white object-contain shadow-xl"
          />
        </div>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
          <FaLeaf className="animate-bounce" />
          পথটি খুঁজে পাওয়া যায়নি
        </div>

        <h1 className="mt-6 text-7xl font-black leading-none text-emerald-700 sm:text-8xl">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 sm:text-4xl">
          এই পাতাটি আর পাওয়া যাচ্ছে না
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
          লিংকটি ভুল হতে পারে, অথবা পেজটি সরানো হয়েছে। আগের পাতায় ফিরে যান বা
          কৃষিঘরের হোম থেকে আবার শুরু করুন।
        </p>

        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <FaArrowLeft />
            আগের পেজ
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
          >
            <FaHome />
            হোম
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-5 py-3 text-sm font-semibold text-yellow-700 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-400 hover:shadow-md"
          >
            <FiSearch />
            পণ্য দেখুন
          </Link>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
