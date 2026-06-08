import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import MyReviewsView from "./MyReviewsView";
import ResellerApprovedProductsView from "./ResellerApprovedProductsView";

const RoleProducerStylePage = ({ role = "wholesaler", pageKey = "dashboard" }) => {
  const basePath =
    role === "superseller" || role === "supersaler"
      ? "/dashboard/superseller"
      : "/dashboard/wholesaler";

  if (pageKey === "dashboard") {
    return <Navigate to={`${basePath}/producer-products`} replace />;
  }
  if (pageKey === "sellPost")
    return <ResellerApprovedProductsView role={role} viewKey="sell-post" />;
  if (pageKey === "allProducts")
    return <ResellerApprovedProductsView role={role} viewKey="all-products" />;
  if (pageKey === "myReviews") return <MyReviewsView role={role} />;
  return <Navigate to={`${basePath}/producer-products`} replace />;
};

export default RoleProducerStylePage;

RoleProducerStylePage.propTypes = {
  role: PropTypes.string,
  pageKey: PropTypes.string,
};
