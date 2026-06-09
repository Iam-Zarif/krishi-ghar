import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FaCircleUser } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import { AiOutlineUser } from "react-icons/ai";
import { BiSupport } from "react-icons/bi";
import { CiHeart, CiLogout } from "react-icons/ci";
import { useShopStateCounts } from "../../../hooks/useShopStateCounts";
import { UserProfileContext } from "../../../providers/getUserProfile/getUserProfile";
import { Api } from "../../../api/API";
import ChatSystem from "../../../components/common/ChatSystem";

const resolveProfileImage = (value = "") => {
  const path = String(value || "").trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${Api}/${path.replace(/^\/+/, "")}`;
};

const UserActions = ({ profileLoading, setMenuOpen }) => {
  const navigate = useNavigate();
  const { userProfile, logout } = useContext(UserProfileContext);
  const [profileToogle, setprofileToogle] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [profileImageFailed, setProfileImageFailed] = useState(false);
  const { cartCount, wishlistCount } = useShopStateCounts(userProfile);

  const handleProfileToogle = () => setprofileToogle(!profileToogle);

  useEffect(() => {
    setProfileImageFailed(false);
  }, [userProfile?.image]);

  const isLoggedIn = !!userProfile;
  const isProducer = userProfile?.role === "producer";
  const isConsumer = userProfile?.role === "consumer";
  const profilePath =
    userProfile?.role === "producer"
      ? "/dashboard/producerProfile"
      : userProfile?.role === "wholesaler"
        ? "/dashboard/wholesaler/profile"
        : userProfile?.role === "supersaler"
          ? "/dashboard/superseller/profile"
          : userProfile?.role === "consumer"
            ? "/consumer"
            : "/";

  const wishlistPath =
    userProfile?.role === "consumer"
      ? "/consumer/wishlist"
      : "/wishlist";

  const cartPath =
    userProfile?.role === "wholesaler"
      ? "/dashboard/wholesaler/cart"
      : userProfile?.role === "consumer"
      ? "/consumer/cart"
      : userProfile?.role === "supersaler"
      ? "/dashboard/superseller/cart"
      : "/cart";

  const handleLogout = () => {
    setprofileToogle(false);
    if (setMenuOpen) setMenuOpen(false);
    logout();
    navigate("/auth/login");
  };

  if (profileLoading) {
    return (
      <div className="hidden lg:flex items-center gap-3 animate-pulse">
        <span className="h-8 w-8 rounded-full bg-gray-200" />
        <span className="h-8 w-8 rounded-full bg-gray-200" />
        <span className="h-9 w-9 rounded-full bg-gray-200" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link
        to="/auth/login"
        className="hidden lg:inline-flex items-center cursor-pointer rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md"
      >
        লগইন করুন
      </Link>
    );
  }

  return (
    <>
      {!isProducer && (
        <>
          {isConsumer && (
            <Link to={wishlistPath} className="relative hidden lg:block">
              <CiHeart className="text-3xl cursor-pointer" />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[11px] leading-[18px] text-center"
                  aria-label={`ইচ্ছাতালিকার আইটেম: ${wishlistCount}`}
                >
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>
          )}

          <Link to={cartPath} className="relative hidden lg:block">
            <FaShoppingCart
              className="text-2xl cursor-pointer text-gray-700"
              aria-label="কার্ট"
            />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-green text-white text-[11px] leading-[18px] text-center"
                aria-label={`কার্টের আইটেম: ${cartCount}`}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </>
      )}

      <div className="relative">
        {userProfile?.image && !profileImageFailed ? (
          <img
            src={resolveProfileImage(userProfile.image)}
            alt="প্রোফাইল"
            className="w-9 h-9 rounded-full object-cover cursor-pointer border-2 border-gray-200"
            onClick={handleProfileToogle}
            onError={() => setProfileImageFailed(true)}
          />
        ) : (
          <FaCircleUser
            onClick={handleProfileToogle}
            className="text-3xl text-neutral-500 cursor-pointer"
          />
        )}
        {profileToogle && (
          <div className="bg-white lg:w-[10rem] rounded-lg absolute w-full right-0 top-14 shadow-sm shadow-gray-400 flex flex-col">
            <p className="text-center py-2 bg-green text-white rounded-t-lg">
              {userProfile?.role === "producer"
                ? "উৎপাদক"
                : userProfile?.role === "wholesaler"
                  ? "পাইকার"
                  : userProfile?.role === "supersaler"
                    ? "সুপার সেলার"
                    : userProfile?.role === "consumer"
                      ? "ক্রেতা"
                      : "ক্রেতা"}
            </p>

            <Link
              to={profilePath}
              className="flex items-center gap-3 font-light px-4 py-1.5 hover:bg-gray-600 hover:text-white"
            >
              <AiOutlineUser />
              <span>প্রোফাইল</span>
            </Link>

            {isConsumer && (
              <div
                onClick={() => {
                  setIsChatOpen(true);
                  setprofileToogle(false);
                }}
                className="flex cursor-pointer flex-nowrap text-nowrap items-center gap-3 font-light px-4 py-1.5 hover:bg-gray-600 hover:text-white"
              >
                <BiSupport />
                <span>সাপোর্ট নিন</span>
              </div>
            )}

            <div className="mt-1 bg-gray-200 w-full h-[1px]" />

            <div
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-3 font-light px-4 py-2 text-red-700 hover:bg-red-700 rounded-b-lg hover:text-white"
            >
              <CiLogout />
              <span>লগআউট</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat System */}
      <ChatSystem
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialSubject="সাধারণ সহায়তা"
        category="general"
      />
    </>
  );
};

export default UserActions;

UserActions.propTypes = {
  profileLoading: PropTypes.bool,
  setMenuOpen: PropTypes.func,
};
