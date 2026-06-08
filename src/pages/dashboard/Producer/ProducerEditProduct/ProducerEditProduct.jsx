import { useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { Api } from "../../../../api/API";
import { ApiPaths } from "../../../../api/apiPaths";
import { AiOutlineClose } from "react-icons/ai";
import {
  normalizeProducerCategoryId,
  resolveProductImageUrl,
} from "../../../../utils/producerProduct";

const ProducerEditProduct = () => {
  const navigate = useNavigate();
  const { product } = useLoaderData();
  const [quantity, setQuantity] = useState(1);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverCategories, setServerCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    if (!product) return;
    setProductName(product.name || product.productName || "");
    setQuantity(Number(product.stock ?? product.quantity) || 1);
    setPrice(product.price || "");
    setDescription(product.description || "");
    setCategory(normalizeProducerCategoryId(product.category));
    const main = resolveProductImageUrl(product.image, Api);
    const secondaries = Array.isArray(product.secondaryImages)
      ? product.secondaryImages.map((img) => resolveProductImageUrl(img, Api))
      : [];
    const defaultImgs = [main, ...secondaries].filter(Boolean);
    setPreviews(defaultImgs.map((url) => ({ url, file: null })));

  }, [product]);

  useEffect(() => {
    const token = Cookies.get("token") || localStorage.getItem("token");
    if (!token) return;

    const loadCategories = async () => {
      try {
        setLoadingCats(true);
        const { data } = await axios.get(`${Api}${ApiPaths.producer.categories}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const nextCategories = Array.isArray(data?.categories)
          ? data.categories
          : Array.isArray(data?.data?.categories)
            ? data.data.categories
            : [];
        setServerCategories(nextCategories);
      } catch (err) {
        toast.error(err?.response?.data?.message || "ক্যাটাগরি লোড করা যায়নি");
        setServerCategories([]);
      } finally {
        setLoadingCats(false);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = async () => {
    if (
      !productName ||
      !price ||
      !description ||
      !category
    )
      return toast.error("সব প্রয়োজনীয় তথ্য পূরণ করুন");

    const token = Cookies.get("token") || localStorage.getItem("token");
    if (!token) return toast.error("অননুমোদিত");

    try {
      setLoading(true);
      const data = {
        productName: productName.trim(),
        quantity: Number(quantity) || 0,
        price: Number(price) || 0,
        description: description.trim(),
        category,
      };

      await axios.put(`${Api}${ApiPaths.producer.updateProduct(product._id)}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("পণ্য সফলভাবে আপডেট করা হয়েছে");
      setShowApprovalModal(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "পণ্য আপডেট করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 px-6 lg:px-6 w-full">
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  পণ্যটি আপডেট হয়েছে
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  আপনার আপডেট করা পণ্যটি এখন আবার অ্যাডমিন অনুমোদনের অপেক্ষায়
                  আছে। অনুমোদন সম্পন্ন হলে নতুন তথ্যসহ এটি সক্রিয়ভাবে দেখা
                  যাবে।
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowApprovalModal(false);
                  navigate("/dashboard/producerAllProducts");
                }}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <AiOutlineClose size={16} />
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowApprovalModal(false);
                  navigate("/dashboard/producerAllProducts");
                }}
                className="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green/90 cursor-pointer"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="font-semibold text-green text-2xl">পণ্য এডিট করুন</p>
      <div className="w-full h-[1px] bg-gray-300 mt-5 border-dashed"></div>

      <div className="mt-7 grid grid-cols-1 lg:grid-cols-6 w-[90%] mx-auto gap-12 items-start">
        <div className="border border-gray-300 p-4 lg:col-span-3 rounded-xl">
          <div className="grid grid-cols-2 gap-4">
            {previews.map((img, i) => (
              <div
                key={i}
                className="relative h-[140px] border rounded-lg overflow-hidden"
              >
                <img
                  src={img.url}
                  className="w-full h-full object-cover"
                  alt="প্রিভিউ"
                />
              </div>
            ))}
            {!previews.length && (
              <div className="relative h-[140px] border rounded-lg flex items-center justify-center bg-[#f8f8f8] text-sm text-gray-500">
                ছবি পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full lg:col-span-3 flex-col items-start gap-6 text-[15px] text-gray-800">
          <div className="w-full">
            <p className="font-semibold mb-2">পণ্যের নাম</p>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 bg-[#f9f9f9]"
            />
          </div>

          <div className="w-full">
            <p className="font-semibold mb-2">স্টক</p>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 bg-[#f9f9f9]"
            />
          </div>

          <div className="w-full">
            <p className="font-semibold mb-2">দাম</p>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full rounded-md border border-gray-300 px-4 py-2 bg-[#f9f9f9]"
            />
          </div>

          <div className="w-full">
            <p className="font-semibold mb-2">বিবরণ</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border px-4 py-2 rounded h-24 bg-[#f9f9f9]"
            />
          </div>

          <div className="w-full">
            <p className="font-semibold mb-2">ক্যাটাগরি</p>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border px-4 py-2 rounded bg-[#f9f9f9]"
            >
              <option value="">ক্যাটাগরি নির্বাচন করুন</option>
              {serverCategories.map((cat) => (
                <option key={cat._id || cat.id} value={cat._id || cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {loadingCats && (
              <p className="mt-2 text-xs text-gray-500">ক্যাটাগরি লোড হচ্ছে...</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full mt-2 py-3 rounded-md font-semibold text-white ${
              loading ? "bg-gray-500" : "bg-green hover:bg-green/90 cursor-pointer"
            }`}
          >
            {loading ? "আপডেট হচ্ছে..." : "পণ্য আপডেট করুন"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProducerEditProduct;
