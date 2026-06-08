export function ErrorBlock({ message, onRetry }) {
  return (
    <div className="mb-5 w-full rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-center justify-between">
      <span className="truncate">{message}</span>
      <button
        onClick={onRetry}
        className="rounded-full border border-red-300 bg-white px-3 py-1.5 text-sm hover:bg-red-100 cursor-pointer"
      >
        আবার চেষ্টা করুন
      </button>
    </div>
  );
}
