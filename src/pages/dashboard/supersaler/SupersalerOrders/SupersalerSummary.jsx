import React from 'react'

const SupersalerSummary = ({ o, created, eta, items, money }) => {
  return (
    <aside className="h-max sticky lg:mt-8 top-20">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="font-semibold text-gray-800">সারসংক্ষেপ</div>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">অর্ডার আইডি</span>
            <span className="font-medium text-gray-800">{o.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">তৈরির তারিখ</span>
            <span className="font-medium text-gray-800">{created}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">সম্ভাব্য ডেলিভারি</span>
            <span className="font-medium text-gray-800">{eta}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">অর্ডার স্ট্যাটাস</span>
            <span className="font-medium capitalize">{o.orderStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">পেমেন্ট</span>
            <span className="font-medium capitalize">{o.paymentStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">পণ্যের সংখ্যা</span>
            <span className="font-medium">{items.length}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t flex justify-between items-center">
          <span className="text-sm text-gray-600">মোট</span>
          <span className="text-lg font-bold text-green-700">
            {money(o.totalAmount)}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default SupersalerSummary