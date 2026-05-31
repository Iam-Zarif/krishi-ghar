import { FaEye, FaEyeSlash } from "react-icons/fa";

const fieldClass =
  "py-2.5 text-md block w-full focus:outline-green px-4 bg-[#eeeeec] rounded-xl";

export default function RegisterField({
  field,
  value,
  onChange,
  passwordVisible = false,
  onTogglePassword,
}) {
  const inputType =
    field.name === "password" || field.name === "confirmPassword"
      ? passwordVisible
        ? "text"
        : "password"
      : field.type || "text";

  return (
    <div className="flex items-start w-full flex-col gap-2">
      {field.label ? (
        <p className="font-semibold">
          {field.label}{" "}
          {field.required ? <span className="text-2xl text-red-600">*</span> : null}
        </p>
      ) : null}

      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={`${fieldClass} resize-none`}
          placeholder={field.placeholder}
        />
      ) : field.name === "password" || field.name === "confirmPassword" ? (
        <div className="relative w-full">
          <input
            className={`${fieldClass} pr-12`}
            placeholder={field.placeholder}
            type={inputType}
            value={value}
            onChange={(event) => onChange(field.name, event.target.value)}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
          >
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      ) : (
        <input
          type={inputType}
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          placeholder={field.placeholder}
          className={fieldClass}
        />
      )}
    </div>
  );
}
