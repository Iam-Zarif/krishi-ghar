import profile from "../../../public/photos/dashboard/producer/Profile.svg";
import allProducts from "../../../public/photos/dashboard/producer/allProducts.svg";
import postProduct from "../../../public/photos/dashboard/producer/postProduct.svg";
import cart from "../../../public/photos/navbar/cart.png";

export const MenuItems = [
  { name: "প্রোফাইল", path: "/dashboard/producerProfile", icon: profile },
  { name: "বিক্রয় পোস্ট", path: "/dashboard/producerSellPost", icon: cart },
  {
    name: "সকল পণ্য",
    path: "/dashboard/producerAllProducts",
    icon: allProducts,
  },
  {
    name: "পণ্য যোগ করুন",
    path: "/dashboard/producerAddProduct",
    icon: postProduct,
  },
];
