import { useContext, useEffect, useState } from "react";
import "keen-slider/keen-slider.min.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Api } from "../../api/API";
import { ApiPaths } from "../../api/apiPaths";
import axios from "axios";
import { UserProfileContext } from "../../providers/getUserProfile/getUserProfile";
import Categories from "./Categories";
import Hero from "./Hero";
import TodaysBestDeal from "./TodaysBestDeal";
import LatestProducts from "./LatestProducts";

const slug = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const withId = (doc = {}) => ({
  ...doc,
  id: doc._id ?? doc.id,
});

const normalizeRetailPost = (post = {}) => {
  const product = post.product || {};
  const productId = product._id || product.id;
  const imagePath = product.image ? String(product.image).replace(/^\/+/, "") : "";

  return {
    ...withId(post),
    postId: post._id,
    id: productId || post._id,
    productName: product.productName || product.name || "পণ্য",
    image: imagePath ? `${Api}/${imagePath}` : product.image,
    price: Number(post.sellingPricePerKg ?? product.price ?? 0),
    originalPrice: Number(post.basePricePerKg ?? product.price ?? 0),
    category: {
      name:
        typeof product.category === "string"
          ? "রিটেইল"
          : product.category?.name || "রিটেইল",
    },
    rating: Number(product.rating || 4.5),
    sold: Number(post.soldQuantity ?? 0),
    linkTo: productId ? `/products/${productId}` : `/products/${post._id}`,
  };
};

const buildHeroSlides = (products = [], max = 4) => {
  const scored = products
    .map((p) => {
      const hasBanner = Boolean(p.bannerImage);
      const hasImage = Boolean(p.image);
      const featuredScore = p.isFeatured ? 2 : 0;
      const bannerScore = hasBanner ? 1 : 0;
      const timeScore = new Date(p.updatedAt || p.createdAt || 0).getTime();
      const score =
        featuredScore * 1_000_000_000 + bannerScore * 1_000_000 + timeScore;
      return { p: withId(p), score, hasBanner, hasImage };
    })
    .filter(({ hasBanner, hasImage }) => hasBanner || hasImage);

  if (!scored.length) return [];

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, max).map(({ p }) => {
    const price = Number(p.price ?? p.discountPrice ?? 0);
    const title =
      p.bannerTitle || p.productName || p.name || "নির্বাচিত পণ্য";
    const descCandidate =
      p.bannerSubtitle ||
      p.shortDescription ||
      p.description ||
      (price
        ? `এখন থেকে ৳${price}`
        : p.category?.name
        ? `${p.category?.name} দেখুন`
        : "এখনই কিনুন");

    return {
      image: p.bannerImage || p.image,
      title,
      description: String(descCandidate).slice(0, 140),
      link: `/products/${p.id}`,
    };
  });
};

const Feed = () => {
  const navigate = useNavigate();
  const { userProfile } = useContext(UserProfileContext);
  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userProfile) {
      navigate("/auth/login");
      return;
    }
  };


  const [heroSlides, setHeroSlides] = useState([]);

  const [categories, setCategories] = useState([]);
  const [bestDeals, setBestDeals] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);

  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProds, setLoadingProds] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setError("");
        setLoadingCats(true);
        setLoadingProds(true);

        const token = localStorage.getItem("token");
        const auth = token ? { Authorization: `Bearer ${token}` } : {};

        const [catsRes, postsRes] = await Promise.all([
          axios.get(`${Api}/api/v1/products/categories`, { headers: auth }),
          axios.get(`${Api}${ApiPaths.consumer.retailPosts}`, { headers: auth }),
        ]);

        if (ignore) return;

        const catsArr = Array.isArray(catsRes.data?.categories)
          ? catsRes.data.categories
          : [];
        const postsArr = Array.isArray(postsRes.data?.posts)
          ? postsRes.data.posts
          : [];

        const normalizedCats = catsArr.map((c) => withId(c));
        const normalizedPosts = postsArr.map((post) => normalizeRetailPost(post));

        setCategories(
          normalizedCats.map((c) => ({
            id: c.id,
            label: c.name,
            to: `/${slug(c.name)}`,
            icon: c.icon,
          }))
        );

        const slides = buildHeroSlides(normalizedPosts, 4);
        setHeroSlides(slides);
        const deals = normalizedPosts
          .map((p) => {
            const selling = Number(p.price ?? p.discountPrice ?? 0);
            const origFromApi = Number(p.originalPrice ?? 0);
            const originalPrice =
              origFromApi && origFromApi > selling
                ? origFromApi
                : selling
                ? Math.round(selling * 1.15)
                : 0;

            return {
              id: p.id,
              image: p.image,
              name: p.productName || p.name,
              category: p.category?.name || "বিভাগ",
              originalPrice,
              discountPrice: selling || 0,
              status: String(p.status || "").toLowerCase(),
              rating: Number(p.rating || p.averageRating || 4.5) || 4.5,
            };
          })
          .filter(
            (p) =>
              p.discountPrice &&
              p.originalPrice &&
              p.originalPrice > p.discountPrice
          )
          .slice(0, 20);

        setBestDeals(deals);

        const latest = [...normalizedPosts].sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt || 0) -
            new Date(a.updatedAt || a.createdAt || 0)
        );
        setLatestProducts(latest);
      } catch (e) {
        setError(
          e.response?.data?.message || e.message || "কিছু ভুল হয়েছে"
        );
      } finally {
        setLoadingCats(false);
        setLoadingProds(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const location = useLocation();
  if (!(location.pathname === "/" || location.pathname.startsWith("/consumer")))
    return null;

 
 

  return (
    <div className="pt-2 pb-20 bg-[#ffffde2e]">
      {error && (
        <div className="mx-auto mb-4 w-full max-w-5xl px-4">
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}
      <Hero slides={heroSlides} loading={loadingProds} />
      <Categories loadingCats={loadingCats} />
      <TodaysBestDeal bestDeals={bestDeals} loadingProds={loadingProds} />
      <LatestProducts
        latestProducts={latestProducts}
        loadingProds={loadingProds}
        handleWishlist={handleWishlist}
      />
      
    </div>
  );
};

export default Feed;
