import { IoChevronDown } from "react-icons/io5";
import { REGISTER_ROLES, ROLE_LABELS } from "../registerFields";

export default function RegisterRoleSelect({
  selectedRole,
  dropdownOpen,
  onToggle,
  onSelect,
  selectRef,
}) {
  return (
    <div
      ref={selectRef}
      className={`flex items-start flex-col gap-2 ${!selectedRole && "col-span-2"}`}
    >
      <p className="font-semibold ">
        {selectedRole ? "নির্বাচিত ভূমিকা" : "নিজের পরিচয় দিন"}
        <span className="text-2xl text-red-600">*</span>
      </p>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
        className="cursor-pointer relative bg-[#eeeeec] flex px-4 items-center justify-between rounded-xl h-[2.5rem] w-full"
      >
        <p className="opacity-60">
          {selectedRole ? ROLE_LABELS[selectedRole] : "ভূমিকা নির্বাচন করুন"}
        </p>
        <IoChevronDown
          className={`text-xl transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />

        {dropdownOpen && (
          <div className="absolute w-full z-[9999] top-12 left-0 bg-white border rounded-xl border-gray-300">
            {REGISTER_ROLES.map((role) => (
              <div
                key={role}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(role);
                }}
                className="w-full px-3 py-2 hover:bg-[#eeeeec] duration-300 transition-all opacity-60 cursor-pointer flex items-center gap-1.5"
              >
                <input type="radio" checked={selectedRole === role} readOnly />
                <p>{ROLE_LABELS[role]}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
