import { useContext, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoMenu, IoClose, IoChevronDown } from "react-icons/io5";
import { CiLogout } from "react-icons/ci";
import axios from "axios";
import { Api } from "../../../api/API";
import { UserProfileContext } from "../../../providers/getUserProfile/getUserProfile";
import { useLanguage } from "../../../Provider/LanguageContext/LanguageContext";
import logo from "../../../../public/photos/auth/brandLogo.svg";
import bd from "../../../../public/photos/navbar/bd.png";
import eng from "../../../../public/photos/navbar/eng.png";
import downarrow from "../../../../public/photos/auth/down-arrow.png";
import SearchBar from "./SearchBar";
import { MenuItems } from "../MenuItems";
import { getRoleDashboardPath } from "../../../utils/roleDashboardPath";

const MobileMenu = () => {
  const { userProfile, profileLoading, logout } = useContext(UserProfileContext);
  const { language } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [cats, setCats] = useState([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const [catsError, setCatsError] = useState("");
  const menuRef = useRef(null);

  const toggleLanguageDropdown = () => setLanguageDropdown((prev) => !prev);

  const roleHomePath = getRoleDashboardPath(userProfile?.role);

  const slug = (s) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const fetchCategories = async () => {
    if (cats.length || catsLoading) return;
    try {
      setCatsError("");
      setCatsLoading(true);
      const token = localStorage.getItem("token");
      const auth = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${Api}/api/v1/products/categories`, {
        headers: auth,
      });
      const raw = Array.isArray(res.data?.categories)
        ? res.data.categories
        : [];
      setCats(
        raw.map((c) => ({
          id: c._id || c.id,
          name: c.name,
          icon: c.icon,
          to: `/${slug(c.name)}`,
        }))
      );
    } catch (e) {
      setCatsError(
        e.response?.data?.message || e.message || "ক্যাটাগরি লোড করা যায়নি"
      );
    } finally {
      setCatsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutsideMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    if (menuOpen)
      document.addEventListener("mousedown", handleClickOutsideMenu);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideMenu);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <>
      <button
        className="lg:hidden -mr-1 cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="মেনু"
      >
        {menuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
      </button>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-[40]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div
        ref={menuRef}
        className={`lg:hidden z-[45] fixed top-0 left-0 h-full bg-white shadow-md transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } w-[85vw] max-w-sm overflow-y-auto pb-24`}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} className="w-8" alt="ব্র্যান্ড লোগো" />
            <span className="font-semibold">মেনু</span>
          </div>
          <button onClick={() => setMenuOpen(false)} aria-label="বন্ধ করুন">
            <IoClose size={22} />
          </button>
        </div>

        {profileLoading && (
          <div className="px-4 pt-3 pb-2">
            <div className="flex gap-3 animate-pulse">
              <div className="h-9 w-24 rounded-lg bg-gray-200" />
              <div className="h-9 w-24 rounded-lg bg-gray-200" />
            </div>
          </div>
        )}

        {!profileLoading && !userProfile && (
          <div className="px-4 pt-3 pb-2">
            <div className="flex gap-3">
              <Link
                to="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 rounded-lg bg-green text-white text-sm font-medium"
              >
                লগইন
              </Link>
              <Link
                to="/auth/register"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 rounded-lg border text-sm font-medium"
              >
                রেজিস্টার
              </Link>
            </div>
          </div>
        )}

        {!profileLoading && userProfile && (
          <div className="px-4 pt-3 pb-1">
            <div
              className="border rounded-lg inline-flex gap-2 bg-gray-50 items-center border-gray-400 px-2 py-1"
              onClick={toggleLanguageDropdown}
            >
              <img
                src={language === "en" ? eng : bd}
                className="w-5"
                alt="পতাকা"
              />
              <p className="text-sm">
                {language === "en" ? "ইংরেজি" : "বাংলা"}
              </p>
              <img src={downarrow} className="w-4" alt="" />
            </div>
          </div>
        )}

        <div className="px-3 pt-3">
          <SearchBar mobile menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        </div>

        <div className="px-3 mt-2">
          <Link
            to={roleHomePath}
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-3 rounded-lg hover:bg-gray-100"
          >
            হোম
          </Link>

          <details className="group">
            <summary className="list-none flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-100">
              <span>পণ্যসমূহ</span>
              <IoChevronDown className="transition group-open:rotate-180" />
            </summary>
            <div className="pl-3 pr-2 pb-2">
              {catsLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 bg-gray-100 rounded mb-2 animate-pulse"
                  />
                ))}
              {!catsLoading && catsError && (
                <div className="text-sm text-red-600 px-3 py-2">
                  {catsError}
                </div>
              )}
              {!catsLoading &&
                !catsError &&
                cats.map((c) => (
                  <Link
                    key={c.id}
                    to={c.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
                  >
                    {c.icon ? (
                      <img
                        src={c.icon}
                        alt={c.name}
                        className="w-6 h-6 rounded object-contain bg-white border"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://placehold.co/24x24?text=%20";
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded bg-gray-100 border" />
                    )}
                    <span className="text-sm">{c.name}</span>
                  </Link>
                ))}
              <Link
                to="/products"
                onClick={() => setMenuOpen(false)}
                className="mt-1 block px-3 py-2 text-sm font-semibold text-green"
              >
                সব পণ্য দেখুন
              </Link>
            </div>
          </details>

          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-3 rounded-lg hover:bg-gray-100"
          >
            যোগাযোগ করুন
          </Link>
          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-3 rounded-lg hover:bg-gray-100"
          >
            আমাদের সম্পর্কে
          </Link>
        </div>

        {!profileLoading && userProfile && (
          <div className="border-t mt-2">
            {MenuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex px-4 items-center gap-3 py-4 rounded-lg hover:bg-gray-100 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                <img src={item.icon} className="w-5" alt={item.name} />
                <p className="text-[16px]">{item.name}</p>
              </Link>
            ))}
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
    </>
  );
};

export default MobileMenu;
