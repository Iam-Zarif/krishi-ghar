import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoChevronDown } from "react-icons/io5";
import { UserProfileContext } from "../../providers/getUserProfile/getUserProfile";
import axios from "axios";
import { Api } from "../../api/API";
import { getRoleDashboardPath } from "../../utils/roleDashboardPath";
import BrandLogo from "./components/BrandLogo";
import SearchBar from "./components/SearchBar";
import UserActions from "./components/UserActions";
import MobileMenu from "./components/MobileMenu";

const Navbar = () => {
  const { userProfile, profileLoading } = useContext(UserProfileContext);
  const location = useLocation();

  const isAuthRoute =
    location.pathname.includes("/auth") ||
    location.pathname.includes("/waitForAdminApproval");

  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const productsMenuRef = useRef(null);
  const enterTimer = useRef(null);
  const leaveTimer = useRef(null);

  const [cats, setCats] = useState([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const [catsError, setCatsError] = useState("");

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
    const onDown = (e) => {
      if (
        showProductsMenu &&
        productsMenuRef.current &&
        !productsMenuRef.current.contains(e.target)
      )
        setShowProductsMenu(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showProductsMenu]);

  useEffect(() => {
    fetchCategories();
  }, []);

  if (isAuthRoute) return null;

  const ProductsMenu = () => (
    <div
      ref={productsMenuRef}
      className="absolute top-full left-0 z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white py-3 shadow-lg shadow-gray-200/70"
    >
      {catsLoading && (
        <div className="px-4 py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded mb-2 animate-pulse" />
          ))}
        </div>
      )}
      {!catsLoading && catsError && (
        <div className="px-4 py-2 text-sm text-red-600">{catsError}</div>
      )}
      {!catsLoading && !catsError && (
        <>
          {cats.map((c) => (
            <Link
              key={c.id}
              to={c.to}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
              onClick={() => setShowProductsMenu(false)}
            >
              {c.icon ? (
                <img
                  src={c.icon}
                  alt={c.name}
                  className="w-5 h-5 rounded object-contain bg-white border"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/20x20?text=%20";
                  }}
                />
              ) : (
                <div className="w-5 h-5 rounded bg-gray-100 border" />
              )}
              <span>{c.name}</span>
            </Link>
          ))}
          <div className="border-t mt-2 pt-2">
            <Link
              to="/products"
              className="block px-4 py-2 text-sm font-semibold text-green hover:bg-gray-50"
              onClick={() => setShowProductsMenu(false)}
            >
              সব পণ্য দেখুন
            </Link>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <div className="fixed top-0 py-2 lg:py-3 shadow-sm shadow-gray-300 z-[50] bg-white w-full">
        <div className="flex max-w-7xl mx-auto items-center justify-between w-full px-4 lg:px-0">
          <div className="flex items-center gap-3 lg:gap-6">
            <BrandLogo />
          </div>

          <SearchBar />

          <div className="flex items-center gap-3 lg:gap-6">
            <UserActions profileLoading={profileLoading} />
            <MobileMenu />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
