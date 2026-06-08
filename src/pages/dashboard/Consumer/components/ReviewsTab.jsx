import { FiPackage } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";

const ReviewsTab = ({
  reviewsLoading,
  reviewsError,
  setReviewsReloadTick,
  userReviews,
  pendingReviewCandidates,
  draftReviews,
  handleReviewDraft,
  handleReviewSubmit,
  submittingReviewKey,
  formatDate,
}) => {
  return (
    <div className="space-y-4">
      {reviewsLoading ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500">
          রিভিউ লোড হচ্ছে...
        </div>
      ) : reviewsError ? (
        <div className="bg-white border border-red-200 rounded-2xl p-6 text-center text-red-600">
          <p>{reviewsError}</p>
          <button
            type="button"
            onClick={() => setReviewsReloadTick((prev) => prev + 1)}
            className="mt-3 inline-flex items-center rounded-lg border border-red-300 px-3 py-1.5 text-sm hover:bg-red-50"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : userReviews.length === 0 && pendingReviewCandidates.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500">
          এখনো কোনও রিভিউ পাওয়া যায়নি।
        </div>
      ) : (
        <>
          {userReviews.length > 0 && (
            <div className="space-y-4">
              {userReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl border border-neutral-100 p-4 sm:p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <FiPackage className="text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {review.productName || "পণ্য"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        রিভিউ তারিখ: {formatDate(review.date)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-emerald-50 border border-neutral-100 p-3">
                    <div className="flex items-center gap-1 text-yellow">
                      {Array.from({ length: 5 }, (_, index) => (
                        <AiFillStar
                          key={index}
                          className={index < review.rating ? "" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-emerald-900 mt-2">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pendingReviewCandidates.length > 0 && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-neutral-100 p-4 sm:p-5 shadow-sm">
                <p className="font-semibold text-gray-900">রিভিউ বাকি আছে</p>
                <p className="mt-1 text-sm text-gray-500">
                  সম্পন্ন অর্ডারের যেসব পণ্যে এখনো রিভিউ দেওয়া হয়নি।
                </p>
              </div>

              {pendingReviewCandidates.map(({ key, orderId, item, orderDate }) => {
                const draftReview = draftReviews[key] || { rating: 0, feedback: "" };

                return (
                  <div
                    key={key}
                    className="bg-white rounded-2xl border border-neutral-100 p-4 sm:p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <FiPackage className="inline mr-1" /> অর্ডার #{orderId} | {formatDate(orderDate)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              handleReviewDraft(
                                key,
                                index + 1,
                                draftReview.feedback,
                              )
                            }
                            className="text-lg"
                          >
                            <AiFillStar
                              className={
                                draftReview.rating > index
                                  ? "text-yellow"
                                  : "text-gray-300"
                              }
                            />
                          </button>
                        ))}
                      </div>

                      <textarea
                        placeholder="পণ্য সম্পর্কে আপনার মতামত লিখুন..."
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={draftReview.feedback}
                        onChange={(event) =>
                          handleReviewDraft(
                            key,
                            draftReview.rating,
                            event.target.value,
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() => handleReviewSubmit(key, item)}
                        disabled={
                          !draftReview.rating ||
                          !draftReview.feedback.trim() ||
                          submittingReviewKey === key
                        }
                        className="bg-emerald-600 disabled:bg-emerald-200 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                      >
                        {submittingReviewKey === key ? "জমা হচ্ছে..." : "রিভিউ জমা দিন"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewsTab;