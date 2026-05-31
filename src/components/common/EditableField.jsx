export const EditableField = ({
  label,
  value,
  type = "text",
  disabled = false,
  textarea = false,
  rows = 1,
  readOnlyNote,
  actions,
  onChange,
  onKeyDown,
  placeholder,
}) => {
  const inputClass =
    "mt-1 p-2 w-full border rounded-md border-gray-200 bg-white";
  const readOnlyClass =
    "mt-1 p-2 w-full border border-gray-200 rounded-md bg-gray-50 text-gray-700";

  const handleChange = (event) => {
    if (!onChange) return;
    if (event && event.target) {
      onChange(event.target.value);
      return;
    }
    onChange(event);
  };

  const renderActions = () => {
    if (!actions) return null;
    if (typeof actions !== "object") return actions;

    const { save, cancel, saving, dirty } = actions;
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            dirty && !saving
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {saving ? "সেভ..." : "সেভ"}
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={saving}
          className="rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          বাতিল
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <div className="flex items-center gap-2 shrink-0">
          {renderActions() ||
            (readOnlyNote ? (
              <span className="text-[11px] text-gray-400">{readOnlyNote}</span>
            ) : null)}
        </div>
      </div>

      {textarea ? (
        <textarea
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          className={readOnlyClass}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={disabled ? readOnlyClass : inputClass}
        />
      )}
    </div>
  );
};
