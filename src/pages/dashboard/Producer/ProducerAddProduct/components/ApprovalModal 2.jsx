/* eslint-disable react/prop-types */
import { AiOutlineClose } from "react-icons/ai";

const ApprovalModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            পণ্যটি জমা হয়েছে
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            আপনার পণ্য সফলভাবে যোগ হয়েছে। এখন এটি অ্যাডমিন অনুমোদনের অপেক্ষায়
            আছে। অনুমোদন সম্পন্ন হলে পণ্যটি তালিকায় সক্রিয়ভাবে দেখা যাবে।
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 cursor-pointer"
          aria-label="বন্ধ করুন"
        >
          <AiOutlineClose size={16} />
        </button>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green/90 cursor-pointer"
        >
          ঠিক আছে
        </button>
      </div>
    </div>
  </div>
);

export default ApprovalModal;
