import { TbCoinTakaFilled } from "react-icons/tb";
import QuantityUnitField from "./QuantityUnitField";

const ProductDetailsForm = ({
  addToSellPost,
  category,
  customUnitNote,
  description,
  loading,
  loadingCats,
  onAddToSellPostChange,
  onCategoryChange,
  onDescriptionChange,
  onPriceChange,
  onProductNameChange,
  onQuantityChange,
  onQuantityStep,
  onSubmit,
  onCustomUnitNoteChange,
  onUnitChange,
  price,
  productName,
  quantity,
  serverCategories,
  unit,
}) => (
  <div className="flex w-full lg:col-span-3 flex-col items-start gap-6 text-[15px] text-gray-800">
    <div className="w-full">
      <p className="font-semibold mb-2">পণ্যের নাম</p>
      <input
        type="text"
        value={productName}
        onChange={(event) => onProductNameChange(event.target.value)}
        placeholder="যেমন: দেশি টমেটো"
        className="w-full rounded-md border border-gray-300 px-4 py-2 bg-[#f9f9f9] focus:outline-none focus:border-green transition duration-150"
      />
    </div>

    <QuantityUnitField
      customUnitNote={customUnitNote}
      onCustomUnitNoteChange={onCustomUnitNoteChange}
      onQuantityChange={onQuantityChange}
      onQuantityStep={onQuantityStep}
      onUnitChange={onUnitChange}
      quantity={quantity}
      unit={unit}
    />

    <div className="w-full">
      <p className="font-semibold mb-2">বিক্রয় মূল্য</p>
      <div className="flex items-center gap-2 border border-gray-300 bg-[#f9f9f9] px-3 py-2 rounded-md">
        <input
          type="text"
          value={price}
          onChange={(event) => onPriceChange(event.target.value)}
          placeholder="যেমন: ২৫০"
          className="w-full min-w-0 bg-transparent outline-none"
        />
        <TbCoinTakaFilled size={24} className="text-yellow shrink-0" />
      </div>
    </div>

    <div className="w-full">
      <p className="font-semibold mb-2">পণ্যের বিবরণ</p>
      <textarea
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="পণ্যের বিবরণ"
        className="w-full rounded-md border border-gray-300 h-28 px-4 py-3 bg-[#f9f9f9] focus:outline-none focus:border-green transition resize-none"
      />
    </div>

    <div className="w-full">
      <p className="font-semibold mb-2">ক্যাটাগরি</p>
      <select
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
        className="w-full rounded-md border border-gray-300 px-4 py-2 bg-[#f9f9f9] focus:outline-none focus:border-green transition"
        disabled={loadingCats}
      >
        <option value="">
          {loadingCats ? "ক্যাটাগরি লোড হচ্ছে..." : "বিভাগ নির্বাচন করুন"}
        </option>

        {serverCategories.length > 0
          ? serverCategories.map((cat) => (
              <option key={cat._id || cat.id} value={cat._id || cat.id}>
                {cat.name || cat.title || "নামহীন ক্যাটাগরি"}
              </option>
            ))
          : !loadingCats && (
              <option disabled value="">
                কোনো ক্যাটাগরি পাওয়া যায়নি
              </option>
            )}
      </select>
    </div>

    <div className="w-full">
      <p className="font-semibold mb-2">বিক্রির পোস্ট যুক্ত করুন:</p>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="addToSellPost"
            value="yes"
            checked={addToSellPost === "yes"}
            onChange={(event) => onAddToSellPostChange(event.target.value)}
            className="accent-green"
          />
          <span>হ্যাঁ</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="addToSellPost"
            value="no"
            checked={addToSellPost === "no"}
            onChange={(event) => onAddToSellPostChange(event.target.value)}
            className="accent-green"
          />
          <span>না</span>
        </label>
      </div>
    </div>

    <button
      type="button"
      onClick={onSubmit}
      disabled={loading}
      className={`w-full mt-2 py-3 rounded-md font-semibold text-white transition ${
        loading
          ? "bg-gray-500 cursor-not-allowed"
          : "bg-green hover:bg-green/90 cursor-pointer"
      }`}
    >
      {loading ? "জমা হচ্ছে..." : "পণ্য যোগ করুন"}
    </button>
  </div>
);

export default ProductDetailsForm;
