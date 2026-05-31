import axios from "axios";
import { Api } from "./API";

const buildHeaders = (token) =>
  token ? { Authorization: `Bearer ${token}` } : {};

const normalizeFaq = (faq = {}, index = 0) => ({
  id: faq._id || faq.id || `faq-${index}`,
  question: faq.question || "",
  answer: faq.answer || "",
  askedBy: faq.userName || faq.askedBy || faq.name || "ব্যবহারকারী",
  askedAt: faq.createdAt || faq.updatedAt || new Date().toISOString(),
});

export const getFaqs = async () => {
  const response = await axios.get(`${Api}/api/v1/faq/`);
  const raw = response.data?.data || response.data?.faqs || response.data?.faq || [];

  return Array.isArray(raw) ? raw.map(normalizeFaq) : [];
};

export const createFaq = async ({ token, payload }) => {
  const response = await axios.post(`${Api}/api/v1/faq/create`, payload, {
    headers: {
      "Content-Type": "application/json",
      ...buildHeaders(token),
    },
  });

  return normalizeFaq(response.data?.data || response.data?.faq || payload);
};
