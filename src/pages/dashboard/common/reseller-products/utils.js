export const getFilteredByView = (products, viewKey) => {
  if (viewKey === "sell-post") {
    return products.filter((product) => !product.isSelling);
  }
  return products;
};

export const statusBadgeClass = (isSelling) =>
  isSelling
    ? "border-green/20 bg-green/10 text-green"
    : "border-amber-200 bg-amber-50 text-amber-700";

export const filterAndSortProducts = ({
  products,
  query,
  sort,
  viewKey,
}) => {
  let list = getFilteredByView(products, viewKey);

  if (query) {
    list = list.filter((product) => {
      const haystack = [
        product.productName,
        product.categoryName,
        product.producer?.name,
        product.quantity,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  list = [...list];
  if (sort === "oldest") {
    list.sort(
      (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime()
    );
  } else if (sort === "price_asc") {
    list.sort((a, b) => a.priceNumber - b.priceNumber);
  } else if (sort === "price_desc") {
    list.sort((a, b) => b.priceNumber - a.priceNumber);
  } else if (sort === "name_asc") {
    list.sort((a, b) =>
      String(a.productName || "").localeCompare(String(b.productName || ""))
    );
  } else {
    list.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime()
    );
  }

  return list;
};
