import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, Toaster } from "react-hot-toast";
import { FiChevronLeft, FiChevronRight, FiPackage } from "react-icons/fi";
import { Api } from "../../../../api/API";
import { ApiPaths } from "../../../../api/apiPaths";
import { normalizeProducerCategoryName } from "../../../../utils/producerProduct";
import ProducerDeleteModal from "./components/ProducerDeleteModal";
import ProducerProductCard from "./components/ProducerProductCard";
import ProducerProductsSkeleton from "./components/ProducerProductsSkeleton";

const ProducerAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const dropdownRef = useRef(null);
  const itemsPerPage = 8;

  const fetchProducts = async () => {
    const token = Cookies.get("token") || localStorage.getItem("token");
    if (!token) return toast.error("অননুমোদিত প্রবেশ");

    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${Api}${ApiPaths.producer.products}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(Array.isArray(res.data?.products) ? res.data.products : []);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "পণ্য লোড করা যায়নি";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    const token = Cookies.get("token") || localStorage.getItem("token");
    if (!token || !selectedProductId) return;

    try {
      setDeleting(true);
      await axios.delete(`${Api}${ApiPaths.producer.deleteProduct(selectedProductId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setProducts((prev) => prev.filter((p) => p._id !== selectedProductId));
      toast.success("পণ্য সফলভাবে মুছে ফেলা হয়েছে");
      setDeleteModal(false);
      setOpenDropdown(null);
      setSelectedProductId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "পণ্য মুছে ফেলা যায়নি");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, searchText]);

  const filteredProducts = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const status = String(product.status || "pending").toLowerCase();
      const matchesStatus = activeStatus === "all" ? true : status === activeStatus;

      if (!matchesStatus) return false;
      if (!query) return true;

      const haystack = [
        product.name,
        product.productName,
        normalizeProducerCategoryName(product.category),
        product.price,
        product.stock,
        product.quantity,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [products, activeStatus, searchText]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
        );
      case "priceLow":
        return sorted.sort(
          (a, b) => Number(a.price || 0) - Number(b.price || 0),
        );
      case "priceHigh":
        return sorted.sort(
          (a, b) => Number(b.price || 0) - Number(a.price || 0),
        );
      case "nameAsc":
        return sorted.sort((a, b) =>
          String(a.name || a.productName || "").localeCompare(
            String(b.name || b.productName || ""),
            "bn",
          ),
        );
      case "nameDesc":
        return sorted.sort((a, b) =>
          String(b.name || b.productName || "").localeCompare(
            String(a.name || a.productName || ""),
            "bn",
          ),
        );
      case "newest":
      default:
        return sorted.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
    }
  }, [filteredProducts, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage));
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const toggleDropdown = (productId) => {
    setOpenDropdown((prev) => (prev === productId ? null : productId));
  };

  return (
    <div className="w-full pt-6">
      <Toaster />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          সব পণ্য ({sortedProducts.length})
        </h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-emerald-300 sm:w-[220px] cursor-pointer"
        >
          <option value="newest">নতুন থেকে পুরাতন</option>
          <option value="oldest">পুরাতন থেকে নতুন</option>
          <option value="priceLow">কম দাম থেকে বেশি</option>
          <option value="priceHigh">বেশি দাম থেকে কম</option>
          <option value="nameAsc">নাম ক-হ</option>
          <option value="nameDesc">নাম হ-ক</option>
        </select>
      </div>

      {deleteModal && (
        <ProducerDeleteModal
          deleting={deleting}
          onClose={() => setDeleteModal(false)}
          onConfirm={handleDeleteProduct}
        />
      )}

      {loading ? (
        <ProducerProductsSkeleton />
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchProducts}
              className="rounded-xl border border-red-300 bg-white px-4 py-2 font-medium hover:bg-red-100 cursor-pointer"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {paginatedProducts.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <FiPackage className="text-2xl" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-800">
                কোনো পণ্য পাওয়া যায়নি
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                বর্তমান ফিল্টার অনুযায়ী কোনো পণ্য মিলছে না। অন্য স্ট্যাটাস বা
                অনুসন্ধান ব্যবহার করে দেখুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedProducts.map((product) => (
                <ProducerProductCard
                  key={product._id}
                  dropdownRef={dropdownRef}
                  openDropdown={openDropdown}
                  product={product}
                  setDeleteModal={setDeleteModal}
                  setSelectedProductId={setSelectedProductId}
                  toggleDropdown={toggleDropdown}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                <FiChevronLeft />
                পূর্ববর্তী
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentPage(index + 1)}
                    className={`h-11 min-w-11 rounded-2xl border text-sm font-semibold transition cursor-pointer ${
                      currentPage === index + 1
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                পরবর্তী
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProducerAllProducts;
