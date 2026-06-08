import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import PropTypes from "prop-types";

const imgOk = (url) =>
  typeof url === "string" && /^https?:\/\//i.test(url)
    ? url
    : "https://via.placeholder.com/800x600?text=%20";

const Thumb = ({ src, active, onClick, alt }) => (
  <button
    onClick={onClick}
    className={[
      "rounded-lg overflow-hidden border",
      active ? "border-green ring-2 ring-green/30" : "border-gray-200",
    ].join(" ")}
  >
    <img
      src={imgOk(src)}
      alt={alt}
      className="h-16 w-16 object-cover md:h-18 md:w-18"
      loading="lazy"
      onError={(e) =>
        (e.currentTarget.src = "https://via.placeholder.com/120?text=%20")
      }
    />
  </button>
);

const ProductGallery = ({ main, gallery, idx, setIdx, productName }) => {
  return (
    <section className="w-full">
      <div className="relative rounded-2xl overflow-hidden bg-white border">
        <img
          src={imgOk(main)}
          alt={productName}
          className="w-full h-80 md:h-[26rem] object-cover"
          onError={(e) =>
            (e.currentTarget.src =
              "https://via.placeholder.com/800x600?text=%20")
          }
        />
        {gallery.length > 1 && (
          <>
            <button
              onClick={() =>
                setIdx((p) => (p === 0 ? gallery.length - 1 : p - 1))
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow"
            >
              <FiChevronLeft className="text-xl" />
            </button>
            <button
              onClick={() =>
                setIdx((p) => (p === gallery.length - 1 ? 0 : p + 1))
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow"
            >
              <FiChevronRight className="text-xl" />
            </button>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {gallery.map((g, i) => (
            <Thumb
              key={i}
              src={g}
              alt={`${productName} ${i + 1}`}
              active={i === idx}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGallery;

Thumb.propTypes = {
  src: PropTypes.string,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  alt: PropTypes.string,
};

ProductGallery.propTypes = {
  main: PropTypes.string,
  gallery: PropTypes.arrayOf(PropTypes.string).isRequired,
  idx: PropTypes.number.isRequired,
  setIdx: PropTypes.func.isRequired,
  productName: PropTypes.string,
};
