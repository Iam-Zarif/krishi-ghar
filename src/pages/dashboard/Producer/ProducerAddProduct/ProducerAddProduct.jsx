import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import ApprovalModal from "./components/ApprovalModal";
import ImageUploadPanel from "./components/ImageUploadPanel";
import ProductDetailsForm from "./components/ProductDetailsForm";
import { MAX_IMAGE_SIZE_MB } from "./components/addProductConstants";
import {
  createProducerProduct,
  fetchProducerCategories,
} from "./components/addProductApi";

const ProducerAddProduct = () => {
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("kg");
  const [customUnitNote, setCustomUnitNote] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [addToSellPost, setAddToSellPost] = useState("no");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [secondaryImages, setSecondaryImages] = useState([]);
  const [secondaryPreviews, setSecondaryPreviews] = useState([]);

  const [imageInputKey, setImageInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [serverCategories, setServerCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);

  const resetForm = () => {
    setQuantity(1);
    setUnit("kg");
    setCustomUnitNote("");
    setProductName("");
    setPrice("");
    setDescription("");
    setCategory("");
    setAddToSellPost("no");

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    secondaryPreviews.forEach((item) => URL.revokeObjectURL(item.url));

    setImageFile(null);
    setImagePreview("");
    setSecondaryImages([]);
    setSecondaryPreviews([]);
    setImageInputKey((current) => current + 1);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      secondaryPreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [imagePreview, secondaryPreviews]);

  useEffect(() => {
    const token = Cookies.get("token") || localStorage.getItem("token");
    if (!token) return;

    const loadCategories = async () => {
      try {
        setLoadingCats(true);
        const categories = await fetchProducerCategories(token);
        setServerCategories(categories);
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || "ক্যাটাগরি লোড করা যায়নি");
        setServerCategories([]);
      } finally {
        setLoadingCats(false);
      }
    };

    loadCategories();
  }, []);

  const handleQuantityChange = (rawValue) => {
    const value = rawValue.replace(/[^0-9]/g, "");
    setQuantity(value ? parseInt(value, 10) : "");
  };

  const handleQuantityStep = (step) => {
    setQuantity((current) => {
      const next = (Number(current) || 1) + step;
      return Math.max(1, next);
    });
  };

  const handlePriceChange = (rawValue) => {
    setPrice(rawValue.replace(/[^0-9]/g, ""));
  };

  const handleUnitChange = (nextUnit) => {
    setUnit(nextUnit);
    if (nextUnit !== "other") {
      setCustomUnitNote("");
    }
  };

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

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeMainImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
    setImageInputKey((current) => current + 1);
  };

  const handleSecondaryImagesChange = (event) => {
    const files = Array.from(event.target.files || [])
      .filter(validateImage)
      .slice(0, 5);

    secondaryPreviews.forEach((item) => URL.revokeObjectURL(item.url));
    setSecondaryImages(files);
    setSecondaryPreviews(
      files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    );
  };

  const removeSecondaryImages = () => {
    secondaryPreviews.forEach((item) => URL.revokeObjectURL(item.url));
    setSecondaryImages([]);
    setSecondaryPreviews([]);
  };

  const buildImagePath = (file) => {
    if (!file?.name) return "";
    return `uploads/${file.name}`;
  };

  const handleSubmit = async () => {
    if (!imageFile) return toast.error("ছবি দিতে হবে");
    if (!productName.trim()) return toast.error("পণ্যের নাম খালি রাখা যাবে না");
    if (!quantity || Number(quantity) <= 0) return toast.error("পরিমাণ দিন");
    if (unit === "other" && !customUnitNote.trim()) {
      return toast.error("পরিমাণের ব্যাখ্যা লিখুন");
    }
    if (!price) return toast.error("দাম খালি রাখা যাবে না");
    if (!description.trim()) return toast.error("বিবরণ খালি রাখা যাবে না");
    if (!category) return toast.error("ক্যাটাগরি নির্বাচন করুন");

    const token = Cookies.get("token") || localStorage.getItem("token");
    if (!token) return toast.error("আপনাকে লগইন করতে হবে");

    try {
      setLoading(true);

      await createProducerProduct(
        {
          productName: productName.trim(),
          quantity: Number(quantity),
          unit: unit === "other" ? "other" : unit,
          customUnitNote: unit === "other" ? customUnitNote.trim() : "",
          price: Number(price),
          priceType: "per_unit",
          description: description.trim(),
          category,
          addToSellPost,
          image: buildImagePath(imageFile),
          secondaryImages: secondaryImages.map((file) => buildImagePath(file)),
        },
        token,
      );

      toast.success("পণ্য সফলভাবে যোগ করা হয়েছে");
      resetForm();
      setShowApprovalModal(true);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || err?.message || "পণ্য যোগ করা যায়নি",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 px-6 lg:px-6 w-full">
      <Toaster />

      {showApprovalModal && (
        <ApprovalModal onClose={() => setShowApprovalModal(false)} />
      )}

      <p className="font-semibold text-green text-2xl">পণ্য যোগ করুন</p>
      <div className="w-full h-[1px] bg-gray-300 mt-5 border-dashed"></div>

      <div className="mt-7 grid grid-cols-1 lg:grid-cols-6 w-[90%] mx-auto gap-12 items-start">
        <ImageUploadPanel
          imageInputKey={imageInputKey}
          imagePreview={imagePreview}
          onMainImageChange={handleImageChange}
          onRemoveMainImage={removeMainImage}
          onRemoveSecondaryImages={removeSecondaryImages}
          onSecondaryImagesChange={handleSecondaryImagesChange}
          secondaryPreviews={secondaryPreviews}
        />

        <ProductDetailsForm
          category={category}
          customUnitNote={customUnitNote}
          description={description}
          loading={loading}
          loadingCats={loadingCats}
          addToSellPost={addToSellPost}
          onAddToSellPostChange={setAddToSellPost}
          onCategoryChange={setCategory}
          onDescriptionChange={setDescription}
          onPriceChange={handlePriceChange}
          onProductNameChange={setProductName}
          onQuantityChange={handleQuantityChange}
          onQuantityStep={handleQuantityStep}
          onSubmit={handleSubmit}
          onUnitChange={handleUnitChange}
          onCustomUnitNoteChange={setCustomUnitNote}
          price={price}
          productName={productName}
          quantity={quantity}
          serverCategories={serverCategories}
          unit={unit}
        />
      </div>
    </div>
  );
};

export default ProducerAddProduct;
