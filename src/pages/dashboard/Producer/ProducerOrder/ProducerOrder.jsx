import { Toaster } from "react-hot-toast";

const ProducerOrder = () => {
  return (
    <div className="w-full pt-7">
      <Toaster />

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-2xl font-semibold text-amber-800">
          উৎপাদক অর্ডার তালিকা সাময়িকভাবে বন্ধ
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-amber-700">
          আগের উৎপাদক অর্ডার এপিআই এখন আর ব্যবহার করা হচ্ছে না। নতুন এপিআই না আসা
          পর্যন্ত উৎপাদক ড্যাশবোর্ডে সুপার সেলারের কেনা পণ্যের তালিকা দেখানো
          যাবে না।
        </p>
      </div>
    </div>
  );
};

export default ProducerOrder;
