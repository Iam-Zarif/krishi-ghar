import { useContext, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { Rating } from "@smastrom/react-rating";
import { FiRefreshCw } from "react-icons/fi";
import { UserProfileContext } from "../../../providers/getUserProfile/getUserProfile";
import { getUserReviews } from "../../../api/reviews";

const roleKeyLabel = {
  producer: "উৎপাদক",
  wholesaler: "হোলসেলার",
  superseller: "সুপার সেলার",
};

const resolveUserName = (profile) =>
  profile?.username ||
  profile?.name ||
  profile?.userName ||
  profile?.fullName ||
  profile?.consumerName ||
  "";

const resolveUserNames = (profile) =>
  Array.from(
    new Set(
      [
        profile?.username,
        profile?.userName,
        profile?.name,
        profile?.fullName,
        profile?.consumerName,
      ]
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );

const ReviewsSkeleton = () => (
  <div className="mt-7 grid gap-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="h-5 w-36 rounded bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-100" />
          </div>
          <div className="h-4 w-16 rounded bg-gray-100" />
        </div>
        <div className="mt-4 h-4 w-28 rounded bg-gray-100" />
        <div className="mt-4 h-4 w-full rounded bg-gray-100" />
        <div className="mt-2 h-4 w-4/5 rounded bg-gray-100" />
      </div>
    ))}
  </div>
);

// eslint-disable-next-line react/prop-types
const MyReviewsView = ({ role = "producer" }) => {
  const { userProfile, profileLoading } = useContext(UserProfileContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token") || Cookies.get("token") || "";

  const userName = useMemo(() => resolveUserName(userProfile), [userProfile]);
  const userNames = useMemo(() => resolveUserNames(userProfile), [userProfile]);

  const loadReviews = async () => {
    if (!token || !userName) {
      setLoading(false);
      setReviews([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const nextReviews = await getUserReviews({ token, userName, userNames });
      setReviews(nextReviews);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "আপনার রিভিউ লোড করা যায়নি। আবার চেষ্টা করুন।"
      );
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileLoading) return;
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading, userName, userNames, token]);

  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        reviews.length
      ).toFixed(1)
    : "0.0";

  return (
    <div className="w-full p-6 rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-green">আমার রিভিউ</h1>
          <p className="text-xs text-gray-500 mt-2">{roleKeyLabel[role]}</p>
        </div>
        <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700">
          মোট রিভিউ: <span className="font-semibold text-green">{reviews.length}</span>
        </div>
      </div>

      <div className="w-full h-[1px] bg-gray-300 mt-5 border-dashed"></div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">রিভিউদাতা</p>
          <p className="mt-2 text-xl font-semibold text-gray-800">
            {userName || "নাম পাওয়া যায়নি"}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">গড় রেটিং</p>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-xl font-semibold text-green">{averageRating}</p>
            <Rating value={Number(averageRating)} readOnly style={{ maxWidth: 100 }} />
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">স্ট্যাটাস</p>
          <p className="mt-2 text-base font-medium text-gray-700">
            {loading ? "লোড হচ্ছে..." : error ? "সমস্যা হয়েছে" : "সক্রিয়"}
          </p>
        </div>
      </div>

      {loading ? (
        <ReviewsSkeleton />
      ) : error ? (
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadReviews}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-red-700 hover:bg-red-50 cursor-pointer"
          >
            <FiRefreshCw />
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="mt-7 rounded-xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
          এখনো কোনও রিভিউ পাওয়া যায়নি।
        </div>
      ) : (
        <div className="mt-7 grid gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {review.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(review.date).toLocaleDateString("bn-BD")}
                  </p>
                </div>
                <Rating
                  value={Number(review.rating || 0)}
                  readOnly
                  style={{ maxWidth: 100 }}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-700">
                {review.comment || "কোনও মন্তব্য নেই"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviewsView;
