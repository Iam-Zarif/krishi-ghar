export const Toast = ({ type, message, onClose }) => {
  if (!message) return null;

  const tone =
    type === "success"
      ? "bg-emerald-600"
      : type === "warn"
      ? "bg-amber-600"
      : "bg-rose-600";

  return (
    <div
      className={`fixed top-6 right-6 z-[1000] rounded-xl px-4 py-3 text-white shadow-lg ${tone}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 rounded-md/50 px-2 py-1 hover:bg-white/10 cursor-pointer"
          type="button"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
