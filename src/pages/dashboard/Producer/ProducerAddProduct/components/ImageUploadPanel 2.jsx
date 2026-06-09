/* eslint-disable react/prop-types */
import { AiOutlineClose } from "react-icons/ai";
import { FiImage, FiUploadCloud } from "react-icons/fi";

const ImageUploadPanel = ({
  imageInputKey,
  imagePreview,
  onMainImageChange,
  onSecondaryImagesChange,
  onRemoveMainImage,
  onRemoveSecondaryImages,
  secondaryPreviews,
}) => (
  <div className="border border-gray-300 p-4 lg:col-span-3 rounded-xl bg-white">
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-gray-800">পণ্যের ছবি</p>
        {imagePreview ? (
          <button
            type="button"
            onClick={onRemoveMainImage}
            className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            <AiOutlineClose size={14} />
            মুছুন
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border bg-[#f8f8f8]">
        {imagePreview ? (
          <img
            src={imagePreview}
            className="h-[280px] w-full object-cover"
            alt="পণ্যের ছবি"
          />
        ) : (
          <label className="flex h-[280px] cursor-pointer flex-col items-center justify-center text-center text-gray-500 hover:bg-green/5">
            <FiImage className="text-4xl text-gray-400" />
            <span className="mt-3 font-medium text-gray-700">
              প্রধান ছবি নির্বাচন করুন
            </span>
            <span className="mt-1 text-sm text-gray-500">
              JPG, PNG, WEBP বা AVIF, সর্বোচ্চ ৫ এমবি
            </span>
            <input
              key={imageInputKey}
              type="file"
              accept="image/*"
              onChange={onMainImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {imagePreview ? (
        <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 bg-[#f9f9f9] px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-green hover:text-green">
          <FiUploadCloud />
          প্রধান ছবি পরিবর্তন করুন
          <input
            key={imageInputKey}
            type="file"
            accept="image/*"
            onChange={onMainImageChange}
            className="hidden"
          />
        </label>
      ) : null}

      <div className="rounded-lg border border-dashed border-gray-300 bg-[#f9f9f9] p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-700">অতিরিক্ত ছবি</p>
            <p className="mt-0.5 text-xs text-gray-500">সর্বোচ্চ ৫টি ছবি</p>
          </div>
          {secondaryPreviews.length ? (
            <button
              type="button"
              onClick={onRemoveSecondaryImages}
              className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-white cursor-pointer"
            >
              সব মুছুন
            </button>
          ) : null}
        </div>

        <label className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-gray-200 transition hover:text-green hover:ring-green">
          <FiUploadCloud />
          অতিরিক্ত ছবি নির্বাচন করুন
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onSecondaryImagesChange}
            className="hidden"
          />
        </label>
      </div>

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
  </div>
);

export default ImageUploadPanel;
