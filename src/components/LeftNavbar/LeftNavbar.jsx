import { Link, useLocation } from "react-router-dom";
import {
  FaUserCircle,
  FaClipboardList,
  FaPlusCircle,
  FaChevronRight,
  FaStar,
} from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import RoleNavProfileBox from "../common/RoleNavProfileBox";

const LeftNavbar = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: "প্রোফাইল",
      path: "/dashboard/producerProfile",
      icon: FaUserCircle,
    },
    {
      name: "বিক্রয় পোস্ট",
      path: "/dashboard/producerSellPost",
      icon: FaClipboardList,
    },
    {
      name: "আমার রিভিউ",
      path: "/dashboard/producerMyReviews",
      icon: FaStar,
    },
    {
      name: "পণ্য যোগ করুন",
      path: "/dashboard/producerAddProduct",
      icon: FaPlusCircle,
    },
  ];

  return (
    <div className="hidden lg:block max-w-[260px] w-full">
      <div className="fixed top-16 flex h-[calc(100vh-4rem)] max-w-[280px] w-full flex-col overflow-y-auto bg-gray-50 shadow-md shadow-gray-200 items-start producer">
        <div className="w-full px-4 pt-4">
          <Link
            to="/dashboard/producerAllProducts"
            className={`flex px-4 rounded-lg cursor-pointer duration-300 py-4 transition-all items-center justify-between w-full 
              ${
                location.pathname === "/dashboard/producerAllProducts"
                  ? "text-green bg-gray-100 font-semibold"
                  : "hover:bg-gray-100"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <MdSpaceDashboard
                className={`w-5 h-5 ${
                  location.pathname === "/dashboard/producerAllProducts"
                    ? "text-green"
                    : ""
                }`}
              />
              <p className="text-[16px] font-semibold">আমার পণ্যসমূহ</p>
            </div>
            <FaChevronRight
              className={`w-4 h-4 ${
                location.pathname === "/dashboard/producerAllProducts"
                  ? "text-green"
                  : ""
              }`}
            />
          </Link>

          <div className="w-full h-[1px] bg-gray-300 mt-3 border-dashed"></div>
        </div>

        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={index}
              to={item.path}
              className={`flex text-[16px] px-4 rounded-lg cursor-pointer duration-300 py-4 transition-all items-center justify-between w-full 
                ${
                  isActive
                    ? "text-green font-semibold bg-gray-100"
                    : "hover:bg-gray-100"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-green" : ""}`}
                />
                {item.name}
              </div>

              <FaChevronRight
                className={`w-4 h-4 ${isActive ? "text-green" : ""}`}
              />
            </Link>
          );
        })}

        <div className="mt-auto w-full px-4 pb-4 pt-4">
          <RoleNavProfileBox
            fallbackName="Producer"
            fallbackRole="producer"
            profilePath="/dashboard/producerProfile"
          />
        </div>
      </div>
    </div>
  );
};

export default LeftNavbar;
