/* eslint-disable react/prop-types */
import SkeletonLoader from "../../../../components/common/SkeletonLoader";

export function SkeletonCard() {
  return <SkeletonLoader variant="reseller-card" />;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium hover:bg-red-100 cursor-pointer"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    </div>
  );
}
