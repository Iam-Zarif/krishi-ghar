import { FiRefreshCw } from "react-icons/fi";
import { Rating } from "@smastrom/react-rating";
import ReviewsPanelSkeleton from "./ReviewsPanelSkeleton";

// eslint-disable-next-line react/prop-types
const ProductReviewsPanel = ({
  averageRating,
  reviews,
  loadingReviews,
  reviewsError,
  reviewForm,
  setReviewForm,
  submittingReview,
  submitReview,
  retryReviews,
}) => {
  if (loadingReviews) {
    return <ReviewsPanelSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-green/5 p-3">
        <span className="text-sm text-gray-700">গড় রেটিং</span>
        <span className="text-xl font-bold text-green">{averageRating}</span>
        <Rating
          value={Number(averageRating)}
          readOnly
          style={{ maxWidth: 110 }}
        />
      </div>

      {reviewsError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>{reviewsError}</span>
          <button
            type="button"
            onClick={retryReviews}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-red-700 hover:bg-red-50 cursor-pointer"
          >
            <FiRefreshCw />
            আবার চেষ্টা করুন
          </button>
        </div>
      )}

      <div className="grid gap-3">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="rounded-xl border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-gray-800">{review.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(review.date).toLocaleDateString("bn-BD")}
                </p>
              </div>
              <div className="mt-1">
                <Rating
                  value={Number(review.rating || 0)}
                  readOnly
                  style={{ maxWidth: 100 }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed bg-white p-6 text-center text-sm text-gray-500">
            এখনো কোনও রিভিউ নেই। প্রথম রিভিউটি দিন।
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-gray-50 p-4">
        <p className="font-semibold text-gray-800">আপনার রিভিউ দিন</p>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <input
            value={reviewForm.name}
            onChange={(e) =>
              setReviewForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="আপনার নাম (ঐচ্ছিক)"
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
          />
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() =>
                  setReviewForm((prev) => ({ ...prev, rating: star }))
                }
                className={
                  "h-9 w-9 rounded-md border text-lg " +
                  (reviewForm.rating >= star
                    ? "bg-yellow text-white border-yellow"
                    : "bg-white text-gray-400")
                }
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={reviewForm.comment}
          onChange={(e) =>
            setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
          }
          placeholder="আপনার মতামত লিখুন..."
          className="mt-3 w-full min-h-[110px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
        />
        <button
          type="button"
          onClick={submitReview}
          disabled={submittingReview}
          className="mt-3 rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green/90 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          {submittingReview ? "জমা হচ্ছে…" : "রিভিউ জমা দিন"}
        </button>
      </div>
    </div>
  );
};

export default ProductReviewsPanel;
