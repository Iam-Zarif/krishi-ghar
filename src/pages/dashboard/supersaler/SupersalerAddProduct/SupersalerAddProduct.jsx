import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, Toaster } from "react-hot-toast";
import { AiOutlineClose } from "react-icons/ai";
import { FiImage, FiUploadCloud } from "react-icons/fi";
import { TbCoinTakaFilled } from "react-icons/tb";
import { Api } from "../../../../api/API";
import { ApiPaths } from "../../../../api/apiPaths";
import { SkeletonBlock } from "../../../../components/common/SkeletonLoader";
import QuantityUnitField from "../../Producer/ProducerAddProduct/components/QuantityUnitField";

const normalizeCategories = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.categories)) return raw.categories;
  if (Array.isArray(raw?.data?.categories)) return raw.data.categories;
  if (Array.isArray(raw?.result)) return raw.result;
  if (Array.isArray(raw?.payload)) return raw.payload;
  if (Array.isArray(raw?.data?.items)) return raw.data.items;
  return [];
};

const initialForm = {
  name: "",
  productType: "bulk",
  price: "",
  quantity: 1,
  unit: "kg",
  customUnitNote: "",
  category: "",
  description: "",
};

const getToken = () => Cookies.get("token") || localStorage.getItem("token") || "";
const MAX_IMAGE_SIZE_MB = 5;

const SupersalerAddProduct = () => {
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [secondaryImages, setSecondaryImages] = useState([]);
  const [secondaryPreviews, setSecondaryPreviews] = useState([]);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const canSubmit = useMemo(
    () =>
      Boolean(
          form.name.trim() &&
          form.price &&
          form.productType &&
          Number(form.quantity) > 0 &&
          form.unit &&
          (form.unit !== "other" || form.customUnitNote.trim()) &&
          form.category &&
          form.description.trim() &&
          image
      ),
    [form, image]
  );

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data } = await axios.get(`${Api}${ApiPaths.products.categories}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(normalizeCategories(data));
      } catch (error) {
        toast.error(error?.response?.data?.message || "ক্যাটাগরি লোড করা যায়নি");
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateNumberField = (field, value) => {
    updateField(field, value.replace(/[^0-9]/g, ""));
  };

  const handleQuantityChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    updateField("quantity", numericValue ? parseInt(numericValue, 10) : "");
  };

  const handleQuantityStep = (step) => {
    setForm((current) => {
      const nextQuantity = Math.max(1, (Number(current.quantity) || 1) + step);
      return { ...current, quantity: nextQuantity };
    });
  };

  const handleUnitChange = (value) => {
    setForm((current) => ({
      ...current,
      unit: value,
      customUnitNote: value === "other" ? current.customUnitNote : "",
    }));
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      secondaryPreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [preview, secondaryPreviews]);

  const validateImage = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("শুধু ছবি আপলোড করা যাবে");
      return false;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`ছবির সাইজ ${MAX_IMAGE_SIZE_MB} এমবির কম হতে হবে`);
      return false;
    }

    return true;
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file || !validateImage(file)) return;

    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSecondaryImagesChange = (event) => {
    const files = Array.from(event.target.files || []).filter(validateImage);
    const limitedFiles = files.slice(0, 5);

    secondaryPreviews.forEach((item) => URL.revokeObjectURL(item.url));
    setSecondaryImages(limitedFiles);
    setSecondaryPreviews(
      limitedFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      }))
    );
  };

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview("");
    setImageInputKey((current) => current + 1);
  };

  const resetForm = () => {
    setForm(initialForm);
    removeImage();
    secondaryPreviews.forEach((item) => URL.revokeObjectURL(item.url));
    setSecondaryImages([]);
    setSecondaryPreviews([]);
  };

  const buildImagePath = (file) => {
    if (!file?.name) return "";
    return `uploads/${file.name}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.error("সব তথ্য পূরণ করে ছবি আপলোড করুন");
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("আপনাকে লগইন করতে হবে");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        productName: form.name.trim(),
        quantity: Number(form.quantity),
        productType: form.productType,
        unit: form.unit,
        priceType: "per_unit",
        price: Number(form.price),
        description: form.description.trim(),
        category: form.category,
        addToSellPost: "no",
        image: buildImagePath(image),
        secondaryImages: secondaryImages.map((file) => buildImagePath(file)),
      };

      if (form.unit === "other") {
        payload.customUnitNote = form.customUnitNote.trim();
      }

      const { data } = await axios.post(`${Api}${ApiPaths.supersaler.createProduct}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setSuccessMessage(
        data?.message ||
          "পণ্য জমা হয়েছে। অ্যাডমিন অনুমোদন করলে এটি আমার পণ্য অংশে দেখা যাবে।"
      );
      resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "পণ্য জমা দেওয়া যায়নি");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <Toaster />

      {successMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-semibold text-gray-900">পণ্য জমা হয়েছে</p>
               
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage("")}
                aria-label="বন্ধ করুন"
                className="cursor-pointer rounded-full border border-gray-200 p-2 text-gray-500 transition hover:border-green hover:text-green"
              >
                <AiOutlineClose size={18} />
              </button>
            </div>
            <div className="mt-5 rounded-lg bg-green/10 px-4 py-3 text-sm font-medium text-green">
              অ্যাডমিন অনুমোদন করলে পণ্যটি আমার পণ্য অংশে দেখা যাবে।
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="mt-5 w-full cursor-pointer rounded-md bg-green px-4 py-3 font-semibold text-white transition hover:bg-green/90"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      ) : null}

      <div className="mb-6">
        <p className="text-2xl font-semibold text-green">পণ্য আপলোড</p>
        <p className="mt-2 text-sm text-gray-500">
          সুপার সেলার পণ্য জমা দিন, অনুমোদনের পর এটি ব্যবহারের জন্য প্রস্তুত হবে।
        </p>
        <div className="mt-5 h-px w-full border-t border-dashed border-gray-300" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid w-full gap-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[minmax(280px,420px)_1fr]"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800">পণ্যের ছবি</p>
            {image ? (
              <button
                type="button"
                onClick={removeImage}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
              >
                <AiOutlineClose size={14} />
                মুছুন
              </button>
            ) : null}
          </div>

          {preview ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img
                src={preview}
                alt="পণ্যের ছবি"
                className="h-72 w-full object-cover"
              />
            </div>
          ) : (
            <label className="flex h-72 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center hover:border-green hover:bg-green/5">
              <FiImage className="text-4xl text-gray-400" />
              <span className="mt-3 font-medium text-gray-700">প্রধান ছবি নির্বাচন করুন</span>
              <span className="mt-1 text-sm text-gray-500">সর্বোচ্চ ৫ এমবি</span>
              <input
                key={imageInputKey}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}

          <label className="block rounded-md border border-dashed border-gray-300 bg-[#f9f9f9] px-4 py-3 text-sm text-gray-600 cursor-pointer hover:border-green">
            অতিরিক্ত ছবি নির্বাচন করুন (সর্বোচ্চ ৫টি)
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleSecondaryImagesChange}
              className="hidden"
            />
          </label>
          {secondaryPreviews.length ? (
            <div className="grid grid-cols-3 gap-2">
              {secondaryPreviews.map((item) => (
                <img
                  key={item.url}
                  src={item.url}
                  alt={item.name}
                  className="h-20 w-full rounded-md border object-cover"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="font-semibold text-gray-800">পণ্যের নাম</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="যেমন: দেশি আলু"
              className="rounded-md border border-gray-300 bg-[#f9f9f9] px-4 py-3 outline-none transition focus:border-green"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-gray-800">পণ্যের ধরন</span>
            <select
              value={form.productType}
              onChange={(event) => updateField("productType", event.target.value)}
              className="cursor-pointer rounded-md border border-gray-300 bg-[#f9f9f9] px-4 py-3 outline-none transition focus:border-green"
            >
              <option value="bulk">বাল্ক</option>
              <option value="rental">ভাড়া</option>
            </select>
          </label>

          <QuantityUnitField
            customUnitNote={form.customUnitNote}
            onCustomUnitNoteChange={(value) => updateField("customUnitNote", value)}
            onQuantityChange={handleQuantityChange}
            onQuantityStep={handleQuantityStep}
            onUnitChange={handleUnitChange}
            quantity={form.quantity}
            unit={form.unit}
          />

          <label className="grid gap-2">
            <span className="font-semibold text-gray-800">দাম</span>
            <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-[#f9f9f9] px-4 py-3 focus-within:border-green">
              <input
                type="text"
                inputMode="numeric"
                value={form.price}
                onChange={(event) => updateNumberField("price", event.target.value)}
                placeholder="যেমন: ২৫০"
                className="w-full bg-transparent outline-none"
              />
              <TbCoinTakaFilled size={22} className="text-yellow" />
            </div>
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-gray-800">ক্যাটাগরি</span>
            {loadingCategories ? (
              <SkeletonBlock className="h-12 w-full" />
            ) : (
              <select
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="rounded-md border border-gray-300 bg-[#f9f9f9] px-4 py-3 outline-none transition focus:border-green"
              >
                <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                {categories.map((category) => (
                  <option key={category._id || category.id} value={category._id || category.id}>
                    {category.name || category.title || "নামহীন ক্যাটাগরি"}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-gray-800">বিবরণ</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="পণ্যের মান, উৎস ও সরবরাহের তথ্য লিখুন"
              className="min-h-32 resize-none rounded-md border border-gray-300 bg-[#f9f9f9] px-4 py-3 outline-none transition focus:border-green"
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3 font-semibold text-white transition ${
              !canSubmit || submitting
                ? "cursor-not-allowed bg-gray-400"
                : "cursor-pointer bg-green hover:bg-green/90"
            }`}
          >
            <FiUploadCloud size={18} />
            {submitting ? "জমা হচ্ছে..." : "পণ্য জমা দিন"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupersalerAddProduct;
