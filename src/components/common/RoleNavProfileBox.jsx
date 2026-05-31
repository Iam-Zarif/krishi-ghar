/* eslint-disable react/prop-types */
import { useContext } from "react";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { Api } from "../../api/API";
import { UserProfileContext } from "../../providers/getUserProfile/getUserProfile";

const roleLabels = {
  producer: "উৎপাদক",
  supersaler: "সুপার সেলার",
  superseller: "সুপার সেলার",
  wholesaler: "হোলসেলার",
  consumer: "কনজিউমার",
};

const resolveProfileImage = (image = "") => {
  const path = String(image || "").trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${Api}/${path.replace(/^\/+/, "")}`;
};

const RoleNavProfileBox = ({ fallbackName, fallbackRole, profilePath }) => {
  const { userProfile } = useContext(UserProfileContext) || {};
  const role = userProfile?.role || Cookies.get("role") || fallbackRole;
  const avatarSrc = resolveProfileImage(userProfile?.image);
  const displayName = userProfile?.name || fallbackName;

  return (
    <Link
      to={profilePath}
      className="flex items-center gap-3 rounded-xl border border-green/15 bg-white p-3 shadow-sm transition hover:border-green/30 hover:bg-green/5"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green/10 text-green ring-1 ring-green/20">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <FaUserCircle className="h-8 w-8" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-800">
          {displayName}
        </p>
        <p className="mt-0.5 text-xs font-medium text-green">
          {roleLabels[role] || role}
        </p>
      </div>
    </Link>
  );
};

export default RoleNavProfileBox;
