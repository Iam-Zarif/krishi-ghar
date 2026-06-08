import axios from "axios";
import { Api } from "./API";
import { ApiPaths } from "./apiPaths";

const ROLE_LABELS = {
  wholesaler: "পাইকার",
  supersaler: "সুপার সেলার",
  superseller: "সুপার সেলার",
};

const ROLE_API_ALIASES = {
  superseller: "supersaler",
};

const isAbsoluteUrl = (value = "") => /^https?:\/\//i.test(String(value));
const isMongoId = (value = "") => /^[a-f\d]{24}$/i.test(String(value).trim());

export const normalizeApiRole = (role = "") => {
  const normalized = String(role || "").trim().toLowerCase();
  return ROLE_API_ALIASES[normalized] || normalized;
};

const authHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

export const resolveResellerProductImage = (value = "") => {
  const path = String(value || "").trim();
  if (!path) return "";
  if (isAbsoluteUrl(path)) return path;
  return `${Api}/${path.replace(/^\/+/, "")}`;
};

export const normalizeResellerProduct = (product = {}) => {
  const categoryString = typeof product?.category === "string" ? product.category : "";
  const categoryName =
    product?.category?.name ||
    product?.categoryName ||
    (categoryString && !isMongoId(categoryString) ? categoryString : "");

  return {
    ...product,
    _id: product?._id || product?.id,
    image: resolveResellerProductImage(product?.image),
    secondaryImages: Array.isArray(product?.secondaryImages)
      ? product.secondaryImages.map(resolveResellerProductImage)
      : [],
    categoryName,
    quantity: product?.quantity ?? product?.stock,
    status: String(product?.status || "").toLowerCase(),
    isSelling: Boolean(product?.isSelling),
    priceNumber: Number(product?.price || 0) || 0,
    previousPriceNumber: Number(product?.previousPrice || 0) || 0,
  };
};

const isProducerOwnedProduct = (product = {}) => {
  const producer = product?.producer;
  if (!producer || typeof producer !== "object") return true;
  return String(producer?.role || "").toLowerCase() === "producer";
};

export const normalizeResellerOwnedProduct = (post = {}) => {
  const sourceProduct =
    post?.product ||
    post?.productId ||
    post?.producerProduct ||
    post?.item ||
    {};
  const product =
    sourceProduct && typeof sourceProduct === "object" ? sourceProduct : {};
  const detailProductId =
    post?.detailProductId ||
    product?._id ||
    product?.id ||
    (typeof post?.productId === "string" ? post.productId : "");
  const merged = {
    ...product,
    ...post,
    _id: post?._id || post?.id || product?._id || product?.id,
    detailProductId,
    productName:
      post?.productName ||
      post?.title ||
      product?.productName ||
      product?.name ||
      "নামহীন পণ্য",
    image: post?.image || product?.image,
    secondaryImages: post?.secondaryImages || product?.secondaryImages,
    category: post?.category || product?.category,
    categoryName: post?.categoryName || product?.categoryName,
    producer: post?.producer || product?.producer,
    quantity: post?.quantity ?? product?.quantity ?? product?.stock,
    unit: post?.unit || product?.unit,
    price:
      post?.price ??
      post?.sellingPricePerKg ??
      post?.pricePerKg ??
      post?.sellingPrice ??
      post?.wholesalePrice ??
      post?.retailPrice ??
      product?.sellingPricePerKg ??
      product?.pricePerKg ??
      product?.price,
    previousPrice: post?.previousPrice ?? product?.previousPrice,
    status: post?.status || product?.status || "published",
    isSelling: Boolean(post?.isSelling || product?.isSelling),
  };

  return normalizeResellerProduct(merged);
};

const getOrderItemProduct = (item = {}) =>
  item?.productId && typeof item.productId === "object" ? item.productId : {};

const normalizeSupersalerOrderProduct = ({ order = {}, item = {} }) => {
  const product = getOrderItemProduct(item);
  const productId =
    product?._id ||
    product?.id ||
    (typeof item?.productId === "string" ? item.productId : "");

  return normalizeResellerOwnedProduct({
    ...product,
    ...item,
    _id: item?._id || productId || `${order?._id || order?.id}-${item?.productName || "item"}`,
    detailProductId: productId || item?._id || "",
    productName: item?.productName || product?.productName || product?.name,
    image: item?.productImage || product?.image,
    secondaryImages: product?.secondaryImages,
    category: product?.category,
    producer: product?.producer,
    quantity: item?.quantity ?? product?.quantity,
    unit: item?.unit || product?.unit || "kg",
    price: item?.price ?? product?.price,
    previousPrice: product?.previousPrice,
    status: order?.adminActionStatus || order?.orderStatus || product?.status || "pending",
    createdAt: order?.createdAt || product?.createdAt,
    updatedAt: order?.updatedAt || product?.updatedAt,
    orderId: order?.orderId,
    orderMongoId: order?._id || order?.id,
    paymentStatus: order?.paymentStatus,
    orderStatus: order?.orderStatus,
    adminActionStatus: order?.adminActionStatus,
    purchasedAt: order?.createdAt,
    isSelling: false,
  });
};

const normalizeSupersalerOrderProducts = (orders = [], { dedupe = false } = {}) => {
  const normalized = [];

  orders.forEach((order) => {
    const items = Array.isArray(order?.items) ? order.items : [];
    items.forEach((item) => {
      normalized.push(normalizeSupersalerOrderProduct({ order, item }));
    });
  });

  if (!dedupe) return normalized;

  const productsById = new Map();
  normalized.forEach((product) => {
    const key = String(product.detailProductId || product._id);
    const existing = productsById.get(key);

    productsById.set(key, {
      ...product,
      ...existing,
      quantity:
        (Number(existing?.quantity || 0) || 0) +
        (Number(product?.quantity || 0) || 0),
      price: existing?.price ?? product?.price,
    });
  });

  return Array.from(productsById.values()).map(normalizeResellerProduct);
};

const normalizeSupersalerOrderSummary = (order = {}) => {
  const items = Array.isArray(order?.items) ? order.items : [];
  const firstItem = items[0] || {};
  const firstProduct = getOrderItemProduct(firstItem);
  const firstProductId =
    firstProduct?._id ||
    firstProduct?.id ||
    (typeof firstItem?.productId === "string" ? firstItem.productId : "");
  const extraItemCount = Math.max(0, items.length - 1);
  const productName =
    firstItem?.productName ||
    firstProduct?.productName ||
    firstProduct?.name ||
    "নামহীন পণ্য";

  return normalizeResellerOwnedProduct({
    ...firstProduct,
    _id: order?._id || order?.id,
    detailProductId: firstProductId || firstItem?._id || order?._id || order?.id,
    productName: extraItemCount ? `${productName} +${extraItemCount}` : productName,
    image: firstItem?.productImage || firstProduct?.image,
    secondaryImages: firstProduct?.secondaryImages,
    category: firstProduct?.category,
    producer: firstProduct?.producer,
    quantity: order?.totalItems || items.length || firstItem?.quantity || 0,
    unit: "টি পণ্য",
    price: order?.totalAmount ?? order?.subtotal ?? firstItem?.totalPrice ?? firstItem?.price,
    previousPrice: firstProduct?.previousPrice,
    status: order?.adminActionStatus || order?.orderStatus || "pending",
    createdAt: order?.createdAt,
    updatedAt: order?.updatedAt,
    orderId: order?.orderId,
    orderMongoId: order?._id || order?.id,
    paymentStatus: order?.paymentStatus,
    orderStatus: order?.orderStatus,
    adminActionStatus: order?.adminActionStatus,
    purchasedAt: order?.createdAt,
    isSelling: false,
  });
};

const normalizeSupersalerOrderSummaries = (orders = []) =>
  orders.map(normalizeSupersalerOrderSummary);

export const getApprovedProductsForRole = async ({
  role,
  token,
  signal,
}) => {
  const apiRole = normalizeApiRole(role);
  const endpoint =
    apiRole === "wholesaler"
      ? ApiPaths.wholesaler.approvedProducts
      : ApiPaths.supersaler.approvedProducts;

  const res = await axios.get(`${Api}${endpoint}`, {
    signal,
    headers: authHeaders(token),
  });

  const rawProducts = Array.isArray(res.data?.products) ? res.data.products : [];
  return rawProducts.map(normalizeResellerProduct);
};

export const getProducerApprovedProductsForSupersaler = async ({
  role,
  token,
  signal,
}) => {
  const products = await getApprovedProductsForRole({ role, token, signal });
  return products.filter(isProducerOwnedProduct);
};

export const getPurchasedProductsForSupersaler = async ({ token, signal }) => {
  const res = await axios.get(`${Api}${ApiPaths.supersaler.ownProducts}`, {
    signal,
    headers: authHeaders(token),
  });

  const orders = Array.isArray(res.data?.orders) ? res.data.orders : [];
  const activeOrders = orders.filter(
    (order) => String(order?.orderStatus || "").toLowerCase() !== "cancelled"
  );

  return normalizeSupersalerOrderProducts(activeOrders, { dedupe: true });
};

export const getPurchasedProductsForWholesaler = async ({ token, signal }) => {
  const res = await axios.get(`${Api}${ApiPaths.order.list}?limit=100`, {
    signal,
    headers: authHeaders(token),
  });

  const orders = Array.isArray(res.data?.data?.orders)
    ? res.data.data.orders
    : [];
  const activeOrders = orders.filter(
    (order) => String(order?.orderStatus || "").toLowerCase() !== "cancelled"
  );

  return normalizeSupersalerOrderProducts(activeOrders, { dedupe: true });
};

export const createSellPostForRole = async ({ role, token, payload }) => {
  const apiRole = normalizeApiRole(role);
  const price = Number(payload?.sellingPricePerKg || payload?.price || 0);
  const quantity = Number(payload?.quantity || 0);

  if (apiRole === "wholesaler") {
    const res = await axios.put(
      `${Api}${ApiPaths.wholesaler.sellProduct(payload.productId)}`,
      {
        quantity,
        wholesalePrice: price,
        sellType: payload?.sellType || "bulk",
        unit: payload?.unit || "kg",
      },
      { headers: authHeaders(token) }
    );

    return res.data;
  }

  const res = await axios.post(
    `${Api}${ApiPaths.supersaler.createSellPost}`,
    {
      productId: payload.productId,
      sellType: payload?.sellType || "bulk",
      quantity,
      unit: payload?.unit || "kg",
      sellingPricePerKg: price,
    },
    { headers: authHeaders(token) }
  );

  return res.data;
};

export const getBulkPostsForRole = async ({ role, token, signal }) => {
  const apiRole = normalizeApiRole(role);
  const endpoint =
    apiRole === "wholesaler"
      ? ApiPaths.wholesaler.bulkPosts
      : ApiPaths.supersaler.bulkPosts;

  const res = await axios.get(`${Api}${endpoint}`, {
    signal,
    headers: authHeaders(token),
  });

  const rawPosts = Array.isArray(res.data?.posts) ? res.data.posts : [];
  return rawPosts.map(normalizeResellerOwnedProduct);
};

export const getOwnProductsForSupersaler = async ({ token, signal }) => {
  const res = await axios.get(`${Api}${ApiPaths.supersaler.ownProducts}`, {
    signal,
    headers: authHeaders(token),
  });

  if (Array.isArray(res.data?.orders)) {
    return normalizeSupersalerOrderSummaries(res.data.orders);
  }

  const rawProductsList =
    (Array.isArray(res.data?.products) && res.data.products) ||
    (Array.isArray(res.data?.product) && res.data.product) ||
    (Array.isArray(res.data?.data) && res.data.data) ||
    (Array.isArray(res.data?.data?.products) && res.data.data.products) ||
    [];
  const rawProducts =
    rawProductsList.length || !res.data?.product ? rawProductsList : [res.data.product];

  return rawProducts.map(normalizeResellerOwnedProduct);
};

export const getConsumerRetailPosts = async ({ token, district, thana, signal }) => {
  const search = new URLSearchParams();
  if (district) search.set("district", district);
  if (thana) search.set("thana", thana);

  const suffix = search.toString() ? `?${search.toString()}` : "";
  const res = await axios.get(`${Api}${ApiPaths.consumer.retailPosts}${suffix}`, {
    signal,
    headers: authHeaders(token),
  });

  return Array.isArray(res.data?.posts) ? res.data.posts : [];
};

export const resellerRoleLabel = (role) =>
  ROLE_LABELS[role] || ROLE_LABELS[normalizeApiRole(role)] || "বিক্রেতা";
