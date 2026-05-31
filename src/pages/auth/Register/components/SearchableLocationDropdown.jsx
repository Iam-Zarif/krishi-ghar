import { useEffect, useMemo, useRef, useState } from "react";

const getOptionId = (item) => String(item?.id || item?._id || item?.code || "");
const getOptionDisplayName = (item) =>
  String(item?.bn_name || item?.name || item?.display || "").trim();
const getSearchText = (item) =>
  [item?.bn_name, item?.name, item?.display, item?.id]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export default function SearchableLocationDropdown({
  disabled = false,
  label,
  onChange,
  options = [],
  placeholder,
  value,
}) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = useMemo(
    () => options.find((item) => getOptionId(item) === String(value)),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;

    return options.filter((item) => getSearchText(item).includes(normalizedQuery));
  }, [options, query]);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const handleSelect = (item) => {
    onChange(getOptionId(item));
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex w-full flex-col items-start gap-2">
      <p className="font-semibold">
        {label} <span className="text-2xl text-red-600">*</span>
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#eeeeec] px-4 py-2.5 text-left text-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
          {selectedOption ? getOptionDisplayName(selectedOption) : placeholder}
        </span>
        <span className="text-gray-500">⌄</span>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-[9999] mt-1 w-full rounded-xl border border-gray-300 bg-white p-2 shadow-lg">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="খুঁজুন..."
            className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green"
          />

          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.length ? (
              filteredOptions.map((item) => {
                const id = getOptionId(item);
                const isSelected = id === String(value);

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition ${
                      isSelected
                        ? "bg-green/10 text-green"
                        : "text-gray-700 hover:bg-[#eeeeec]"
                    }`}
                  >
                    {getOptionDisplayName(item)}
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-3 text-sm text-gray-500">
                কোনো লোকেশন পাওয়া যায়নি
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
