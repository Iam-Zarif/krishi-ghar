import axios from "axios";
import { Api } from "../../../../../api/API";
import { ApiPaths } from "../../../../../api/apiPaths";

export const addProductEndpoint = `${Api}/api/v1/producer/add-product`;

export function normalizeCategories(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.categories)) return raw.categories;
  if (Array.isArray(raw?.data?.categories)) return raw.data.categories;
  if (Array.isArray(raw?.result)) return raw.result;
  if (Array.isArray(raw?.payload)) return raw.payload;
  if (Array.isArray(raw?.data?.items)) return raw.data.items;
  return [];
}

export async function fetchProducerCategories(token) {
  const { data } = await axios.get(`${Api}${ApiPaths.producer.categories}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return normalizeCategories(data);
}

export function createProducerProduct(payload, token) {
  const body = {
    productName: payload.productName,
    quantity: Number(payload.quantity),
    unit: payload.unit,
    priceType: payload.priceType || "per_unit",
    price: Number(payload.price),
    description: payload.description,
    category: payload.category,
    image: payload.image || "",
    secondaryImages: payload.secondaryImages || [],
    addToSellPost: payload.addToSellPost || "no",
  };

  if (payload.customUnitNote) {
    body.customUnitNote = payload.customUnitNote;
  }

  return axios.post(addProductEndpoint, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
