import CategoryProductsPage from "./CategoryProductsPage";

const dairyKeywords = ["dairy", "milk", "দুধ", "ডেইরি"];

const Dairy = () => (
  <CategoryProductsPage
    title="ডেইরি পণ্য"
    searchPlaceholder="ডেইরি পণ্য খুঁজুন..."
    keywords={dairyKeywords}
  />
);

export default Dairy;
