import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import AuthSubmitButton from "../components/AuthSubmitButton";
import { UserProfileContext } from "../../../providers/getUserProfile/getUserProfile";
import { getRoleDashboardPath } from "../../../utils/roleDashboardPath";

const BRAND_LOGO_SRC = "/photos/auth/brandLogo.svg";

const ForgotPassword = () => {
  const { userProfile } = useContext(UserProfileContext);
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (userProfile?.role) {
      const dashboardPath = getRoleDashboardPath(userProfile.role.toLowerCase());
      navigate(dashboardPath || "/", { replace: true });
    }
  }, [userProfile, navigate]);


  const handleOtpSend = async () => {
    if (!phone) {
      toast.error("অনুগ্রহ করে আপনার ফোন নম্বর লিখুন");
      return;
    }

    try {
      setSendingOtp(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setOtpSent(true);
      toast.success("ওটিপি সফলভাবে পাঠানো হয়েছে");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      toast.error("সব ঘর পূরণ করা আবশ্যক");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("পাসওয়ার্ড মিলছে না");
      return;
    }

    try {
      setResettingPassword(true);
      await new Promise((resolve) => setTimeout(resolve, 700));
      toast.success("পাসওয়ার্ড সফলভাবে রিসেট হয়েছে");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="flex adminLoginGradient w-full pb-16 lg:pb-0 items-center lg:h-screen justify-center lg:mt-0 mt-8">
      <Toaster />
      <div className="w-full mx-auto">
        <img src={BRAND_LOGO_SRC} className="w-28 mx-auto" alt="ব্র্যান্ড লোগো" />
        <p className="text-center text-2xl opacity-80 font-semibold mt-5">
          পাসওয়ার্ড ভুলে গেছেন
        </p>

        <div className="mt-12 px-4 text-sm lg:px-0 w-full max-w-md mx-auto flex flex-col items-center gap-y-4">
          <div className="w-full flex flex-col gap-y-2">
            <p className="font-semibold">
              ফোন <span className="text-2xl text-red-600">*</span>
            </p>
            <input
              type="text"
              placeholder="আপনার ফোন লিখুন"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="py-2.5 text-md block w-full px-4 bg-[#eeeeec] rounded-xl"
            />
          </div>

          <div className="w-full flex flex-col gap-y-2">
            <p className="font-semibold">
              ওটিপি <span className="text-2xl text-red-600">*</span>
            </p>
            <div className="grid grid-cols-5 gap-2 ">
              <input
                type="text"
                placeholder="ওটিপি লিখুন"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="py-2.5 col-span-3 text-md w-full px-4 bg-[#eeeeec] rounded-xl"
              />
              <button
                className="bg-yellow col-span-2 px-4 py-2 rounded-xl text-sm cursor-pointer"
                onClick={handleOtpSend}
                disabled={sendingOtp}
              >
                {sendingOtp ? "পাঠানো হচ্ছে..." : otpSent ? "আবার ওটিপি পাঠান" : "ওটিপি নিন"}
              </button>
            </div>
          </div>

          <div className="w-full flex flex-col gap-y-2">
            <p className="font-semibold">
              নতুন পাসওয়ার্ড <span className="text-2xl text-red-600">*</span>
            </p>
            <input
              type="password"
              placeholder="নতুন পাসওয়ার্ড লিখুন"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="py-2.5 text-md block w-full px-4 bg-[#eeeeec] rounded-xl"
            />
          </div>

          <div className="w-full flex flex-col gap-y-2">
            <p className="font-semibold">
              পাসওয়ার্ড নিশ্চিত করুন <span className="text-2xl text-red-600">*</span>
            </p>
            <input
              type="password"
              placeholder="নতুন পাসওয়ার্ড নিশ্চিত করুন"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="py-2.5 text-md block w-full px-4 bg-[#eeeeec] rounded-xl"
            />
          </div>

          <AuthSubmitButton
            onClick={handleSubmit}
            loading={resettingPassword}
            className="mt-0"
          >
            পাসওয়ার্ড রিসেট করুন
          </AuthSubmitButton>

          <p className="text-center text-sm text-gray-600">
            আগে থেকেই অ্যাকাউন্ট আছে?{" "}
            <Link
              to="/auth/login"
              className="text-blue-700 font-semibold underline"
            >
              লগইন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
