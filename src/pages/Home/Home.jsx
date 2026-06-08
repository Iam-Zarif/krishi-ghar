import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Feed from "../../components/Feed/Feed";
import { seoDefaultImage, usePageSeo } from "../../utils/seo";
import { UserProfileContext } from "../../providers/getUserProfile/getUserProfile";
import {
  getRoleDashboardPath,
  isDashboardOnlyRole,
} from "../../utils/roleDashboardPath";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, profileLoading } = useContext(UserProfileContext);

  useEffect(() => {
    if (profileLoading || !isDashboardOnlyRole(userProfile?.role)) return;
    navigate(getRoleDashboardPath(userProfile.role), { replace: true });
  }, [navigate, profileLoading, userProfile?.role]);

  usePageSeo({
    title: "কৃষিঘর - বাংলাদেশের সেরা কৃষি ও কৃষিপণ্য প্ল্যাটফর্ম",
    description:
      "কৃষিঘর বাংলাদেশের কৃষক, পাইকার ও ক্রেতাদের জন্য নির্ভরযোগ্য কৃষি মার্কেটপ্লেস। তাজা পণ্য, কৃষি সরঞ্জাম ও নিরাপদ বাণিজ্য এক প্ল্যাটফর্মে।",
    keywords:
      "কৃষিঘর, বাংলাদেশ কৃষি মার্কেটপ্লেস, কৃষিপণ্য, কৃষক বাজার, তাজা কৃষিপণ্য বাংলাদেশ",
    path: location.pathname,
    image: seoDefaultImage,
  });

   const isAuthRoute =
     location.pathname.includes("/auth") ||
     location.pathname.includes("/waitForAdminApproval");
  return (
    <>
      <div className={`${isAuthRoute ? "" : ""}`}>
        <Feed />
      </div>
    </>
  );
};

export default Home;
