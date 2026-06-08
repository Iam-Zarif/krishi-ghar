import { Navigate } from "react-router-dom";

// Disabled legacy static role page. Role dashboards should render only pages
// backed by documented APIs.
const RoleStaticPage = () => (
  <Navigate to="/dashboard/producerAllProducts" replace />
);

export default RoleStaticPage;
