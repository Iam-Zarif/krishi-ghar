export const getRoleDashboardPath = (role) => {
  switch (String(role || "").toLowerCase()) {
    case "producer":
      return "/dashboard/producerAllProducts";
    case "wholesaler":
      return "/dashboard/wholesaler/producer-products";
    case "supersaler":
    case "superseller":
      return "/dashboard/superseller/producer-products";
    case "consumer":
      return "/";
    case "admin":
      return "/dashboard/admin/purchases";
    default:
      return "/";
  }
};

export const isDashboardOnlyRole = (role) =>
  ["producer", "wholesaler", "supersaler", "superseller", "admin"].includes(
    String(role || "").toLowerCase(),
  );
