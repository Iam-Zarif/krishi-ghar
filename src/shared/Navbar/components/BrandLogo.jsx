import { useContext } from "react";
import { Link } from "react-router-dom";
import logo from "../../../../public/photos/auth/brandLogo.svg";
import { UserProfileContext } from "../../../providers/getUserProfile/getUserProfile";
import { getRoleDashboardPath } from "../../../utils/roleDashboardPath";

const BrandLogo = () => {
  const { userProfile } = useContext(UserProfileContext);
  const targetPath = getRoleDashboardPath(userProfile?.role);

  return (
    <Link to={targetPath} className="flex items-center gap-2">
      <img
        src={logo}
        className="w-8 lg:w-12"
        alt="ব্র্যান্ড লোগো"
        loading="lazy"
      />
      <p className="uppercase text-lg lg:text-xl font-semibold">
        <span className="text-green">Krishi</span>{" "}
        <span className="text-yellow">Ghar</span>
      </p>
    </Link>
  );
};

export default BrandLogo;
