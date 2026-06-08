import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const HeroLoad = ({ instanceRef }) => {
  return (
    <>
      <button
        onClick={() => instanceRef.current.prev()}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-md hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full shadow-lg transition"
      >
        <FiChevronLeft size={18} />
      </button>

      <button
        onClick={() => instanceRef.current.next()}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-md hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full shadow-lg transition"
      >
        <FiChevronRight size={18} />
      </button>
    </>
  );
};

export default HeroLoad;
