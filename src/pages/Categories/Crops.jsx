import CategoryProductsPage from "./CategoryProductsPage";

const cropKeywords = ["crop", "crops", "agriculture", "ফসল", "কৃষি", "ধান", "চাল", "সবজি"];

const Crops = () => (
  <CategoryProductsPage
    title="ফসল ও কৃষি পণ্য"
    searchPlaceholder="ফসল পণ্য খুঁজুন..."
    keywords={cropKeywords}
  />
);

export default Crops;
