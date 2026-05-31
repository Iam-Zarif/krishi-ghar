import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Api } from "../api/API";
import { ApiPaths } from "../api/apiPaths";
import { SHOP_STATE_EVENT } from "../utils/shopSignals";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || Cookies.get("token");
};

const resolveCartEndpoint = (role) => {
  const normalizedRole = String(role || "").toLowerCase();
  if (normalizedRole === "supersaler" || normalizedRole === "superseller") {
    return `${Api}${ApiPaths.supersaler.cart}`;
  }
  return `${Api}${ApiPaths.cart.list}`;
};

const parseCartResponse = (response) => {
  const data = response?.data || {};
  const cartPayload = data?.cart || data?.data || data;
  const items =
    (Array.isArray(cartPayload?.items) && cartPayload.items) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.items) && data.items) ||
    [];

  return (
    Number(cartPayload?.pagination?.totalItems) ||
    Number(data?.data?.pagination?.totalItems) ||
    Number(data?.totalItems) ||
    items.length ||
    0
  );
};

const parseWishlistResponse = (response) => {
  const data = response?.data || {};
  const wishlistPayload = data?.data || data;
  const items =
    (Array.isArray(wishlistPayload?.items) && wishlistPayload.items) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.data) && data.data) ||
    [];

  return (
    Number(wishlistPayload?.pagination?.totalItems) ||
    Number(data?.totalItems) ||
    items.length ||
    0
  );
};

export const useShopStateCounts = (userProfile) => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const token = getToken();

  const fetchCartCount = useCallback(async () => {
    if (!userProfile || !token) {
      setCartCount(0);
      return;
    }

    try {
      const endpoint = resolveCartEndpoint(userProfile.role);
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartCount(parseCartResponse(res));
    } catch {
      setCartCount(0);
    }
  }, [userProfile, token]);

  const fetchWishlistCount = useCallback(async () => {
    if (!userProfile || userProfile?.role !== "consumer" || !token) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await axios.get(`${Api}${ApiPaths.wishlist.list}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistCount(parseWishlistResponse(res));
    } catch {
      setWishlistCount(0);
    }
  }, [userProfile, token]);

  useEffect(() => {
    if (!userProfile) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    fetchCartCount();
    fetchWishlistCount();
  }, [userProfile, fetchCartCount, fetchWishlistCount]);

  useEffect(() => {
    const handleShopStateChange = async (event) => {
      const wishlistDelta = Number(event?.detail?.wishlistDelta || 0);
      const cartDelta = Number(event?.detail?.cartDelta || 0);

      if (wishlistDelta) {
        setWishlistCount((prev) => Math.max(0, prev + wishlistDelta));
      }
      if (cartDelta) {
        setCartCount((prev) => Math.max(0, prev + cartDelta));
      }

      await Promise.all([fetchCartCount(), fetchWishlistCount()]);
    };

    window.addEventListener(SHOP_STATE_EVENT, handleShopStateChange);
    return () => window.removeEventListener(SHOP_STATE_EVENT, handleShopStateChange);
  }, [fetchCartCount, fetchWishlistCount]);

  return { cartCount, wishlistCount, refreshShopCounts: async () => {
      await Promise.all([fetchCartCount(), fetchWishlistCount()]);
    },
  };
};
