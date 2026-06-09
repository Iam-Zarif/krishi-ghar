import { PRODUCT_UNIT_OPTIONS } from "./addProductConstants";

const QuantityUnitField = ({
  customUnitNote,
  onCustomUnitNoteChange,
  onQuantityChange,
  onQuantityStep,
  onUnitChange,
  quantity,
  unit,
}) => (
  <div className="w-full">
    <p className="font-semibold mb-2">পণ্যের পরিমাণ</p>
    <div className="flex flex-wrap items-start gap-4">
      <div className="flex h-10 w-44 items-center gap-2 overflow-hidden rounded-md border border-gray-300 bg-[#f9f9f9] px-2">
        <button
          type="button"
          onClick={() => onQuantityStep(-1)}
          className="px-3 py-2 text-gray-500 hover:bg-gray-200 transition cursor-pointer"
          aria-label="পরিমাণ কমান"
        >
          –
        </button>
        <input
          type="text"
          value={quantity}
          onChange={(event) => onQuantityChange(event.target.value)}
          className="w-full min-w-0 text-center bg-transparent font-semibold outline-none"
        />
        <button
          type="button"
          onClick={() => onQuantityStep(1)}
          className="px-3 py-2 text-gray-500 hover:bg-gray-200 transition cursor-pointer"
          aria-label="পরিমাণ বাড়ান"
        >
          +
        </button>
      </div>

      <select
        value={unit}
        onChange={(event) => onUnitChange(event.target.value)}
        className="h-10 w-32 rounded-md border border-gray-300 bg-[#f9f9f9] px-3 py-2 focus:outline-none focus:border-green transition"
      >
        {PRODUCT_UNIT_OPTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>

    {unit === "other" ? (
      <label className="mt-4 block">
        <span className="mb-2 block font-semibold text-gray-800">
          পরিমাণের ব্যাখ্যা
          <span className="ml-1 text-sm font-normal text-gray-500">
            (যেমন: ১ টন = ৪০ কেজি)
          </span>
        </span>
        <input
          type="text"
          value={customUnitNote}
          onChange={(event) => onCustomUnitNoteChange(event.target.value)}
          placeholder="যেমন: ১ টন = ৪০ কেজি"
          className="w-full rounded-md border border-gray-300 px-4 py-2 bg-[#f9f9f9] focus:outline-none focus:border-green transition duration-150"
        />
      </label>
    ) : null}
  </div>
);

export default QuantityUnitField;
