import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate, redirect } from "react-router-dom";
import Cookies from "js-cookie";
import { Api } from "../api/API";
import { ApiPaths } from "../api/apiPaths";
import PageLoader from "../components/common/PageLoader";

const App = lazy(() => import("../App"));
const Login = lazy(() => import("../pages/auth/Login/Login"));
const Register = lazy(() => import("../pages/auth/Register/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword/ForgotPassword"));
const BDLocationDropdown = lazy(() => import("../../BDLocationDropdown"));
const Home = lazy(() => import("../pages/Home/Home"));
const ProducerDashboard = lazy(() => import("../pages/dashboard/Producer/ProducerDashboard/ProducerDashboard"));
const ProducerProfile = lazy(() => import("../pages/dashboard/Producer/ProducerProfile/ProducerProfile"));
const ProducerAllProducts = lazy(() => import("../pages/dashboard/Producer/ProducerAllProducts/ProducerAllProducts"));
const ProducerAddProduct = lazy(() => import("../pages/dashboard/Producer/ProducerAddProduct/ProducerAddProduct"));
const ProducerSellPost = lazy(() => import("../pages/dashboard/Producer/ProducerSellPost/ProducerSellPost"));
const WaitForApproval = lazy(() => import("../pages/WaitForApproval/WaitForApproval"));
const WholesellerHome = lazy(() => import("../pages/dashboard/wholesaler/WholesalerHome"));
const SupersalerHome = lazy(() => import("../pages/dashboard/supersaler/SupersalerHome"));
const ProducerProductDynamicPage = lazy(() => import("../pages/dashboard/Producer/ProducerProductDynamicPage/ProducerProductDynamicPage"));
const ProducerEditProduct = lazy(() => import("../pages/dashboard/Producer/ProducerEditProduct/ProducerEditProduct"));
const Products = lazy(() => import("../pages/Products/Products"));
const AboutUs = lazy(() => import("../pages/AboutUs/AboutUs"));
const ContactUs = lazy(() => import("../pages/ContactUs/ContactUs"));
const ProductsDynamic = lazy(() => import("../pages/ProductsDynamic/ProductsDynamic"));
const WholesalerProducerProducts = lazy(() => import("../pages/dashboard/wholesaler/WholesalerProducerProducts/WholesalerProducerProducts"));
const WholesalerProfile = lazy(() => import("../pages/dashboard/wholesaler/WholesalerProfile/WholesalerProfile"));
const WholesalerCart = lazy(() => import("../pages/dashboard/wholesaler/WholesalerCart/WholesalerCart"));
const SupersellerCart = lazy(() => import("../pages/dashboard/supersaler/SupersellerCart"));
const SupersellerProducerProducts = lazy(() => import("../pages/dashboard/supersaler/SupersellerProducerProducts/SupersellerProducerProducts"));
const SupersalerProfile = lazy(() => import("../pages/dashboard/supersaler/SupersalerProfile/SupersalerProfile"));
const SupersalerAddProduct = lazy(() => import("../pages/dashboard/supersaler/SupersalerAddProduct/SupersalerAddProduct"));
const SupersalerProductCheckout = lazy(() => import("../pages/dashboard/supersaler/SupersalerProductCheckout/SupersalerProductCheckout"));
const SupersalerOrders = lazy(() => import("../pages/dashboard/supersaler/SupersalerOrders/SupersalerOrders"));
const AdminPurchaseProducts = lazy(() => import("../pages/dashboard/Admin/AdminPurchaseProducts"));
const ConsumerCart = lazy(() => import("../pages/dashboard/Consumer/ConsumerCart/ConsumerCart"));
const ConsumerWishlist = lazy(() => import("../pages/dashboard/Consumer/ConsumerWishlist/ConsumerWishlist"));
const Crops = lazy(() => import("../pages/Categories/Crops"));
const FarmEquipments = lazy(() => import("../pages/Categories/FarmEquipments"));
const AgroInputs = lazy(() => import("../pages/Categories/AgroInputs"));
const Fishery = lazy(() => import("../pages/Categories/Fishery"));
const Poultry = lazy(() => import("../pages/Categories/Poultry"));
const GrainsPulses = lazy(() => import("../pages/Categories/GrainsPulses"));
const Dairy = lazy(() => import("../pages/Categories/Dairy"));
const Vegetables = lazy(() => import("../pages/Categories/Vegetables"));
const Fruits = lazy(() => import("../pages/Categories/Fruits"));
const ConsumerProfilePage = lazy(() => import("../pages/dashboard/Consumer/ConsumerProfilePage"));
const RoleProducerStylePage = lazy(() => import("../pages/dashboard/common/RoleProducerStylePage"));
const MyReviewsView = lazy(() => import("../pages/dashboard/common/MyReviewsView"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

const withSuspense = (element) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

const getAuthToken = () => Cookies.get("token") || localStorage.getItem("token");

const requireAuthToken = () => {
  const token = getAuthToken();
  if (!token) {
    throw redirect("/auth/login");
  }
  return token;
};

const authHeaders = () => ({
  Authorization: `Bearer ${requireAuthToken()}`,
});

export const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(<App />),
    children: [
      { path: "/", element: withSuspense(<Home />) },
      { path: "/consumer", element: withSuspense(<ConsumerProfilePage />) },
      { path: "/consumer/cart", element: withSuspense(<ConsumerCart />) },
      { path: "/consumer/wishlist", element: withSuspense(<ConsumerWishlist />) },

      { path: "/products", element: withSuspense(<Products />) },
      {
        path: "/category/crops",
        element: withSuspense(<Crops />),
      },
      {
        path: "/category/farm-equipments",
        element: withSuspense(<FarmEquipments />),
      },
      {
        path: "/category/agro-inputs",
        element: withSuspense(<AgroInputs />),
      },
      {
        path: "/category/fishery",
        element: withSuspense(<Fishery />),
      },
      {
        path: "/category/poultry",
        element: withSuspense(<Poultry />),
      },
      {
        path: "/category/grains-pulses",
        element: withSuspense(<GrainsPulses />),
      },
      {
        path: "/category/dairy",
        element: withSuspense(<Dairy />),
      },
      {
        path: "/category/vegetables",
        element: withSuspense(<Vegetables />),
      },
      {
        path: "/category/fruits",
        element: withSuspense(<Fruits />),
      },
      {
        path: "/products/:id",
        element: withSuspense(<ProductsDynamic />),
        loader: ({ params }) =>
          fetch(`${Api}/api/v1/products/${params.id}`, {
            credentials: "include",
          }),
      },
      { path: "/about", element: withSuspense(<AboutUs />) },
      { path: "/contact", element: withSuspense(<ContactUs />) },
      {
        path: "/auth/login",
        element: withSuspense(<Login />),
      },
      {
        path: "/auth/register",
        element: withSuspense(<Register />),
      },
      {
        path: "/auth/forgotPassword",
        element: withSuspense(<ForgotPassword />),
      },
      {
        path: "/auth/waitForAdminApproval",
        element: withSuspense(<WaitForApproval />),
      },
      {
        path: "/waitForAdminApproval",
        element: <Navigate to="/auth/waitForAdminApproval" replace />,
      },

      {
        path: "/dashboard",
        element: withSuspense(<ProducerDashboard />),
        children: [
          {
            path: "/dashboard/producerProfile",
            element: withSuspense(<ProducerProfile />),
          },
          {
            path: "/dashboard/producerAllProducts",
            element: withSuspense(<ProducerAllProducts />),
          },

          {
            path: "/dashboard/product/:id",
            element: withSuspense(<ProducerProductDynamicPage />),
            loader: ({ params }) =>
              fetch(`${Api}${ApiPaths.producer.productDetails(params.id)}`, {
                credentials: "include",
                headers: authHeaders(),
              }),
          },
          {
            path: "/dashboard/producer/product-edit/:id",
            element: withSuspense(<ProducerEditProduct />),
            loader: ({ params }) =>
              fetch(`${Api}${ApiPaths.producer.productDetails(params.id)}`, {
                credentials: "include",
                headers: authHeaders(),
              }),
          },

          {
            path: "/dashboard/producerAddProduct",
            element: withSuspense(<ProducerAddProduct />),
          },
          {
            path: "/dashboard/producerSellPost",
            element: withSuspense(<ProducerSellPost />),
          },
          {
            path: "/dashboard/producerMyReviews",
            element: withSuspense(<MyReviewsView role="producer" />),
          },
        ],
      },


      {
        path: "/dashboard/wholesalerAddProduct",
        element: <Navigate to="/dashboard/wholesaler/sell-post" replace />,
      },
      {
        path: "/dashboard/wholesalerSellPost",
        element: <Navigate to="/dashboard/wholesaler/sell-post" replace />,
      },
      {
        path: "/dashboard/wholesalerAllProducts",
        element: <Navigate to="/dashboard/wholesaler/all-products" replace />,
      },
      // ডকুমেন্টেড wholesaler customers API নেই, তাই legacy route লুকানো।
      // {
      //   path: "/dashboard/wholesalerCustomers",
      //   element: <Navigate to="/dashboard/wholesaler/customers" replace />,
      // },
      {
        path: "/dashboard/wholesaler/sellPost",
        element: <Navigate to="/dashboard/wholesaler/sell-post" replace />,
      },
      {
        path: "/dashboard/wholesaler/allProducts",
        element: <Navigate to="/dashboard/wholesaler/all-products" replace />,
      },
      {
        path: "/dashboard/supersellerAddProduct",
        element: <Navigate to="/dashboard/superseller/add-product" replace />,
      },
      {
        path: "/dashboard/supersellerSellPost",
        element: <Navigate to="/dashboard/superseller/sell-post" replace />,
      },
      {
        path: "/dashboard/supersellerAllProducts",
        element: <Navigate to="/dashboard/superseller/all-products" replace />,
      },
      // ডকুমেন্টেড supersaler customers API নেই, তাই legacy route লুকানো।
      // {
      //   path: "/dashboard/supersellerCustomers",
      //   element: <Navigate to="/dashboard/superseller/customers" replace />,
      // },
      {
        path: "/dashboard/supersalerAddProduct",
        element: <Navigate to="/dashboard/superseller/add-product" replace />,
      },
      {
        path: "/dashboard/supersalerSellPost",
        element: <Navigate to="/dashboard/superseller/sell-post" replace />,
      },
      {
        path: "/dashboard/supersalerAllProducts",
        element: <Navigate to="/dashboard/superseller/all-products" replace />,
      },
      {
        path: "/dashboard/wholesaler",
        element: withSuspense(<WholesellerHome />),
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard/wholesaler/producer-products" replace />,
          },
          {
            path: "dashboard",
            element: <Navigate to="/dashboard/wholesaler/producer-products" replace />,
          },
          {
            path: "sell-post",
            element: withSuspense(<RoleProducerStylePage role="wholesaler" pageKey="sellPost" />),
          },
          {
            path: "all-products",
            element: withSuspense(<RoleProducerStylePage role="wholesaler" pageKey="allProducts" />),
          },
          // ডকুমেন্টেড wholesaler customers API নেই, তাই page route লুকানো।
          // {
          //   path: "customers",
          //   element: withSuspense(<RoleProducerStylePage role="wholesaler" pageKey="customers" />),
          // },
          {
            path: "profile",
            element: withSuspense(<WholesalerProfile />),
          },
          {
            path: "my-reviews",
            element: withSuspense(<RoleProducerStylePage role="wholesaler" pageKey="myReviews" />),
          },
          {
            path: "orders",
            element: <Navigate to="/dashboard/wholesaler/producer-products" replace />,
          },
          {
            path: "support",
            element: <Navigate to="/dashboard/wholesaler/producer-products" replace />,
          },
          {
            path: "producer-products",
            element: withSuspense(<WholesalerProducerProducts />),
          },
          {
            path: "wishlist",
            element: <Navigate to="/dashboard/wholesaler/cart" replace />,
          },
          {
            path: "cart",
            element: withSuspense(<WholesalerCart />),
          },
        ],
      },

      //
      {
        path: "/dashboard/superseller",
        element: withSuspense(<SupersalerHome />),
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard/superseller/producer-products" replace />,
          },
          {
            path: "dashboard",
            element: <Navigate to="/dashboard/superseller/producer-products" replace />,
          },
          {
            path: "sell-post",
            element: withSuspense(<RoleProducerStylePage role="superseller" pageKey="sellPost" />),
          },
          {
            path: "all-products",
            element: withSuspense(<RoleProducerStylePage role="superseller" pageKey="allProducts" />),
          },
          {
            path: "add-product",
            element: withSuspense(<SupersalerAddProduct />),
          },
          // ডকুমেন্টেড supersaler customers API নেই, তাই page route লুকানো।
          // {
          //   path: "customers",
          //   element: withSuspense(<RoleProducerStylePage role="superseller" pageKey="customers" />),
          // },
          {
            path: "producer-products",
            element: withSuspense(<SupersellerProducerProducts />),
          },
          {
            path: "wishlist",
            element: <Navigate to="/dashboard/superseller/cart" replace />,
          },
          {
            path: "cart",
            element: withSuspense(<SupersellerCart />),
          },
          {
            path: "profile",
            element: withSuspense(<SupersalerProfile />),
          },
          {
            path: "my-reviews",
            element: withSuspense(<RoleProducerStylePage role="superseller" pageKey="myReviews" />),
          },
          {
            path: "checkout",
            element: withSuspense(<SupersalerProductCheckout />),
          },
          {
            path: "orders",
            element: withSuspense(<SupersalerOrders />),
          },
        ],
      },

      {
        path: "/dashboard/admin",
        element: withSuspense(<AdminPurchaseProducts />),
      },
      {
        path: "/dashboard/admin/purchases",
        element: withSuspense(<AdminPurchaseProducts />),
      },

      {
        path: "/location",
        element: withSuspense(<BDLocationDropdown />),
      },
      {
        path: "*",
        element: withSuspense(<NotFound />),
      },
    ],
  },
]);
