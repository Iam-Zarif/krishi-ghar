import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { createProductReview, getProductReviews } from "../../../api/reviews";

const normalizeFallbackReviews = (reviews = []) =>
  Array.isArray(reviews)
    ? reviews.map((review, index) => ({
        id: review._id || review.id || `fallback-review-${index}`,
        name: review.userName || review.name || "ক্রেতা",
        rating: Number(review.rating || 0),
        comment: review.comment || review.feedback || "",
        date:
          review.createdAt || review.updatedAt || new Date().toISOString(),
      }))
    : [];

const resolveDisplayName = (userProfile) =>
  userProfile?.name ||
  userProfile?.fullName ||
  userProfile?.userName ||
  userProfile?.username ||
  userProfile?.consumerName ||
  "";

const resolveUserName = (userProfile, manualName) => {
  const typed = String(manualName || "").trim();
  if (typed) return typed;

  return (
    userProfile?.username ||
    userProfile?.userName ||
    userProfile?.name ||
    userProfile?.fullName ||
    userProfile?.consumerName ||
    "ক্রেতা"
  );
};

export const useProductReviews = ({
  productId,
  token,
  userProfile,
  initialReviews = [],
  onAuthRequired,
}) => {
  const initialReviewsKey = useMemo(
    () => JSON.stringify(initialReviews || []),
    [initialReviews],
  );
  const normalizedInitialReviews = useMemo(
    () => normalizeFallbackReviews(initialReviews),
    [initialReviewsKey],
  );
  const displayName = useMemo(
    () => resolveDisplayName(userProfile),
    [
      userProfile?.name,
      userProfile?.fullName,
      userProfile?.userName,
      userProfile?.username,
      userProfile?.consumerName,
    ],
  );
  const [reviews, setReviews] = useState(() =>
    normalizedInitialReviews
  );
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 0,
    comment: "",
  });

  const fetchReviews = useCallback(async () => {
    if (!productId) {
      setLoadingReviews(false);
      setReviews([]);
      return;
    }

    try {
      setLoadingReviews(true);
      setReviewsError("");
      const nextReviews = await getProductReviews({ productId, token });
      setReviews(nextReviews);
    } catch (error) {
      setReviews(normalizedInitialReviews);
      setReviewsError(
        error.response?.data?.message ||
          "রিভিউ লোড করা যায়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setLoadingReviews(false);
    }
  }, [normalizedInitialReviews, productId, token]);

  useEffect(() => {
    setReviewForm({
      name: displayName,
      rating: 0,
      comment: "",
    });
    setReviews(normalizedInitialReviews);
  }, [displayName, initialReviewsKey, normalizedInitialReviews, productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = useCallback(async () => {
    if (!token) {
      toast.error("রিভিউ দিতে লগইন করুন");
      onAuthRequired?.();
      return;
    }

    if (!reviewForm.rating || !String(reviewForm.comment || "").trim()) {
      toast.error("রেটিং এবং মতামত লিখুন");
      return;
    }

    const payload = {
      userName: resolveUserName(userProfile, reviewForm.name),
      name: resolveDisplayName(userProfile) || String(reviewForm.name || "").trim(),
      userId: userProfile?._id || userProfile?.id,
      rating: Number(reviewForm.rating),
      comment: String(reviewForm.comment).trim(),
      productId,
    };

    try {
      setSubmittingReview(true);
      setReviewsError("");
      await toast.promise(
        createProductReview({ token, payload }),
        {
          loading: "রিভিউ জমা হচ্ছে…",
          success: "রিভিউ সফলভাবে যোগ হয়েছে",
          error: (error) =>
            error.response?.data?.message || "রিভিউ জমা দেওয়া যায়নি",
        }
      );
      setReviewForm({
        name: displayName,
        rating: 0,
        comment: "",
      });
      await fetchReviews();
    } finally {
      setSubmittingReview(false);
    }
  }, [displayName, fetchReviews, onAuthRequired, productId, reviewForm, token, userProfile]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return "0.0";

    return (
      reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
      reviews.length
    ).toFixed(1);
  }, [reviews]);

  return {
    reviews,
    loadingReviews,
    reviewsError,
    reviewForm,
    setReviewForm,
    submittingReview,
    submitReview,
    retryReviews: fetchReviews,
    averageRating,
  };
};
