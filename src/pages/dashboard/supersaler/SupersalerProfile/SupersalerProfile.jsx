import { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Api } from "../../../../api/API";
import { UserProfileContext } from "../../../../providers/getUserProfile/getUserProfile";
import { FiCheck, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import {
  formatProfileDate,
  ProfileSection,
  ProfileShell,
  ProfileSkeleton,
} from "../../common/BusinessProfileLayout";
import { Toast } from "../../../../components/common/Toast";
import { EditableField } from "../../../../components/common/EditableField";
import { useSupersalerProfileForm } from "../../../../hooks/useSupersalerProfileForm";

export default function SupersalerProfile() {
  const { userProfile, profileLoading, refreshProfile } =
    useContext(UserProfileContext);
  const token =
    typeof window !== "undefined"
      ? Cookies.get("token") || localStorage.getItem("token")
      : "";
  const auth = token ? { Authorization: `Bearer ${token}` } : {};
  const data = userProfile || null;
  const profileRole =
    data?.role || (typeof window !== "undefined" ? Cookies.get("role") : "") || "supersaler";

  const [toast, setToast] = useState({ type: "", message: "" });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    values,
    setValues,
    saving,
    imgSaving,
    fullAddress,
    isDirty,
    saveSingleField,
    cancelSingleField,
    onPickImage,
    changePassword,
    avatarSrc,
  } = useSupersalerProfileForm({
    userProfile: data,
    refreshProfile,
    authHeaders: auth,
    apiRoot: Api,
    profileRole,
    setToast,
  });

  const handlePasswordChange = async () => {
    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      setToast({ type: "warn", message: "সকল ফিল্ড পূরণ করুন" });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setToast({ type: "warn", message: "নতুন পাসওয়ার্ড মিলছে না" });
      return;
    }

    setChangingPassword(true);
    const result = await changePassword(
      passwords.currentPassword,
      passwords.newPassword
    );
    setChangingPassword(false);

    if (result.success) {
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  useEffect(() => {
    if (!toast.message) return;
    const id = setTimeout(() => setToast({ type: "", message: "" }), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const act = (key) =>
    saving[key] ? (
      <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    ) : isDirty(key) ? (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => saveSingleField(key)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm ring-1 ring-emerald-700/20 transition hover:bg-emerald-700 active:scale-[0.98]"
          title="সংরক্ষণ"
        >
          <FiCheck size={14} />
          <span className="hidden sm:inline">সংরক্ষণ করুন</span>
        </button>
        <button
          type="button"
          onClick={() => cancelSingleField(key)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
          title="বাতিল"
        >
          <FiX size={14} />
          <span className="hidden sm:inline">বাতিল</span>
        </button>
      </div>
    ) : null;

  if (profileLoading && !data) {
    return <ProfileSkeleton />;
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-2xl border shadow-sm p-10">
          <p className="text-gray-800">কোন প্রোফাইল পাওয়া যায়নি</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ type: "", message: "" })}
      />

      <ProfileShell
        title="সুপার সেলার প্রোফাইল"
        subtitle="আপনার প্রোফাইলের তথ্য দেখুন এবং আপডেট করুন"
        image={avatarSrc}
        name={values.name || data.name}
        phone={values.phone || data.phone}
        status={data.status}
        onImageChange={onPickImage}
        imageUploading={imgSaving}
      >
        <ProfileSection title="ব্যক্তিগত তথ্য">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
            <EditableField
              label="আইডি"
              value={data?._id || ""}
              disabled
              readOnlyNote="read-only"
            />

            <EditableField
              label="নাম"
              value={values.name}
              actions={act("name")}
              onChange={(value) => setValues((s) => ({ ...s, name: value }))}
              onKeyDown={(e) =>
                e.key === "Enter" && isDirty("name") && saveSingleField("name")
              }
            />

            <EditableField
              label="রোল"
              value={
                (data?.role || "").toString().charAt(0).toUpperCase() +
                (data?.role || "").toString().slice(1)
              }
              disabled
              readOnlyNote="read-only"
            />

            <EditableField
              label="স্ট্যাটাস"
              value={data?.status || ""}
              disabled
              readOnlyNote="read-only"
            />

            <EditableField
              label="ফোন"
              value={values.phone}
              actions={act("phone")}
              onChange={(value) => setValues((s) => ({ ...s, phone: value }))}
              onKeyDown={(e) =>
                e.key === "Enter" && isDirty("phone") && saveSingleField("phone")
              }
            />

            <EditableField
              label="এনআইডি"
              value={values.nid}
              actions={act("nid")}
              onChange={(value) => setValues((s) => ({ ...s, nid: value }))}
              onKeyDown={(e) =>
                e.key === "Enter" && isDirty("nid") && saveSingleField("nid")
              }
            />

            <EditableField
              label="ইমেইল"
              type="email"
              value={values.email}
              actions={act("email")}
              onChange={(value) => setValues((s) => ({ ...s, email: value }))}
              onKeyDown={(e) =>
                e.key === "Enter" && isDirty("email") && saveSingleField("email")
              }
            />

            <EditableField
              label="ট্রেড লাইসেন্স"
              value={values.tradelicense}
              disabled
              readOnlyNote="read-only"
            />

            <EditableField
              label="বিভাগ"
              value={values.division}
              actions={act("division")}
              onChange={(value) => setValues((s) => ({ ...s, division: value }))}
              onKeyDown={(e) =>
                e.key === "Enter" && isDirty("division") && saveSingleField("division")
              }
            />

            <EditableField
              label="জেলা"
              value={values.district}
              actions={act("district")}
              onChange={(value) => setValues((s) => ({ ...s, district: value }))}
              onKeyDown={(e) =>
                e.key === "Enter" && isDirty("district") && saveSingleField("district")
              }
            />

            <EditableField
              label="থানা"
              value={values.thana}
              actions={act("thana")}
              onChange={(value) => setValues((s) => ({ ...s, thana: value }))}
              onKeyDown={(e) =>
                e.key === "Enter" && isDirty("thana") && saveSingleField("thana")
              }
            />

            <EditableField
              label="ঠিকানা"
              value={values.address}
              actions={act("address")}
              onChange={(value) => setValues((s) => ({ ...s, address: value }))}
              onKeyDown={(e) =>
                e.key === "Enter" && isDirty("address") && saveSingleField("address")
              }
            />

            <EditableField
              label="সম্পূর্ণ ঠিকানা"
              value={fullAddress || "দেওয়া হয়নি"}
              textarea
              rows={2}
              disabled
              readOnlyNote="auto"
            />

            <EditableField
              label="শেষ লগইন"
              value={formatProfileDate(data?.lastLogin)}
              disabled
              readOnlyNote="read-only"
            />

            <EditableField
              label="যোগদানের তারিখ"
              value={formatProfileDate(data?.createdAt)}
              disabled
              readOnlyNote="read-only"
            />

            <EditableField
              label="সর্বশেষ আপডেট"
              value={formatProfileDate(data?.updatedAt)}
              disabled
              readOnlyNote="read-only"
            />
          </div>
        </ProfileSection>

        <ProfileSection title="পাসওয়ার্ড পরিবর্তন">
          <div className="grid gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                বর্তমান পাসওয়ার্ড
              </p>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="বর্তমান পাসওয়ার্ড দিন"
                  className="mt-1 w-full rounded-md border border-gray-200 bg-white p-2"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label="বর্তমান পাসওয়ার্ড দেখুন"
                >
                  {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  নতুন পাসওয়ার্ড
                </p>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="নতুন পাসওয়ার্ড দিন"
                    className="mt-1 w-full rounded-md border border-gray-200 bg-white p-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    aria-label="নতুন পাসওয়ার্ড দেখুন"
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  নিশ্চিত পাসওয়ার্ড
                </p>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                    className="mt-1 w-full rounded-md border border-gray-200 bg-white p-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    aria-label="নিশ্চিত পাসওয়ার্ড দেখুন"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={changingPassword}
              className="mt-3 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {changingPassword
                ? "পাসওয়ার্ড আপডেট হচ্ছে..."
                : "পাসওয়ার্ড পরিবর্তন করুন"}
            </button>
          </div>
        </ProfileSection>
      </ProfileShell>
    </>
  );
}
