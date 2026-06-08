
import { Link, useLocation } from "react-router-dom";
import {
  FaSeedling,
  FaAppleAlt,
  FaCarrot,
  FaTruck,
  FaSun,
  FaPiggyBank,
  FaCog,
} from "react-icons/fa";
import agri from "../../../../public/photos/consumer/leftnav/agri.svg";
import farmProdducts from "../../../../public/photos/consumer/leftnav/farmProducts.svg";
import rice from "../../../../public/photos/consumer/leftnav/rice.svg";
import ginger from "../../../../public/photos/consumer/leftnav/ginger.svg";
import potato from "../../../../public/photos/consumer/leftnav/potato.svg";
import wheat from "../../../../public/photos/consumer/leftnav/wheat.svg";
import onion from "../../../../public/photos/consumer/leftnav/onion.svg";
import garlic from "../../../../public/photos/consumer/leftnav/garlic.svg";
import paddy from "../../../../public/photos/consumer/leftnav/paddy.svg";
import vegetable from "../../../../public/photos/consumer/leftnav/vegetable.svg";
import downArrow from "../../../../public/photos/auth/down-arrow.png";
import React from "react";
const ConsumerLeftNav = () => {
      const location = useLocation();
        const isAuthRoute = location.pathname.includes("/auth");
      const [isAgricultureOpen, setIsAgricultureOpen] = React.useState(false);
      const [farmProducts, setFarmProducts] = React.useState(false);
      const [fruits, setFruits] = React.useState(false);
      const [agroCare, setAgroCare] = React.useState(false);

      const toggleAgriculture = () => {
        setIsAgricultureOpen(!isAgricultureOpen);
        setFarmProducts(false);
        setFruits(false);
        setAgroCare(false);
      };

      const toogleFarmProducts = () => {
        setFarmProducts(!farmProducts);
        setIsAgricultureOpen(false);
        setFruits(false);
        setAgroCare(false);
      };

      const toogleFruits = () => {
        setFruits(!fruits);
        setIsAgricultureOpen(false);
        setFarmProducts(false);
        setAgroCare(false);
      };

      const toogleAgroCare = () => {
        setAgroCare(!agroCare);
        setIsAgricultureOpen(false);
        setFarmProducts(false);
        setFruits(false);
      };

      const agricultureItems = [
        { to: "/rice", src: rice, label: "চাল" },
        { to: "/ginger", src: ginger, label: "আদা" },
        { to: "/potato", src: potato, label: "আলু" },
        { to: "/wheat", src: wheat, label: "গম" },
        { to: "/onion", src: onion, label: "পেঁয়াজ" },
        { to: "/garlic", src: garlic, label: "রসুন" },
        { to: "/paddy", src: paddy, label: "ধান" },
        { to: "/vegetable", src: vegetable, label: "সবজি" },
      ];

      const farmItems = [
        {
          to: "/paddy",
          label: "ধান",
          icon: <FaSeedling style={{ color: "green" }} />,
        },
        {
          to: "/ginger",
          label: "আদা",
          icon: <FaCarrot style={{ color: "#FF5733" }} />,
        },
        {
          to: "/potato",
          label: "আলু",
          icon: <FaTruck style={{ color: "#8B4513" }} />,
        },
        {
          to: "/chicken",
          label: "মুরগি",
          icon: <FaPiggyBank style={{ color: "#FFC300" }} />,
        },
        {
          to: "/duck",
          label: "হাঁস",
          icon: <FaPiggyBank style={{ color: "#FFC300" }} />,
        },
        {
          to: "/cow",
          label: "গরু",
          icon: <FaSun style={{ color: "#FF8C00" }} />,
        },
        {
          to: "/goat",
          label: "ছাগল",
          icon: <FaSun style={{ color: "#FF8C00" }} />,
        },
        {
          to: "/sheep",
          label: "ভেড়া",
          icon: <FaSun style={{ color: "#FF8C00" }} />,
        },
      ];

      const fruitsItems = [
        {
          to: "/mango",
          label: "আম",
          icon: <FaAppleAlt style={{ color: "#FF9800" }} />,
        },
        {
          to: "/banana",
          label: "কলা",
          icon: <FaAppleAlt style={{ color: "#FFEB3B" }} />,
        },
        {
          to: "/apple",
          label: "আপেল",
          icon: <FaAppleAlt style={{ color: "#FF0000" }} />,
        },
        {
          to: "/pineapple",
          label: "আনারস",
          icon: <FaAppleAlt style={{ color: "#FFD700" }} />,
        },
        {
          to: "/orange",
          label: "কমলা",
          icon: <FaAppleAlt style={{ color: "#FFA500" }} />,
        },
        {
          to: "/papaya",
          label: "পেঁপে",
          icon: <FaAppleAlt style={{ color: "#FF6347" }} />,
        },
        {
          to: "/grapes",
          label: "আঙুর",
          icon: <FaAppleAlt style={{ color: "#6A5ACD" }} />,
        },
        {
          to: "/avocado",
          label: "অ্যাভোকাডো",
          icon: <FaAppleAlt style={{ color: "#008000" }} />,
        },
      ];

      const agroCareItems = [
        {
          to: "/seeds",
          label: "বীজ",
          icon: <FaSeedling style={{ color: "green" }} />,
        },
        {
          to: "/fertilizers",
          label: "সার",
          icon: <FaCog style={{ color: "#008B8B" }} />,
        },
        {
          to: "/pesticides",
          label: "কীটনাশক",
          icon: <FaCog style={{ color: "#FF4500" }} />,
        },
        {
          to: "/tools",
          label: "কৃষি সরঞ্জাম",
          icon: <FaCog style={{ color: "#A9A9A9" }} />,
        },
        {
          to: "/irrigation",
          label: "সেচ ব্যবস্থা",
          icon: <FaCog style={{ color: "#4682B4" }} />,
        },
        {
          to: "/greenhouse",
          label: "গ্রিনহাউস সমাধান",
          icon: <FaCog style={{ color: "#228B22" }} />,
        },
        {
          to: "/beekeeping",
          label: "মৌ চাষ",
          icon: <FaSun style={{ color: "#FFD700" }} />,
        },
        {
          to: "/animal-feed",
          label: "পশুখাদ্য ও সম্পূরক",
          icon: <FaPiggyBank style={{ color: "#DAA520" }} />,
        },
      ];
       if (isAuthRoute) {
         return null;
       }
  return (
    <div className="w-full hidden lg:block lg:max-w-[17rem]">
      <div className="fixed h-full bg-gray-50 shadow-md pt-7 shadow-gray-300 lg:max-w-[17rem] w-full">
        <p className="text-2xl font-semibold text-green mt-16 ml-12">
          ক্যাটাগরি
        </p>
        <div className="w-full border-t border-dashed border-yellow mt-4 opacity-80"></div>

        <div className="mt-1">
          <div>
            <div
              className="flex pl-10 pr-3 py-3 items-center gap-2 w-full hover:bg-gray-200 cursor-pointer justify-between"
              onClick={toggleAgriculture}
            >
              <div className="flex items-center gap-2">
                <img src={agri} className="w-6" loading="lazy" alt="" />
                <p className="text-lg">কৃষি</p>
              </div>
              <img
                src={downArrow}
                className={`w-6 transition-transform duration-300 ${
                  isAgricultureOpen ? "rotate-180" : ""
                }`}
                loading="lazy"
                alt="ড্রপডাউন তীর"
              />
            </div>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isAgricultureOpen ? "max-h-screen" : "max-h-0"
              }`}
            >
              {agricultureItems?.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className={`flex  pl-16 pr-3 py-3 w-full hover:bg-gray-200 cursor-pointer items-center gap-2 ${
                    location.pathname === item.to
                      ? "text-green font-semibold"
                      : ""
                  }`}
                >
                  <img src={item.src} className="w-5" loading="lazy" alt="" />
                  <p>{item.label}</p>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div
              className="flex pl-10 pr-3 py-3 items-center gap-2 w-full hover:bg-gray-200 cursor-pointer justify-between"
              onClick={toogleFarmProducts}
            >
              <div className="flex items-center gap-2">
                <img
                  src={farmProdducts}
                  className="w-6"
                  loading="lazy"
                  alt=""
                />
                <p className="text-lg">খামার পণ্য</p>
              </div>
              <img
                src={downArrow}
                className={`w-6 transition-transform duration-300 ${
                  farmProducts ? "rotate-180" : ""
                }`}
                loading="lazy"
                alt="ড্রপডাউন তীর"
              />
            </div>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                farmProducts ? "max-h-screen" : "max-h-0"
              }`}
            >
              {farmItems?.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className={`flex  pl-16 pr-3 py-3 w-full hover:bg-gray-200 cursor-pointer items-center gap-3 ${
                    location.pathname === item.to
                      ? "text-green font-semibold"
                      : ""
                  }`}
                >
                  {/* Render the icon directly */}
                  <div className="text-lg">{item.icon}</div>
                  <p>{item.label}</p>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div>
              <div
                className="flex pl-10 pr-3 py-3 items-center gap-2 w-full hover:bg-gray-200 cursor-pointer justify-between"
                onClick={toogleFruits}
              >
                <div className="flex items-center gap-2">
                  <img src={agri} className="w-6" loading="lazy" alt="" />
                  <p className="text-lg">ফলমূল</p>
                </div>
                <img
                  src={downArrow}
                  className={`w-6 transition-transform duration-300 ${
                    fruits ? "rotate-180" : ""
                  }`}
                  loading="lazy"
                  alt="ড্রপডাউন তীর"
                />
              </div>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  fruits ? "max-h-screen" : "max-h-0"
                }`}
              >
                {fruitsItems?.map((item, index) => (
                  <Link
                    key={index}
                    to={item.to}
                    className={`flex  pl-16 pr-3 py-3 w-full hover:bg-gray-200 cursor-pointer items-center gap-2 ${
                      location.pathname === item.to
                        ? "text-green font-semibold"
                        : ""
                    }`}
                  >
                    <div className="text-lg">{item.icon}</div>
                    <p>{item.label}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div
                className="flex pl-10 pr-3 py-3 items-center gap-2 w-full hover:bg-gray-200 cursor-pointer justify-between"
                onClick={toogleAgroCare}
              >
                <div className="flex items-center gap-2">
                  <img src={agri} className="w-6" loading="lazy" alt="" />
                  <p className="text-lg">অ্যাগ্রোকেয়ার</p>
                </div>
                <img
                  src={downArrow}
                  className={`w-6 transition-transform duration-300 ${
                    agroCare ? "rotate-180" : ""
                  }`}
                  loading="lazy"
                  alt="ড্রপডাউন তীর"
                />
              </div>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  agroCare ? "max-h-screen" : "max-h-0"
                }`}
              >
                {agroCareItems?.map((item, index) => (
                  <Link
                    key={index}
                    to={item.to}
                    className={`flex  pl-16 pr-3 py-3 w-full hover:bg-gray-200 cursor-pointer items-center gap-2 ${
                      location.pathname === item.to
                        ? "text-green font-semibold"
                        : ""
                    }`}
                  >
                    <div className="text-lg">{item.icon}</div>
                    <p>{item.label}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsumerLeftNav
