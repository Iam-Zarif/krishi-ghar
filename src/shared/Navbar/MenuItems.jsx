import {
  FaBoxOpen,
  FaClipboardList,
  FaPlusCircle,
  FaUserCircle,
} from "react-icons/fa";

export const MenuItems = [
  { name: "প্রোফাইল", path: "/dashboard/producerProfile", icon: FaUserCircle },
  { name: "বিক্রয় পোস্ট", path: "/dashboard/producerSellPost", icon: FaClipboardList },
  {
    name: "সকল পণ্য",
    path: "/dashboard/producerAllProducts",
    icon: FaBoxOpen,
  },
  {
    name: "পণ্য যোগ করুন",
    path: "/dashboard/producerAddProduct",
    icon: FaPlusCircle,
  },
];
