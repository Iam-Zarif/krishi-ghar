const ProducerDeleteModal = ({
  deleting,
  onClose,
  onConfirm,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-md">
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-gray-900">
        মুছে ফেলার নিশ্চয়তা
      </h2>
      <p className="mt-4 text-sm leading-6 text-gray-600">
        আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায়
        ফেরানো যাবে না।
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          বাতিল
        </button>
        <button
          onClick={onConfirm}
          className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700 cursor-pointer"
        >
          {deleting ? "মুছে ফেলা হচ্ছে..." : "মুছুন"}
        </button>
      </div>
    </div>
  </div>
);

export default ProducerDeleteModal;
