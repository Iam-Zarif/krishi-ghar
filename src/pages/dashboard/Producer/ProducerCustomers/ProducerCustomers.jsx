import { Navigate } from "react-router-dom";

// Disabled legacy static customers page. There is no documented producer
// customers API in the backend docs, so the UI is hidden instead of showing
// fake customer data.
const ProducerCustomers = () => (
  <Navigate to="/dashboard/producerAllProducts" replace />
);

export default ProducerCustomers;
