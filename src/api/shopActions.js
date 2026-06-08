import axios from "axios";
import { Api } from "./API";
import { ApiPaths } from "./apiPaths";
import { emitShopStateChange } from "../utils/shopSignals";

const getAuthHeaders = (token) =>
  token ? { Authorization: `Bearer ${token}` } : {};

const getCartAddEndpoint = (role) => {
  const normalizedRole = String(role || "").toLowerCase();
  if (normalizedRole === "supersaler" || normalizedRole === "superseller") {
    return `${Api}${ApiPaths.supersaler.addToCart}`;
  }
  return `${Api}${ApiPaths.cart.add}`;
};

export const addProductToCart = async ({
  productId,
  quantity = 1,
  price,
  token,
  role,
}) => {
  const payload = { productId, quantity };
  const numericPrice = Number(price);
  if (Number.isFinite(numericPrice) && numericPrice > 0) {
    payload.price = numericPrice;
  }

  const response = await axios.post(
    getCartAddEndpoint(role),
    payload,
    { headers: getAuthHeaders(token) }
  );
  emitShopStateChange({ cartDelta: Math.max(1, Number(quantity) || 1) });
  return response;
};

export const addProductToWishlist = async ({ productId, token }) => {
  const response = await axios.post(
    `${Api}${ApiPaths.wishlist.add}`,
    { productId },
    { headers: getAuthHeaders(token) }
  );
  emitShopStateChange({ wishlistDelta: 1 });
  return response;
};
