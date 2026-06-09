import { Api } from "../../../../api/API";

const priceNum = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const resolveImage = (value) => {
  const path = String(value || "").trim();
  if (!path) return "https://placehold.co/600x450?text=না+ছবি";
  if (/^https?:\/\//i.test(path)) return path;
  return `${Api}/${path.replace(/^\/+/, "")}`;
};

export const NormalizeRow = (row) => {
  const product =
    row && typeof row.productId === "object" && row.productId !== null
      ? row.productId
      : null;
  const productId = String(product?._id || "");

  if (!productId) return null;

  return {
    cartId: String(row._id || productId),
    productId,
    name: String(product?.productName || product?.name || row.productName || "Product"),
    image: resolveImage(product?.image || row.image),
    description: String(product?.description || row.description || ""),
    category:
      product?.category?.name ||
      product?.categoryName ||
      (typeof product?.category === "string" ? product.category : "") ||
      "",
    price: priceNum(
      product?.price ?? product?.discountPrice ?? product?.previousPrice ?? row.price,
    ),
    quantity: Number(row.quantity) || 1,
    stockQuantity: Number(product?.quantity) || 0,
    addedAt: row.createdAt || product?.createdAt || 0,
  };
};
