import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../../public/photos/auth/brandLogo.svg";
import bd from "../../../public/photos/navbar/bd.png";
import eng from "../../../public/photos/navbar/eng.png";
import cart from "../../../public/photos/navbar/cart.png";
import search from "../../../public/photos/navbar/search.png";

import downarrow from "../../../public/photos/auth/down-arrow.png";

import {
  IoMenu,
  IoClose,
  IoChevronDown,
} from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import { useLanguage } from "../../Provider/LanguageContext/LanguageContext";
import { UserProfileContext } from "../../providers/getUserProfile/getUserProfile";
import { CiHeart, CiLogout } from "react-icons/ci";
import axios from "axios";
import { Api } from "../../api/API";
import { MenuItems } from "./MenuItems";
import { FaCircleUser } from "react-icons/fa6";
import { AiOutlineUser } from "react-icons/ai";
import { BiSupport } from "react-icons/bi";
import {
  normalizeSearchTerm,
  readRecentSearches,
  removeRecentSearch,
  saveRecentSearch,
} from "../../utils/searchHistory";
import { getRoleDashboardPath } from "../../utils/roleDashboardPath";
import { useShopStateCounts } from "../../hooks/useShopStateCounts";

const Navbar = () => {
  const navigate = useNavigate();
  const { userProfile, profileLoading, logout } = useContext(UserProfileContext);
  console.log(userProfile)
  const [profileToogle, setprofileToogle] = useState(false);
  const handleProfileToogle = () => setprofileToogle(!profileToogle);

  const { language } = useLanguage();
  const location = useLocation();

  const isAuthRoute =
    location.pathname.includes("/auth") ||
    location.pathname.includes("/waitForAdminApproval");

  const languageRef = useRef(null);
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const toggleLanguageDropdown = () => setLanguageDropdown((prev) => !prev);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (languageRef.current && !languageRef.current.contains(e.target))
        setLanguageDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
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

  const [cats, setCats] = useState([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const [catsError, setCatsError] = useState("");

  const { cartCount, wishlistCount } = useShopStateCounts(userProfile);
  const [searchTerm, setSearchTerm] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const searchFetchedRef = useRef(false);

  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const productsMenuRef = useRef(null);
  const enterTimer = useRef(null);
  const leaveTimer = useRef(null);

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
    setRecentSearches(readRecentSearches());
  }, []);

  useEffect(() => {
    const handleSearchOutside = (e) => {
      const insideDesktop =
        desktopSearchRef.current && desktopSearchRef.current.contains(e.target);
      const insideMobile =
        mobileSearchRef.current && mobileSearchRef.current.contains(e.target);

      if (!insideDesktop && !insideMobile) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleSearchOutside);
    return () => document.removeEventListener("mousedown", handleSearchOutside);
  }, []);

  const fetchSearchProducts = async () => {
    if (searchFetchedRef.current || searchLoading) return;

    try {
      setSearchLoading(true);
      const token = localStorage.getItem("token");
      const auth = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${Api}/api/v1/products`, {
        headers: auth,
      });
      const arr = Array.isArray(res.data?.products) ? res.data.products : [];
      setAllProducts(arr);
      searchFetchedRef.current = true;
    } catch {
      setAllProducts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const buildSearchEntry = (product, fallbackTerm = "") => ({
    id: product?._id || product?.id || normalizeSearchTerm(fallbackTerm).toLowerCase(),
    term:
      normalizeSearchTerm(product?.productName || product?.name || fallbackTerm) ||
      normalizeSearchTerm(fallbackTerm),
    name: product?.productName || product?.name || normalizeSearchTerm(fallbackTerm),
    image: product?.image || "",
  });

  const handleSearchSubmit = (value, product) => {
    const term = normalizeSearchTerm(value || product?.productName || product?.name || "");
    if (!term) return;

    const nextRecent = saveRecentSearch(buildSearchEntry(product, term));
    setRecentSearches(nextRecent);
    setSearchOpen(false);
    setMenuOpen(false);
    navigate(`/products?search=${encodeURIComponent(term)}`);
  };

  const handleRecentDelete = (e, idOrTerm) => {
    e.preventDefault();
    e.stopPropagation();
    setRecentSearches(removeRecentSearch(idOrTerm));
  };

  const handleLogout = () => {
    setprofileToogle(false);
    setMenuOpen(false);
    setSearchOpen(false);
    setShowProductsMenu(false);
    setLanguageDropdown(false);
    setWishlistCount(0);
    setCartCount(0);
    logout();
    navigate("/auth/login");
  };

  useEffect(() => {
    if (!userProfile) {
      setprofileToogle(false);
      setMenuOpen(false);
    }
  }, [userProfile]);

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

  if (isAuthRoute) return null;

  const isLoggedIn = !!userProfile;
  const isProducer = userProfile?.role === "producer";
  const isConsumer = userProfile?.role === "consumer";
  const roleHomePath = getRoleDashboardPath(userProfile?.role);
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
  const normalizedSearch = normalizeSearchTerm(searchTerm).toLowerCase();

  const suggestions = normalizedSearch
    ? allProducts
        .filter((product) => {
          const name = String(product?.productName || product?.name || "").toLowerCase();
          const category = String(product?.category?.name || "").toLowerCase();
          return name.includes(normalizedSearch) || category.includes(normalizedSearch);
        })
        .slice(0, 6)
    : [];

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

  const SearchDropdown = ({ mobile = false }) => (
    <div
      className={`absolute left-0 right-0 top-[calc(100%+0.6rem)] rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-200/70 overflow-hidden ${
        mobile ? "z-[60]" : "z-[55]"
      }`}
    >
      {searchLoading && (
        <div className="px-4 py-4 text-sm text-gray-500">খোঁজা হচ্ছে...</div>
      )}

      {!searchLoading && normalizedSearch && suggestions.length > 0 && (
        <div className="py-2">
          <div className="px-4 pb-2 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
            মিলে যাওয়া পণ্য
          </div>
          {suggestions.map((product) => {
            const id = product?._id || product?.id;
            return (
              <div
                key={id || product?.productName || product?.name}
                onClick={() => handleSearchSubmit(searchTerm, product)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSearchSubmit(searchTerm, product);
                  }
                }}
                role="button"
                tabIndex={0}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f7f8f2] transition-colors cursor-pointer"
              >
                <img
                  src={product?.image || "https://via.placeholder.com/64x64?text=%20"}
                  alt={product?.productName || product?.name || "পণ্য"}
                  className="h-12 w-12 rounded-xl border object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/64x64?text=%20";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {product?.productName || product?.name || "নাম দেওয়া হয়নি"}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {product?.category?.name || "বিভাগ"}
                  </p>
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="সংরক্ষিত অনুসন্ধান সরান"
                  onClick={(e) =>
                    handleRecentDelete(
                      e,
                      product?._id || product?.id || product?.productName || product?.name
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleRecentDelete(
                        e,
                        product?._id || product?.id || product?.productName || product?.name
                      );
                    }
                  }}
                  className="shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <IoClose size={18} />
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!searchLoading && !normalizedSearch && recentSearches.length > 0 && (
        <div className="py-2">
          <div className="px-4 pb-2 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
            সাম্প্রতিক অনুসন্ধান
          </div>
          {recentSearches.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSearchSubmit(item.term, item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleSearchSubmit(item.term, item);
                }
              }}
              role="button"
              tabIndex={0}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f7f8f2] transition-colors cursor-pointer"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name || item.term}
                  className="h-12 w-12 rounded-xl border object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/64x64?text=%20";
                  }}
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-[#f7f8f2] text-gray-500">
                  <IoSearchOutline size={18} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {item.name || item.term}
                </p>
                <p className="truncate text-xs text-gray-500">{item.term}</p>
              </div>
              <span
                role="button"
                tabIndex={0}
                aria-label="সাম্প্রতিক অনুসন্ধান সরান"
                onClick={(e) => handleRecentDelete(e, item.id || item.term)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleRecentDelete(e, item.id || item.term);
                  }
                }}
                className="shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <IoClose size={18} />
              </span>
            </div>
          ))}
        </div>
      )}

      {!searchLoading && normalizedSearch && suggestions.length === 0 && (
        <div className="px-4 py-5 text-sm text-gray-500">
          কোনও মিল পাওয়া যায়নি। এন্টার চাপলে এই শব্দ দিয়ে সব পণ্য দেখা যাবে।
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="fixed top-0 py-2 lg:py-3 shadow-sm shadow-gray-300 z-[50] bg-white w-full">
        <div className="flex max-w-7xl mx-auto items-center justify-between w-full px-4 lg:px-0">
          <div className="flex items-center gap-3 lg:gap-6">
            <Link to={roleHomePath} className="flex items-center gap-2">
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
          </div>
          <div ref={desktopSearchRef} className="relative hidden lg:block">
            <img
              src={search}
              className="w-5 absolute top-3 opacity-60 left-3"
              alt=""
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit(searchTerm);
              }}
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => {
                  setSearchOpen(true);
                  fetchSearchProducts();
                }}
                className="lg:w-[28rem] pl-10 pr-6 focus:outline-green rounded-xl border border-gray-400 py-2"
                placeholder="অনুসন্ধান করুন..."
              />
            </form>
            {searchOpen && <SearchDropdown />}
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            {profileLoading ? (
              <div className="hidden lg:flex items-center gap-3 animate-pulse">
                <span className="h-8 w-8 rounded-full bg-gray-200" />
                <span className="h-8 w-8 rounded-full bg-gray-200" />
                <span className="h-9 w-9 rounded-full bg-gray-200" />
              </div>
            ) : isLoggedIn ? (
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
                      <img
                        src={cart}
                        className="w-6 cursor-pointer"
                        alt="কার্ট"
                        loading="lazy"
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
                  <FaCircleUser
                    onClick={handleProfileToogle}
                    className="text-3xl text-neutral-500 cursor-pointer"
                  />
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

                      <div className="flex cursor-pointer flex-nowrap text-nowrap items-center gap-3 font-light px-4 py-1.5 hover:bg-gray-600 hover:text-white">
                        <BiSupport />
                        <span>সাপোর্ট নিন</span>
                      </div>

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
              </>
            ) : (
              <Link
                to="/auth/login"
                className="hidden lg:inline-flex items-center cursor-pointer rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md"
              >
                লগইন করুন
              </Link>
            )}

            <button
              className="lg:hidden -mr-1 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="মেনু"
            >
              {menuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
            </button>
          </div>
        </div>
      </div>

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
          <div className="relative" ref={mobileSearchRef}>
            <img
              src={search}
              className="w-5 absolute top-3 opacity-60 left-3"
              alt=""
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit(searchTerm);
              }}
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => {
                  setSearchOpen(true);
                  fetchSearchProducts();
                }}
                className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 focus:outline-green"
                placeholder="পণ্য খুঁজুন"
              />
            </form>
            {searchOpen && <SearchDropdown mobile />}
          </div>
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

export default Navbar;
