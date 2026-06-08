import {
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiXCircle,
} from "react-icons/fi";

export const STATUS_TABS = [
  {
    key: "all",
    label: "সব পণ্য",
    icon: FiPackage,
    activeClass: "bg-emerald-600 text-white shadow-sm",
    inactiveClass: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
  },
  {
    key: "pending",
    label: "অপেক্ষমাণ",
    icon: FiClock,
    activeClass: "bg-amber-500 text-white shadow-sm",
    inactiveClass: "bg-white text-gray-700 border border-gray-200 hover:bg-amber-50",
  },
  {
    key: "approved",
    label: "অনুমোদিত",
    icon: FiCheckCircle,
    activeClass: "bg-green-600 text-white shadow-sm",
    inactiveClass: "bg-white text-gray-700 border border-gray-200 hover:bg-green-50",
  },
  {
    key: "rejected",
    label: "বাতিল",
    icon: FiXCircle,
    activeClass: "bg-red-500 text-white shadow-sm",
    inactiveClass: "bg-white text-gray-700 border border-gray-200 hover:bg-red-50",
  },
];

export const statusMeta = {
  pending: {
    label: "অপেক্ষমাণ",
    className: "bg-amber-100 text-amber-800 border border-amber-300",
  },
  approved: {
    label: "অনুমোদিত",
    className: "bg-emerald-600 text-white border border-emerald-600 shadow-sm",
  },
  rejected: {
    label: "বাতিল",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
};
