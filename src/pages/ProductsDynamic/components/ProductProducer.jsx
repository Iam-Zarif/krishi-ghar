const ProductProducer = ({ producer }) => {
  const safeStr = (s, fallback = "—") =>
    typeof s === "string" && s.trim() ? s : fallback;

  return (
    <div className="mt-6 grid sm:grid-cols-2 gap-4">
      <div className="rounded-xl border bg-white p-4">
        <p className="text-sm text-gray-500 mb-1">উৎপাদক</p>
        <p className="font-medium text-gray-800">
          {safeStr(producer?.name, "—")}
        </p>
        <p className="text-sm text-gray-600">
          {[producer?.division, producer?.district, producer?.thana]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div>
    </div>
  );
};

export default ProductProducer;