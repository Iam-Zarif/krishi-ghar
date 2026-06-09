import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ApiPaths } from "../api/apiPaths";

const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const editableFields = new Set([
  "name",
  "email",
  "phone",
  "nid",
  "division",
  "district",
  "thana",
  "address",
]);

const buildProfileFields = (data = {}) => ({
  name: data.name || "",
  email: data.email || "",
  phone: (data.phone ?? "").toString(),
  nid: (data.nid ?? "").toString(),
  division: data.division || "",
  district: data.district || "",
  thana: data.thana || "",
  address: data.address || "",
});

const initialSaving = () =>
  Object.fromEntries(Object.keys(buildProfileFields()).map((key) => [key, false]));

const resolveProfileImage = (value = "", apiRoot) => {
  const path = String(value || "").trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiRoot}/${path.replace(/^\/+/, "")}`;
};

export const useWholesalerProfileForm = ({
  userProfile,
  refreshProfile,
  authHeaders,
  apiRoot,
  setToast,
}) => {
  const [values, setValues] = useState(buildProfileFields());
  const [orig, setOrig] = useState(buildProfileFields());
  const [saving, setSaving] = useState(initialSaving());
  const [imgSaving, setImgSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (!userProfile) return;
    const next = buildProfileFields(userProfile);
    setOrig(next);
    setValues(next);
    setImagePreview("");
  }, [userProfile]);

  const fullAddress = useMemo(
    () => [values.address, values.thana, values.district, values.division].filter(Boolean).join(", "),
    [values.address, values.division, values.district, values.thana]
  );

  const setFieldSaving = (key, value) =>
    setSaving((prev) => ({ ...prev, [key]: value }));

  const isDirty = (key) => (values[key] ?? "") !== (orig[key] ?? "");

  const saveSingleField = async (key) => {
    if (!isDirty(key)) return;
    if (!editableFields.has(key)) {
      setToast({ type: "warn", message: "এই তথ্যটি এপিআই থেকে আপডেটযোগ্য নয়" });
      return;
    }
    if (key === "email" && values.email && !emailOk(values.email)) {
      setToast({ type: "warn", message: "ইমেইল ফরম্যাট সঠিক নয়" });
      return;
    }

    setFieldSaving(key, true);
    try {
      const formData = new FormData();
      formData.append(key, values[key]);

      const { data } = await axios.put(
        `${apiRoot}${ApiPaths.wholesaler.updateProfile || ApiPaths.wholesaler.profile}`,
        formData,
        {
          headers: { ...authHeaders, "Content-Type": "multipart/form-data" },
        }
      );

      const nextProfile = data?.wholesaler || { ...(userProfile || {}) };
      nextProfile[key] = values[key];

      if (typeof refreshProfile === "function") {
        refreshProfile(nextProfile);
      }

      setOrig((prev) => ({ ...prev, [key]: values[key] }));
      setToast({ type: "success", message: "প্রোফাইল আপডেট হয়েছে" });
    } catch (error) {
      setValues((prev) => ({ ...prev, [key]: orig[key] }));
      setToast({
        type: "error",
        message: error?.response?.data?.message || "আপডেট ব্যর্থ হয়েছে",
      });
    } finally {
      setFieldSaving(key, false);
    }
  };

  const cancelSingleField = (key) => {
    setValues((prev) => ({ ...prev, [key]: orig[key] }));
  };

  const onPickImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setImgSaving(true);

    try {
      const fd = new FormData();
      fd.append("image", file);

      const { data } = await axios.put(
        `${apiRoot}${ApiPaths.wholesaler.profileImage}`,
        fd,
        {
          headers: { ...authHeaders, "Content-Type": "multipart/form-data" },
        }
      );

      const nextProfile = data?.wholesaler || { ...(userProfile || {}) };
      if (data?.wholesaler?.image || data?.image) {
        nextProfile.image = data?.wholesaler?.image || data.image;
      }

      if (typeof refreshProfile === "function") {
        refreshProfile(nextProfile);
      }

      setToast({ type: "success", message: "ছবি আপডেট হয়েছে" });
    } catch (error) {
      setImagePreview("");
      setToast({
        type: "error",
        message: error?.response?.data?.message || "ছবি আপলোড ব্যর্থ হয়েছে",
      });
    } finally {
      setImgSaving(false);
      setTimeout(() => URL.revokeObjectURL(localUrl), 1500);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put(
        `${apiRoot}${ApiPaths.wholesaler.changePassword}`,
        {
          oldPassword: currentPassword,
          newPassword,
        },
        {
          headers: { ...authHeaders, "Content-Type": "application/json" },
        }
      );

      setToast({ type: "success", message: "পাসওয়ার্ড পরিবর্তন হয়েছে" });
      return { success: true };
    } catch (error) {
      setToast({
        type: "error",
        message: error?.response?.data?.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে",
      });
      return { success: false };
    }
  };

  const avatarSrc = imagePreview || resolveProfileImage(userProfile?.image, apiRoot);

  return {
    values,
    setValues,
    saving,
    imgSaving,
    imagePreview,
    fullAddress,
    isDirty,
    saveSingleField,
    cancelSingleField,
    onPickImage,
    changePassword,
    avatarSrc,
  };
};
