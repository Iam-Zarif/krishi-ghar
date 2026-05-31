import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ApiPaths } from "../api/apiPaths";

const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const editableFields = new Set([
  "name",
  "phone",
  "nid",
  "email",
  "division",
  "district",
  "thana",
  "address",
]);

const buildProfileFields = (data = {}) => ({
  name: data.name || "",
  phone: (data.phone ?? "").toString(),
  nid: (data.nid ?? "").toString(),
  tradelicense: data.tradelicense || "",
  email: data.email || "",
  division: data.division || "",
  district: data.district || "",
  thana: data.thana || "",
  address: data.address || "",
});

const initialSaving = () =>
  Object.fromEntries(
    Object.keys(buildProfileFields()).map((key) => [key, false])
  );

const resolveProfileImage = (value = "", apiRoot) => {
  const path = String(value || "").trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiRoot}/${path.replace(/^\/+/, "")}`;
};

const normalizeSupersalerApiRole = (role) => {
  const normalizedRole = String(role || "supersaler").toLowerCase();
  return normalizedRole === "superseller" ? "supersaler" : normalizedRole;
};

const resolveSupersalerPath = (role, fallbackPath) => {
  const normalizedRole = normalizeSupersalerApiRole(role);
  if (normalizedRole === "supersaler") {
    return `/api/v1/${normalizedRole}/profile`;
  }

  return fallbackPath;
};

const resolveSupersalerImagePath = (role, fallbackPath) => {
  const normalizedRole = normalizeSupersalerApiRole(role);
  if (normalizedRole === "supersaler") {
    return `/api/v1/${normalizedRole}/profile-image`;
  }

  return fallbackPath;
};

export const useSupersalerProfileForm = ({
  userProfile,
  refreshProfile,
  authHeaders,
  apiRoot,
  profileRole,
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
    () =>
      [values.address, values.thana, values.district, values.division]
        .filter(Boolean)
        .join(", "),
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
      const profilePath = resolveSupersalerPath(
        profileRole || userProfile?.role,
        ApiPaths.supersaler.updateProfile || ApiPaths.supersaler.profile
      );

      await axios.put(
        `${apiRoot}${profilePath}`,
        { [key]: values[key] },
        {
          headers: { ...authHeaders, "Content-Type": "application/json" },
        }
      );

      const nextProfile = { ...(userProfile || {}) };
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
      const profileImagePath = resolveSupersalerImagePath(
        profileRole || userProfile?.role,
        ApiPaths.supersaler.profileImage
      );

      const response = await axios.put(
        `${apiRoot}${profileImagePath}`,
        fd,
        {
          headers: { ...authHeaders, "Content-Type": "multipart/form-data" },
        }
      );

      const nextProfile = { ...(userProfile || {}) };
      if (response.data?.supersaler?.image) {
        nextProfile.image = response.data.supersaler.image;
      } else if (response.data?.image) {
        nextProfile.image = response.data.image;
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
    avatarSrc,
  };
};
