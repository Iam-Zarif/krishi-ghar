import { useContext, useEffect, useMemo, useState } from "react";
import { Api } from "../../../../api/API";
import { UserProfileContext } from "../../../../providers/getUserProfile/getUserProfile";
import {
  formatProfileDate,
  ProfileFieldRow,
  ProfileSection,
  ProfileShell,
  ProfileSkeleton,
} from "../../common/BusinessProfileLayout";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Toast } from "../../../../components/common/Toast";
import { EditableField } from "../../../../components/common/EditableField";
import { useWholesalerProfileForm } from "../../../../hooks/useWholesalerProfileForm";

export default function WholesalerProfile() {
  const { userProfile, profileLoading, profileError, refreshProfile } =
    useContext(UserProfileContext);

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

  const data = userProfile || null;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const auth = token ? { Authorization: `Bearer ${token}` } : {};

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
  } = useWholesalerProfileForm({
    userProfile: data,
    refreshProfile,
    authHeaders: auth,
    apiRoot: Api,
    setToast,
  });

  useEffect(() => {
    if (!toast.message) return;
    const id = setTimeout(() => setToast({ type: "", message: "" }), 2600);
    return () => clearTimeout(id);
  }, [toast]);

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

  const act = (key) => ({
    save: () => saveSingleField(key),
    cancel: () => cancelSingleField(key),
    saving: saving[key],
    dirty: isDirty(key),
  });

  const address = useMemo(
    () =>
      [
        userProfile?.address,
        userProfile?.thana,
        userProfile?.district,
        userProfile?.division,
      ]
        .filter(Boolean)
        .join(", "),
    [userProfile]
  );

  if (profileLoading && !userProfile) return <ProfileSkeleton />;

  if (profileError && !userProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
          {profileError}
        </div>
      </div>
    );
  }

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
        title="হোলসেলার প্রোফাইল"
        subtitle="আপনার প্রোফাইলের তথ্য দেখুন এবং আপডেট করুন"
        image={avatarSrc}
        name={values.name}
        phone={values.phone}
        status={userProfile.status}
        onImageChange={onPickImage}
        imageUploading={imgSaving}
      >
        <ProfileSection title="ব্যাক্তিগত তথ্য">
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
          <EditableField
            label="ইমেইল"
            value={userProfile.email || ""}
            disabled
            readOnlyNote="read-only"
          />
          <EditableField
            label="এনআইডি"
            value={userProfile.nid || ""}
            disabled
            readOnlyNote="read-only"
          />
        </ProfileSection>

        <ProfileSection title="ঠিকানার তথ্য">
          <ProfileFieldRow label="বিভাগ" value={userProfile.division} />
          <ProfileFieldRow label="জেলা" value={userProfile.district} />
          <ProfileFieldRow label="থানা" value={userProfile.thana} />
          <ProfileFieldRow label="পূর্ণ ঠিকানা" value={address} />
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

        <ProfileSection title="ব্যবসায়িক ও সিস্টেম তথ্য">
          <ProfileFieldRow label="ট্রেড লাইসেন্স" value={userProfile.tradelicense} />
          <ProfileFieldRow label="রোল" value={userProfile.role} />
          <ProfileFieldRow label="স্ট্যাটাস" value={userProfile.status} />
          <ProfileFieldRow
            label="সর্বশেষ লগইন"
            value={formatProfileDate(userProfile.lastLogin)}
          />
          <ProfileFieldRow
            label="অ্যাকাউন্ট তৈরি"
            value={formatProfileDate(userProfile.createdAt)}
          />
          <ProfileFieldRow
            label="সর্বশেষ আপডেট"
            value={formatProfileDate(userProfile.updatedAt)}
          />
        </ProfileSection>
      </ProfileShell>
    </>
  );
}
