import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Api } from "../../api/API";


const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [error, setError] = useState(null);

  const CategorySkeleton = () => (
    <div className="h-60 rounded-2xl bg-gray-100 animate-pulse" />
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCats(true);

        const res = await axios.get(`${Api}/api/v1/products/categories`);

        const formatted = res.data.categories.map((cat) => ({
          id: cat._id,
          label: cat.name,
          to: `/category/${cat._id}`,
          icon: `${Api}/${cat.icon.replace(/\\/g, "/")}`,
        }));

        setCategories(formatted);
      } catch (err) {
        console.error("Category fetch error:", err);
        setError("ক্যাটাগরি লোড করা যায়নি");
      } finally {
        setLoadingCats(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-12 lg:py-20 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h2 className="text-xl lg:text-3xl font-medium text-gray-800 mb-6">
          ক্যাটাগরি
        </h2>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 lg:gap-4">
          {loadingCats
            ? Array.from({ length: 10 }).map((_, i) => (
                <CategorySkeleton key={i} />
              ))
            : categories.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className="group relative h-[180px] lg:h-[240px]  rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  <div className="absolute bottom-4 left-4">
                    <p className="text-white lg:text-lg font-semibold tracking-wide">
                      {item.label}
                    </p>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
