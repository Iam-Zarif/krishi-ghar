import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const SupersalerPagination = ({ pagination, loading, setPage }  ) => {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-gray-600">
        পৃষ্ঠা {pagination.currentPage} / {pagination.totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!pagination.hasPrevPage || loading}
          className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50 hover:border-green-500"
        >
          <FaChevronLeft className="h-3 w-3" /> পূর্ববর্তী
        </button>
        <button
          onClick={() => setPage((p) => (pagination.hasNextPage ? p + 1 : p))}
          disabled={!pagination.hasNextPage || loading}
          className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50 hover:border-green-500"
        >
          পরবর্তী <FaChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default SupersalerPagination