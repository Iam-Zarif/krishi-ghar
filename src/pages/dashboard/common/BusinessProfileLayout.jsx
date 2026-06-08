import blankUser from "../../../../public/photos/common/user.png";
import { useRef } from "react";
import { FiUpload } from "react-icons/fi";

export const formatProfileDate = (value) => {
  if (!value) return "দেওয়া হয়নি";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

export const ProfileFieldRow = ({ label, value }) => (
  <div className="grid grid-cols-1 gap-1 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-4">
    <p className="text-sm font-semibold text-gray-700">{label}</p>
    <p className="text-sm text-gray-800 break-words">{value || "দেওয়া হয়নি"}</p>
  </div>
);

export const ProfileSection = ({ title, children }) => (
  <section className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 md:p-6">
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    <div className="mt-5 space-y-3">{children}</div>
  </section>
);

export const ProfileShell = ({
  title = "প্রোফাইল",
  subtitle,
  image,
  name,
  phone,
  status,
  onImageChange,
  imageUploading = false,
  topExtra,
  children,
}) => {
  const fileInputRef = useRef(null);
  const canUploadImage = typeof onImageChange === "function";
  const statusLabel =
    status === "approved"
      ? "অনুমোদিত"
      : status === "pending"
      ? "অপেক্ষমাণ"
      : status === "rejected"
      ? "বাতিল"
      : status === "inactive"
      ? "নিষ্ক্রিয়"
      : "অপেক্ষমাণ";

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('দয়া করে একটি ছবি নির্বাচন করুন');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("ছবির আকার ৫ এমবি এর কম হতে হবে");
      return;
    }

    if (canUploadImage) {
      await onImageChange(e);
      return;
    }
  };

  return (
  <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-8">
    <div className="rounded-2xl border bg-white p-6 md:p-8 shadow-sm">
      <div className="border-b text-center border-gray-100 pb-6">
        <h1 className="text-2xl md:text-3xl font-semibold  text-gray-900">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <img
              src={image || blankUser}
              alt={name || "প্রোফাইল"}
              className="h-24 w-24 rounded-full border-4 border-gray-100 object-cover bg-gray-50"
            />
            {canUploadImage && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
                  title="ছবি আপলোড করুন"
                >
                  <FiUpload className="text-sm" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={imageUploading}
                  className="hidden"
                  aria-label="প্রোফাইল ছবি আপলোড করুন"
                />
              </>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {name || "নাম দেওয়া হয়নি"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{phone || "-"}</p>
            <span
              className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                status === "approved"
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
              }`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {topExtra ? <div className="w-full lg:w-auto">{topExtra}</div> : null}
      </div>

      <div className="mt-8 space-y-6">{children}</div>
    </div>
  </div>
  );
};

export const ProfileSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
    <div className="rounded-2xl border bg-white p-6 md:p-8 shadow-sm">
      <div className="h-8 w-44 rounded bg-gray-200 animate-pulse" />
      <div className="mt-2 h-4 w-52 rounded bg-gray-200 animate-pulse" />

      <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse" />
          <div className="space-y-3">
            <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
            <div className="h-5 w-24 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-full max-w-xs rounded bg-gray-200 animate-pulse" />
      </div>

      <div className="mt-8 space-y-6">
        {Array.from({ length: 3 }).map((_, sectionIndex) => (
          <div
            key={sectionIndex}
            className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 md:p-6"
          >
            <div className="h-6 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((__, rowIndex) => (
                <div
                  key={`${sectionIndex}-${rowIndex}`}
                  className="h-14 rounded-xl bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
