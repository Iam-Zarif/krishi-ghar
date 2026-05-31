// eslint-disable-next-line react/prop-types
const AuthSubmitButton = ({
  children,
  loading = false,
  disabled = false,
  className = "",
  ...props
}) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={`mt-4 flex w-full items-center justify-center rounded-xl bg-green py-2.5 text-md text-white transition ${
      disabled || loading
        ? "cursor-not-allowed opacity-70"
        : "hover:bg-green/90"
    } ${className}`}
  >
    {loading ? (
      <span className="flex items-center gap-3">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        <span>লগইন হচ্ছে...</span>
      </span>
    ) : (
      children
    )}
  </button>
);

export default AuthSubmitButton;
