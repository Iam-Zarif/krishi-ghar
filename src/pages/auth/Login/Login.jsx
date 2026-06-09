

import { Link, useNavigate } from "react-router-dom";
import { IoIosLock } from "react-icons/io";
import { IoIosUnlock } from "react-icons/io";
import React, { useContext, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Api } from "../../../api/API";
import Cookies from "js-cookie";
import { UserProfileContext } from "../../../providers/getUserProfile/getUserProfile";
import AuthSubmitButton from "../components/AuthSubmitButton";
import { getRoleDashboardPath } from "../../../utils/roleDashboardPath";

const BRAND_LOGO_SRC = "/photos/auth/brandLogo.svg";
const FERTILIZER_IMAGE_SRC = "/photos/auth/fertilizer.svg";

const Login = () => {
  const { setRole, userProfile } = useContext(UserProfileContext);
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (userProfile?.role) {
      const dashboardPath = getRoleDashboardPath(userProfile.role.toLowerCase());
      navigate(dashboardPath || "/", { replace: true });
    }
  }, [userProfile, navigate]);

  const handleLogin = async () => {
    if (!phone || !password) {
      toast.error("সব তথ্য পূরণ করা আবশ্যক!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${Api}/api/v1/login`, {
        phone,
        password,
      });

      toast.success("সফলভাবে লগইন হয়েছে!");
      localStorage.setItem("token", response.data.token);

      Cookies.set("token", response.data.token, { expires: 7 });
      Cookies.set("role", response.data.user.role.toLowerCase(), {
        expires: 7,
      });

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      setRole(response.data.user.role.toLowerCase());

      const userRole = response.data.user.role.toLowerCase();

      setTimeout(() => {
        if (userRole === "consumer") {
          navigate("/");
          return;
        }

        navigate(getRoleDashboardPath(userRole));
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "লগইন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex lg:px-0 px-6 adminLoginGradient w-full items-center justify-center h-screen">
      <Toaster />

      <div className="w-full text-sm grid lg:grid-cols-2 lg:justify-center h-full">
        <img
          loading="lazy"
          src={FERTILIZER_IMAGE_SRC}
          alt="সার"
          className="object-cover lg:block hidden w-full h-screen"
        />

        <div className="flex w-full max-w-sm mx-auto items-center justify-center h-full">
          <div className="w-full">
            <img src={BRAND_LOGO_SRC} className="w-28 mx-auto" alt="ব্র্যান্ড লোগো" />

            <p className="text-2xl font-semibold text-center mt-8 text-yellow">
              লগইন
            </p>

            <div className="flex w-full flex-col gap-y-5 items-center justify-center mt-12">
              <div className="w-full flex flex-col gap-y-2">
                <p className="font-semibold opacity-90">মোবাইল নম্বর</p>
                <input
                  type="text"
                  placeholder="আপনার মোবাইল নম্বর লিখুন"
                  className="py-2.5 text-md w-full px-4 bg-[#eeeeec] rounded-xl"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="w-full flex flex-col gap-y-2">
                <p className="font-semibold opacity-90">পাসওয়ার্ড</p>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="আপনার পাসওয়ার্ড লিখুন"
                    className="py-2.5 text-md w-full px-4 bg-[#eeeeec] rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {showPassword ? (
                    <IoIosUnlock
                      className="absolute text-xl right-4 text-gray-700 top-2 cursor-pointer"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <IoIosLock
                      className="absolute text-xl right-4 text-gray-700 top-2 cursor-pointer"
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>
              </div>
            </div>

            <Link
              to="/auth/forgotPassword"
              className="text-blue-700 underline text-sm font-semibold flex justify-end mt-1"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>

            <AuthSubmitButton
              onClick={handleLogin}
              loading={loading}
              className="mt-8 text-lg font-semibold"
            >
              লগইন করুন
            </AuthSubmitButton>

            <p className="mt-8 text-sm text-center">
              <span className="opacity-70">এখনও অ্যাকাউন্ট নেই?</span>
              <Link
                to="/auth/register"
                className="underline text-blue-700 font-semibold ml-1"
              >
                রেজিস্ট্রেশন করুন
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
