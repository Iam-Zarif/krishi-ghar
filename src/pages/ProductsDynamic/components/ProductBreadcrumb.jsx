import { Link } from "react-router-dom";

const ProductBreadcrumb = ({ productName }) => (
  <nav className="text-sm mb-3 text-gray-500">
    <Link to="/" className="hover:text-gray-700">
      হোম
    </Link>
    <span className="mx-1.5">/</span>
    <Link to="/products" className="hover:text-gray-700">
      পণ্যসমূহ
    </Link>
    <span className="mx-1.5">/</span>
    <span className="text-gray-700 line-clamp-1">{productName}</span>
  </nav>
);

export default ProductBreadcrumb;