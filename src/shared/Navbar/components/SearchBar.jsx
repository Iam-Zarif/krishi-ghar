import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline, IoClose } from "react-icons/io5";
import axios from "axios";
import { Api } from "../../../api/API";
import search from "../../../../public/photos/navbar/search.png";
import {
  normalizeSearchTerm,
  readRecentSearches,
  removeRecentSearch,
  saveRecentSearch,
} from "../../../utils/searchHistory";

const SearchBar = ({ mobile = false, menuOpen, setMenuOpen }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

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

  const fetchSearchProducts = async () => {
    if (allProducts.length) return;
    try {
      setSearchLoading(true);
      const res = await axios.get(`${Api}/api/v1/products/`);
      const data = res.data?.data || res.data || [];
      setAllProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Search fetch error:", e);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) ||
        (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target))
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (term, product = null) => {
    if (!term.trim()) return;
    const normalized = normalizeSearchTerm(term);
    saveRecentSearch(normalized, product);
    setRecentSearches(readRecentSearches());
    setSearchTerm("");
    setSearchOpen(false);
    if (setMenuOpen) setMenuOpen(false);
    navigate(`/products?search=${encodeURIComponent(normalized)}`);
  };

  const handleRecentDelete = (e, idOrTerm) => {
    e.preventDefault();
    e.stopPropagation();
    setRecentSearches(removeRecentSearch(idOrTerm));
  };

  const SearchDropdown = () => (
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

  const searchRef = mobile ? mobileSearchRef : desktopSearchRef;

  return (
    <div ref={searchRef} className={`relative ${mobile ? "" : "hidden lg:block"}`}>
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
          className={`${mobile ? "w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4" : "lg:w-[28rem] pl-10 pr-6 focus:outline-green rounded-xl border border-gray-400 py-2"}`}
          placeholder={mobile ? "পণ্য খুঁজুন" : "অনুসন্ধান করুন..."}
        />
      </form>
      {searchOpen && <SearchDropdown />}
    </div>
  );
};

export default SearchBar;
