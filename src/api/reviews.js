import axios from "axios";
import { Api } from "./API";

const buildHeaders = (token) =>
  token ? { Authorization: `Bearer ${token}` } : {};

const getReviewListFromResponse = (payload) => {
  const raw =
    payload?.reviews ||
    payload?.userReviews ||
    payload?.data?.reviews ||
    payload?.data?.userReviews ||
    payload?.data ||
    payload?.review ||
    [];

  return Array.isArray(raw) ? raw : [];
};

const dedupeReviewList = (reviews = []) => {
  const seen = new Set();

  return reviews.filter((review, index) => {
    const key = String(
      review?._id ||
        review?.id ||
        `${review?.productId || review?.product?._id || "product"}-${review?.createdAt || index}`,
    );

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const normalizeReview = (review = {}, index = 0) => ({
  id: review._id || review.id || `review-${index}`,
  productId:
    review.productId?._id ||
    review.productId ||
    review.product?._id ||
    review.product ||
    "",
  productName:
    review.productId?.productName ||
    review.productId?.name ||
    review.product?.productName ||
    review.product?.name ||
    review.productName ||
    review.name ||
    "পণ্য",
  name: review.userName || review.name || "ক্রেতা",
  rating: Number(review.rating || 0),
  comment: review.comment || review.feedback || "",
  date: review.createdAt || review.updatedAt || new Date().toISOString(),
});

export const getProductReviews = async ({ productId, token }) => {
  console.log("[reviews] getProductReviews request", {
    productId,
    hasToken: Boolean(token),
  });
  const response = await axios.get(`${Api}/api/v1/reviews/get-review/${productId}`, {
    headers: buildHeaders(token),
  });
  console.log("[reviews] getProductReviews response", response.data);

  return getReviewListFromResponse(response.data).map(normalizeReview);
};

export const createProductReview = async ({ token, payload }) => {
  console.log("[reviews] createProductReview request", {
    payload,
    hasToken: Boolean(token),
  });
  const response = await axios.post(`${Api}/api/v1/reviews/create-review`, payload, {
    headers: {
      "Content-Type": "application/json",
      ...buildHeaders(token),
    },
  });
  console.log("[reviews] createProductReview response", response.data);

  return normalizeReview(
    response.data?.review || response.data?.data?.review || response.data?.data || payload
  );
};

export const getUserReviews = async ({ token, userName, userNames = [] }) => {
  const candidates = Array.from(
    new Set(
      [userName, ...userNames]
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );

  if (!candidates.length) {
    console.log("[reviews] getUserReviews skipped: no user identifiers");
    return [];
  }

  console.log("[reviews] getUserReviews candidates", {
    candidates,
    hasToken: Boolean(token),
  });

  const results = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        console.log("[reviews] getUserReviews request", { candidate });
        const response = await axios.get(
          `${Api}/api/v1/reviews/user-review/${encodeURIComponent(candidate)}`,
          {
            headers: buildHeaders(token),
          },
        );
        console.log("[reviews] getUserReviews response", {
          candidate,
          data: response.data,
        });

        return getReviewListFromResponse(response.data);
      } catch (error) {
        console.error("[reviews] getUserReviews error", {
          candidate,
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
        });
        if (error?.response?.status === 404) {
          return [];
        }

        throw error;
      }
    }),
  );

  return dedupeReviewList(results.flat()).map(normalizeReview);
};
