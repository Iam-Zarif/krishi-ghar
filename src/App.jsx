import "./App.css";
import "keen-slider/keen-slider.min.css";
import "@smastrom/react-rating/style.css";
import { useContext } from "react";
import Cookies from "js-cookie";
import Footer from "./shared/Footer/Footer";
import Navbar from "./shared/Navbar/Navbar";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import PageLoader from "./components/common/PageLoader";
import { UserProfileContext } from "./providers/getUserProfile/getUserProfile";

const hasStoredSession = () =>
  Boolean(Cookies.get("token") || localStorage.getItem("token"));

function App() {
  const location = useLocation();
  const { userProfile, profileLoading } = useContext(UserProfileContext);
  const isAuthRoute =
    location.pathname === "/auth" || location.pathname.startsWith("/auth/");

  const isProtectedRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/consumer") ||
    location.pathname.includes("/cart") ||
    location.pathname.includes("/wishlist") ||
    location.pathname.includes("/checkout");

  if (location.pathname === "/auth") {
    return <Navigate to="/auth/login" replace />;
  }

  // Only check authentication for non-public routes
  if (!isAuthRoute && isProtectedRoute && !hasStoredSession()) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (!isAuthRoute && isProtectedRoute && profileLoading) {
    return <PageLoader />;
  }

  if (!isAuthRoute && isProtectedRoute && !userProfile) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return (
    <div className="flex  justify-between flex-col min-h-screen">
      <div>
        <Navbar />
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default App;
