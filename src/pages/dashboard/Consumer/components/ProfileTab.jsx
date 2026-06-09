import { useContext, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { FiCalendar, FiMail, FiMapPin, FiPhone, FiUpload, FiUser } from "react-icons/fi";
import { Api } from "../../../../api/API";
import { EditableField } from "../../../../components/common/EditableField";
import { Toast } from "../../../../components/common/Toast";
import { useConsumerProfileForm } from "../../../../hooks/useConsumerProfileForm";
import { UserProfileContext } from "../../../../providers/getUserProfile/getUserProfile";

const ProfileTab = ({
  profileForView,
  orderStats,
  formatDate,
  formatPrice,
  addresses = [],
  profileForm: externalProfileForm,
}) => {
  const fileInputRef = useRef(null);
  const { userProfile, refreshProfile } = useContext(UserProfileContext);
  const [toast, setToast] = useState({ type: "", message: "" });
  const token =
    typeof window !== "undefined"
      ? Cookies.get("token") || localStorage.getItem("token")
      : "";
  const auth = token ? { Authorization: `Bearer ${token}` } : {};

  const internalProfileForm = useConsumerProfileForm({
    userProfile,
    refreshProfile,
    authHeaders: auth,
    apiRoot: Api,
    setToast,
  });

  const profileForm = externalProfileForm || internalProfileForm;
  const canEdit = Boolean(profileForm);
  const values = profileForm?.values || {};

  useEffect(() => {
    if (!toast.message) return;
    const id = setTimeout(() => setToast({ type: "", message: "" }), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const act = (key) => ({
    save: () => profileForm.saveSingleField(key),
    cancel: () => profileForm.cancelSingleField(key),
    saving: profileForm.saving?.[key],
    dirty: profileForm.isDirty(key),
  });

  const updateField = (key) => (value) =>
    profileForm.setValues((prev) => ({ ...prev, [key]: value }));

  const saveOnEnter = (key) => (event) => {
    if (event.key === "Enter" && profileForm.isDirty(key)) {
      profileForm.saveSingleField(key);
    }
  };

  const avatar = profileForm?.avatarSrc || profileForView.avatar;

  return (
    <div className="space-y-6">
      <Toast type={toast.type} message={toast.message} />

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 sm:p-8 flex flex-col lg:flex-row items-start gap-6">
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt={profileForView.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-neutral-100"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-neutral-100 bg-gray-100 flex items-center justify-center text-gray-500">
              <FiUser className="text-3xl sm:text-4xl" />
            </div>
          )}

          {canEdit ? (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={profileForm.imgSaving}
                className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
                title="ছবি আপলোড করুন"
              >
                <FiUpload />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={profileForm.onPickImage}
                disabled={profileForm.imgSaving}
                className="hidden"
              />
            </>
          ) : null}
        </div>

        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {canEdit ? values.name || profileForView.name : profileForView.name}
              </h1>
              <p className="text-gray-500">@{profileForView.username}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5 text-sm text-gray-700">
            <span className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
              <FiMail className="text-emerald-600" /> {canEdit ? values.email || "দেওয়া হয়নি" : profileForView.email}
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
              <FiPhone className="text-emerald-600" /> {canEdit ? values.phone || "দেওয়া হয়নি" : profileForView.phone}
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
              <FiCalendar className="text-emerald-600" />
              যোগদান: {formatDate(profileForView.joined)}
            </span>
          </div>
        </div>
      </div>

      {canEdit ? (
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 sm:p-8 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">প্রোফাইল তথ্য আপডেট</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <EditableField label="নাম" value={values.name} actions={act("name")} onChange={updateField("name")} onKeyDown={saveOnEnter("name")} />
            <EditableField label="ইমেইল" type="email" value={values.email} actions={act("email")} onChange={updateField("email")} onKeyDown={saveOnEnter("email")} />
            <EditableField label="মোবাইল নম্বর" value={values.phone} actions={act("phone")} onChange={updateField("phone")} onKeyDown={saveOnEnter("phone")} />
            <EditableField label="এনআইডি" value={values.nid} actions={act("nid")} onChange={updateField("nid")} onKeyDown={saveOnEnter("nid")} />
            <EditableField label="বিভাগ" value={values.division} actions={act("division")} onChange={updateField("division")} onKeyDown={saveOnEnter("division")} />
            <EditableField label="জেলা" value={values.district} actions={act("district")} onChange={updateField("district")} onKeyDown={saveOnEnter("district")} />
            <EditableField label="থানা" value={values.thana} actions={act("thana")} onChange={updateField("thana")} onKeyDown={saveOnEnter("thana")} />
            <EditableField label="ঠিকানা" value={values.address} actions={act("address")} onChange={updateField("address")} onKeyDown={saveOnEnter("address")} />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm"><p className="text-xs text-gray-500">মোট অর্ডার</p><p className="text-2xl font-bold text-gray-900 mt-1">{orderStats.totalOrders}</p></div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm"><p className="text-xs text-gray-500">সম্পন্ন</p><p className="text-2xl font-bold text-emerald-600 mt-1">{orderStats.completedOrders}</p></div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm"><p className="text-xs text-gray-500">অপেক্ষমাণ</p><p className="text-2xl font-bold text-amber-500 mt-1">{orderStats.pendingOrders}</p></div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm"><p className="text-xs text-gray-500">বাতিল</p><p className="text-2xl font-bold text-red-500 mt-1">{orderStats.cancelledOrders}</p></div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm col-span-2 lg:col-span-1"><p className="text-xs text-gray-500">মোট খরচ</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(orderStats.totalSpend)}</p></div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 sm:p-8 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">ঠিকানার তথ্য</h2>
        {addresses.length ? (
          addresses.map((address) => (
            <div key={address.label} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-gray-50">
              <div className="flex-1"><h3 className="font-medium text-gray-900">{address.label}</h3><p className="text-sm text-gray-600 mt-1">{address.line}</p></div>
              {address.mapLink && (<a href={address.mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"><FiMapPin className="text-base" /> মানচিত্র দেখুন</a>)}
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-600">প্রোফাইলে ঠিকানা যোগ করা হয়নি।</div>
        )}
      </div>
    </div>
  );
};

export default ProfileTab;
