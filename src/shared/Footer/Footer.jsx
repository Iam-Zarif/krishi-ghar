import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import logo from "../../../public/photos/auth/brandLogo.svg";

const Footer = () => {
  const location = useLocation();
  if (
    location.pathname.startsWith("/auth") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/waitForAdminApproval")
  ) {
    return null;
  }

  return (
    <footer className="bg-[#fefce8] text-gray-800 pt-10 pb-3 px-6 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:flex-row sm:flex-wrap sm:justify-between">
        
        <div className="flex-1 min-w-full sm:min-w-[200px] flex flex-col items-center sm:items-start">
          <div className="flex justify-center lg:justify-start items-center gap-2">
            <img
              src={logo}
              className="w-8 lg:w-12"
              alt="কৃষিঘর লোগো"
              loading="lazy"
            />
            <p className="uppercase text-xl lg:text-2xl font-semibold">
              <span className="text-green">Krishi</span>{" "}
              <span className="text-yellow">Ghar</span>
            </p>
          </div>
          <p className="text-sm mt-2 text-gray-600 text-center sm:text-left">
            নির্ভরযোগ্য কৃষি সরঞ্জাম, পণ্য ও সেবা — এখন আপনার হাতের নাগালে।
          </p>
          <div className="flex justify-center sm:justify-start gap-4 mt-4 text-lg">
            <a
              href="#"
              className="text-green-700 hover:text-yellow-500 transition-colors duration-300"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              className="text-green-700 hover:text-yellow-500 transition-colors duration-300"
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              className="text-green-700 hover:text-yellow-500 transition-colors duration-300"
            >
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex-1 min-w-full sm:min-w-[150px] flex flex-col items-center sm:items-start">
          <h4 className="text-lg font-semibold mb-3">দ্রুত লিংক</h4>
          <ul className="space-y-2 text-sm text-center sm:text-left">
            {[
              { name: "হোম", path: "/" },
              { name: "দোকান", path: "/shop" },
              { name: "আমাদের সম্পর্কে", path: "/aboutus" },
              { name: "যোগাযোগ", path: "/contact" },
            ].map((link, i) => (
              <li key={i}>
                <Link
                  to={link.path}
                  className="text-gray-800 hover:text-yellow-500 transition-colors duration-300"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 min-w-full sm:min-w-[150px] flex flex-col items-center sm:items-start">
          <h4 className="text-lg font-semibold mb-3">বিভাগসমূহ</h4>
          <ul className="space-y-2 text-sm text-center sm:text-left">
            {[
              { name: "ধান", path: "/category/rice" },
              { name: "আলু", path: "/category/potato" },
              { name: "আদা", path: "/category/ginger" },
              { name: "রসুন", path: "/category/garlic" },
            ].map((cat, i) => (
              <li key={i}>
                <Link
                  to={cat.path}
                  className="text-gray-800 hover:text-yellow-500 transition-colors duration-300"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

       
        <div className="flex-1 min-w-full sm:min-w-[200px] flex flex-col items-center sm:items-start">
          <h4 className="text-lg font-semibold mb-3">যোগাযোগ করুন</h4>
          <ul className="space-y-3 text-sm text-center sm:text-left">
            <li className="flex items-center gap-2 justify-center sm:justify-start">
              <FaPhoneAlt className="text-green-700" />
              <span>+880 1933-329901</span>
            </li>
            <li className="flex items-center gap-2 justify-center sm:justify-start">
              <FaEnvelope className="text-green-700" />
              <span>support@krishighar.com</span>
            </li>
            <li className="flex items-center gap-2 justify-center sm:justify-start">
              <FaMapMarkerAlt className="text-green-700" />
              <span>ঢাকা, বাংলাদেশ</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t pt-3 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} কৃষিঘর। সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
};

export default Footer;
