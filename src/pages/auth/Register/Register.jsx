import { Link, useNavigate } from "react-router-dom";
import bdLocationData from "../../../data/location.json";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Api } from "../../../api/API";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { UserProfileContext } from "../../../providers/getUserProfile/getUserProfile";
import AuthSubmitButton from "../components/AuthSubmitButton";
import { getRoleDashboardPath } from "../../../utils/roleDashboardPath";
import RegisterField from "./components/RegisterField";
import RegisterRoleSelect from "./components/RegisterRoleSelect";
import SearchableLocationDropdown from "./components/SearchableLocationDropdown";
import {
  BUSINESS_FIELDS,
  COMMON_FIELDS,
  CONSUMER_FIELDS,
  INITIAL_REGISTER_FORM,
  PASSWORD_FIELDS,
} from "./registerFields";

const BRAND_LOGO_SRC = "/photos/auth/brandLogo.svg";

const ROLE_REQUIRES_TRADE_LICENSE = ["producer", "supersaler", "wholesaler"];

const LOCATION_FIELD_NAMES = new Set(["division", "district", "thana"]);

const trimForm = (form) =>
  Object.fromEntries(
    Object.entries(form).map(([key, value]) => [
      key,
      String(value || "").trim(),
    ]),
  );

const getLocationId = (item) =>
  String(item?.id || item?._id || item?.code || "");

const getLocationName = (item) =>
  String(item?.bn_name || item?.name || item?.display || "").trim();

const buildRegisterPayload = ({ selectedRole, form }) => {
  const trimmed = trimForm(form);

  const payload = {
    role: selectedRole?.trim(),
    name: trimmed.name,
    phone: trimmed.phone,
    password: trimmed.password,
  };

  if (selectedRole !== "consumer") {
    payload.email = trimmed.email;
    payload.nid = trimmed.nid;
    payload.tradelicense = trimmed.tradelicense;
    payload.division = trimmed.division;
    payload.district = trimmed.district;
    payload.thana = trimmed.thana;
    payload.address = trimmed.address;
  }

  return payload;
};

const validateRegisterPayload = ({ payload, selectedRole, form }) => {
  if (!payload.role) return "ভূমিকা নির্বাচন করা বাধ্যতামূলক।";
  if (!payload.name) return "নাম প্রদান করা বাধ্যতামূলক।";

  if (!payload.phone || !/^\d{10,15}$/.test(payload.phone)) {
    return "মোবাইল নম্বর অবশ্যই ১০-১৫ সংখ্যার হতে হবে।";
  }

  if (!payload.password || payload.password.length < 6) {
    return "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।";
  }

  if (payload.password !== form.confirmPassword) {
    return "পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড মিলছে না।";
  }

  if (selectedRole !== "consumer") {
    if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return "ইমেইল ফরম্যাট সঠিক নয়।";
    }

    if (!payload.nid || !/^\d{10,40}$/.test(payload.nid)) {
      return "এনআইডি অবশ্যই ১০-৪০ সংখ্যার হতে হবে।";
    }

    if (!payload.division || !payload.district || !payload.thana) {
      return "বিভাগ, জেলা এবং থানা প্রদান করা বাধ্যতামূলক।";
    }

    if (!payload.address) {
      return "ঠিকানা প্রদান করা বাধ্যতামূলক।";
    }
  }

  if (
    ROLE_REQUIRES_TRADE_LICENSE.includes(selectedRole) &&
    !payload.tradelicense
  ) {
    return "ট্রেড লাইসেন্স প্রদান করা বাধ্যতামূলক।";
  }

  return "";
};

const Register = () => {
  const { setRole, userProfile } = useContext(UserProfileContext);
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(INITIAL_REGISTER_FORM);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const locationData = {
    divisions: Array.isArray(bdLocationData?.divisions)
      ? bdLocationData.divisions
      : [],
    districts: Array.isArray(bdLocationData?.districts)
      ? bdLocationData.districts
      : [],
    thanas: Array.isArray(bdLocationData?.thanas) ? bdLocationData.thanas : [],
  };

  const [locationIds, setLocationIds] = useState({
    divisionId: "",
    districtId: "",
    thanaId: "",
  });

  const roleSelectRef = useRef(null);

  useEffect(() => {
    if (userProfile?.role) {
      const dashboardPath = getRoleDashboardPath(
        userProfile.role.toLowerCase(),
      );
      navigate(dashboardPath || "/", { replace: true });
    }
  }, [userProfile, navigate]);

  useEffect(() => {
    if (!dropdownOpen) return undefined;

    const handleClickOutside = (event) => {
      if (!roleSelectRef.current?.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [dropdownOpen]);

  const filteredDistricts = locationData.districts.filter(
    (district) =>
      String(district.divisionId) === String(locationIds.divisionId),
  );

  const filteredThanas = locationData.thanas.filter(
    (thana) => String(thana.districtId) === String(locationIds.districtId),
  );

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSelectedRoleSelect = (role) => {
    setSelectedRole(role);
    setDropdownOpen(false);
  };

  const handleDivisionChange = (divisionId) => {

    const selectedDivision = locationData.divisions.find(
      (division) => getLocationId(division) === divisionId,
    );

    setLocationIds({
      divisionId,
      districtId: "",
      thanaId: "",
    });

    setForm((current) => ({
      ...current,
      division: selectedDivision ? getLocationName(selectedDivision) : "",
      district: "",
      thana: "",
    }));
  };

  const handleDistrictChange = (districtId) => {

    const selectedDistrict = locationData.districts.find(
      (district) => getLocationId(district) === districtId,
    );

    setLocationIds((current) => ({
      ...current,
      districtId,
      thanaId: "",
    }));

    setForm((current) => ({
      ...current,
      district: selectedDistrict ? getLocationName(selectedDistrict) : "",
      thana: "",
    }));
  };

  const handleThanaChange = (thanaId) => {

    const selectedThana = locationData.thanas.find(
      (thana) => getLocationId(thana) === thanaId,
    );

    setLocationIds((current) => ({
      ...current,
      thanaId,
    }));

    setForm((current) => ({
      ...current,
      thana: selectedThana ? getLocationName(selectedThana) : "",
    }));
  };

  const handleConsumerLogin = async (payload) => {
    const loginRes = await axios.post(`${Api}/api/v1/login`, {
      phone: payload.phone,
      password: payload.password,
    });

    Cookies.set("token", loginRes.data.token, { expires: 7 });
    localStorage.setItem("token", loginRes.data.token);

    axios.defaults.headers.common["Authorization"] =
      `Bearer ${loginRes.data.token}`;

    const nextRole = (loginRes.data.user?.role || "consumer").toLowerCase();

    Cookies.set("role", nextRole, { expires: 7 });
    setRole(nextRole);

    toast.success("ক্রেতা হিসেবে লগইন হয়েছে");
    navigate("/");
  };

  const handleRegister = async (event) => {
    if (event?.preventDefault) event.preventDefault();

    const payload = buildRegisterPayload({ selectedRole, form });

    const validationError = validateRegisterPayload({
      payload,
      selectedRole,
      form,
    });

    if (validationError) {
      setLoading(false);
      return toast.error(validationError);
    }

    try {
      setLoading(true);

      await axios.post(`${Api}/api/v1/register`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success("রেজিস্ট্রেশন সফল হয়েছে!");

      if (selectedRole === "consumer") {
        await handleConsumerLogin(payload);
        return;
      }

      localStorage.setItem("isApproved", 0);

      setTimeout(() => {
        navigate("/auth/waitForAdminApproval");
      }, 1000);
    } catch (error) {
      console.error("Error during registration:", error);

      if (error.response) {
        toast.error(
          error.response.data?.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে!",
        );
      } else if (error.request) {
        toast.error(
          "সার্ভার থেকে কোনো সাড়া পাওয়া যায়নি। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
        );
      } else {
        toast.error("অপ্রত্যাশিত ত্রুটি হয়েছে। আবার চেষ্টা করুন।");
      }
    } finally {
      setLoading(false);
    }
  };

  const visibleBusinessFields = BUSINESS_FIELDS.filter(
    (field) => !field.hiddenForRoles?.includes(selectedRole),
  );

  const visibleNonLocationBusinessFields = visibleBusinessFields.filter(
    (field) => !LOCATION_FIELD_NAMES.has(field.name) && field.name !== "address",
  );

  const addressField = visibleBusinessFields.find(
    (field) => field.name === "address",
  );

  return (
    <div
      className={`flex w-full px-6 lg:px-0 pb-16 ${
        selectedRole === "consumer" ? "h-screen items-center" : " "
      } ${
        !selectedRole && "h-screen pt-36"
      } adminLoginGradient justify-center mt-8`}
    >
      <Toaster />

      <div className="w-full mx-auto">
        <img src={BRAND_LOGO_SRC} className="w-24 mx-auto" alt="লোগো" />

        <p className="text-center text-2xl opacity-80 font-semibold mt-5">
          অ্যাকাউন্ট রেজিস্ট্রেশন
        </p>

        <div
          className={`mt-12 px-4 text-sm lg:px-0 w-full mx-auto flex flex-col items-center gap-y-4 ${
            selectedRole === "consumer" ? "max-w-lg" : "max-w-2xl"
          } ${!selectedRole && "max-w-sm"}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center w-full gap-2 lg:gap-6">
            <RegisterRoleSelect
              selectedRole={selectedRole}
              dropdownOpen={dropdownOpen}
              selectRef={roleSelectRef}
              onToggle={() => setDropdownOpen((current) => !current)}
              onSelect={handleSelectedRoleSelect}
            />

            {selectedRole ? (
              <RegisterField
                field={COMMON_FIELDS[0]}
                value={form.name}
                onChange={updateField}
              />
            ) : null}
          </div>

          {selectedRole === "consumer" ? (
            <div className="flex w-full flex-col text-sm items-center gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-5 items-end w-full lg:gap-x-4 gap-y-4">
                <div className="col-span-3">
                  <RegisterField
                    field={CONSUMER_FIELDS[0]}
                    value={form.phone}
                    onChange={updateField}
                  />
                </div>

                <div className="col-span-2 w-full">
                  <button
                    type="button"
                    className="font-semibold text-sm bg-yellow py-3 w-full rounded-xl cursor-pointer"
                  >
                    ওটিপি নিন
                  </button>
                </div>
              </div>

              <RegisterField
                field={CONSUMER_FIELDS[1]}
                value={form.otp}
                onChange={updateField}
              />
            </div>
          ) : null}

          {selectedRole && selectedRole !== "consumer" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 items-center w-full gap-4 lg:gap-8">
                {visibleNonLocationBusinessFields.slice(0, 2).map((field) => (
                  <RegisterField
                    key={field.name}
                    field={field}
                    value={form[field.name]}
                    onChange={updateField}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 items-center w-full gap-4 lg:gap-8">
                {visibleNonLocationBusinessFields.slice(2, 4).map((field) => (
                  <div
                    key={field.name}
                    className={
                      selectedRole === "wholesaler" && field.name === "nid"
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <RegisterField
                      field={field}
                      value={form[field.name]}
                      onChange={updateField}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 items-center w-full gap-4 lg:gap-8">
                <SearchableLocationDropdown
                  label="বিভাগ"
                  value={locationIds.divisionId}
                  onChange={handleDivisionChange}
                  options={locationData.divisions}
                  placeholder="আপনার বিভাগ নির্বাচন করুন"
                />

                <SearchableLocationDropdown
                  label="জেলা"
                  value={locationIds.districtId}
                  onChange={handleDistrictChange}
                  options={filteredDistricts}
                  placeholder="আপনার জেলা নির্বাচন করুন"
                  disabled={!locationIds.divisionId}
                />
              </div>

              <SearchableLocationDropdown
                label="থানা"
                value={locationIds.thanaId}
                onChange={handleThanaChange}
                options={filteredThanas}
                placeholder="আপনার থানা নির্বাচন করুন"
                disabled={!locationIds.districtId}
              />

              {addressField ? (
                <RegisterField
                  field={addressField}
                  value={form.address}
                  onChange={updateField}
                />
              ) : null}
            </>
          ) : null}

          {selectedRole ? (
            <>
              <div className="flex lg:flex-row flex-col w-full lg:gap-8 gap-4 items-start justify-between">
                <RegisterField
                  field={PASSWORD_FIELDS[0]}
                  value={form.password}
                  onChange={updateField}
                  passwordVisible={showPassword}
                  onTogglePassword={() =>
                    setShowPassword((current) => !current)
                  }
                />

                <RegisterField
                  field={PASSWORD_FIELDS[1]}
                  value={form.confirmPassword}
                  onChange={updateField}
                  passwordVisible={showConfirmPassword}
                  onTogglePassword={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                />
              </div>

              <AuthSubmitButton onClick={handleRegister} loading={loading}>
                রেজিস্ট্রেশন করুন
              </AuthSubmitButton>
            </>
          ) : null}

          <p className="text-center text-sm text-gray-600">
            ইতোমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link
              to="/auth/login"
              className="text-blue-700 font-semibold underline"
            >
              লগইন করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
