import { useContext, useEffect, useState } from "react";
import { Api } from "../../../../api/API";
import { UserProfileContext } from "../../../../providers/getUserProfile/getUserProfile";
import { FiCheck, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import {
  formatProfileDate,
  ProfileSection,
  ProfileShell,
  ProfileSkeleton,
} from "../../common/BusinessProfileLayout";
import { Toast } from "../../../../components/common/Toast";
import { EditableField } from "../../../../components/common/EditableField";
import { useProducerProfileForm } from "../../../../hooks/useProducerProfileForm";

export default function ProducerProfile() {
  const { userProfile, profileLoading, refreshProfile } =
    useContext(UserProfileContext);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const auth = token ? { Authorization: `Bearer ${token}` } : {};
  const data = userProfile || null;

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
    isDirty,
    saveSingleField,
    cancelSingleField,
    onPickImage,
    changePassword,
    avatarSrc,
  } = useProducerProfileForm({
    userProfile: data,
    refreshProfile,
    authHeaders: auth,
    apiRoot: Api,
    setToast,
  });

  const handlePasswordChange = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
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
      passwords.newPassword,
      passwords.confirmPassword
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

  const act = (key) => ({
    save: () => saveSingleField(key),
    cancel: () => cancelSingleField(key),
    saving: saving[key],
    dirty: isDirty(key),
  });

  if (profileLoading && !userProfile) return <ProfileSkeleton />;

  if (!userProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border bg-white p-6 text-gray-700 shadow-sm">
          কোনো প্রোফাইল তথ্য পাওয়া যায়নি।
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast type={toast.type} message={toast.message} />
      <ProfileShell
        title="উৎপাদক প্রোফাইল"
        subtitle="আপনার প্রোফাইলের তথ্য দেখুন এবং আপডেট করুন"
        image={avatarSrc}
        name={values.name}
        phone={values.phone}
        status={userProfile.status}
        onImageChange={onPickImage}
        imageUploading={imgSaving}
      >
        <ProfileSection title="ব্যক্তিগত তথ্য">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <EditableField
              label="নাম"
              value={values.name}
              actions={act("name")}
              onChange={(value) => setValues((prev) => ({ ...prev, name: value }))}
              onKeyDown={(e) =>
                e.key === "Enter" && isDirty("name") && saveSingleField("name")
              }
            />
            <EditableField
              label="মোবাইল নম্বর"
              value={values.phone}
              actions={act("phone")}
              onChange={(value) => setValues((prev) => ({ ...prev, phone: value }))}
              onKeyDown={(e) =>
                e.key === "Enter" && isDirty("phone") && saveSingleField("phone")
              }
            />
          </div>
        </ProfileSection>

        <ProfileSection title="ব্যবসায়িক তথ্য">
          <EditableField
            label="ঠিকানা"
            value={values.address}
            actions={act("address")}
            onChange={(value) => setValues((prev) => ({ ...prev, address: value }))}
            onKeyDown={(e) =>
              e.key === "Enter" && isDirty("address") && saveSingleField("address")
            }
          />
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
                  className="mt-1 p-2 w-full border rounded-md border-gray-200 bg-white"
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
                      setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    placeholder="নতুন পাসওয়ার্ড দিন"
                    className="mt-1 p-2 w-full border rounded-md border-gray-200 bg-white"
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
                    className="mt-1 p-2 w-full border rounded-md border-gray-200 bg-white"
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
              {changingPassword ? "পাসওয়ার্ড আপডেট হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}
            </button>
          </div>
        </ProfileSection>

        <ProfileSection title="সিস্টেম তথ্য">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-sm">
              <span className="font-medium text-gray-500">রোল:</span>{" "}
              <span className="text-gray-900">{userProfile.role}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-500">স্ট্যাটাস:</span>{" "}
              <span className="text-gray-900">{userProfile.status}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-500">সর্বশেষ লগইন:</span>{" "}
              <span className="text-gray-900">
                {formatProfileDate(userProfile.lastLogin)}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-500">অ্যাকাউন্ট তৈরি:</span>{" "}
              <span className="text-gray-900">
                {formatProfileDate(userProfile.createdAt)}
              </span>
            </div>
          </div>
        </ProfileSection>
      </ProfileShell>
    </>
  );
}
