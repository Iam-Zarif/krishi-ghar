import { FiCalendar, FiMail, FiMapPin, FiPhone, FiUser } from "react-icons/fi";

const ProfileTab = ({ profileForView, orderStats, formatDate, formatPrice, addresses = [] }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 sm:p-8 flex flex-col lg:flex-row items-start gap-6">
        <div>
          {profileForView.avatar ? (
            <img
              src={profileForView.avatar}
              alt={profileForView.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-neutral-100"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-neutral-100 bg-gray-100 flex items-center justify-center text-gray-500">
              <FiUser className="text-3xl sm:text-4xl" />
            </div>
          )}
        </div>
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profileForView.name}
              </h1>
              <p className="text-gray-500">@{profileForView.username}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5 text-sm text-gray-700">
            <span className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
              <FiMail className="text-emerald-600" /> {profileForView.email}
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
              <FiPhone className="text-emerald-600" /> {profileForView.phone}
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
              <FiCalendar className="text-emerald-600" />
              যোগদান: {formatDate(profileForView.joined)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500">মোট অর্ডার</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {orderStats.totalOrders}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500">সম্পন্ন</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {orderStats.completedOrders}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500">অপেক্ষমাণ</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">
            {orderStats.pendingOrders}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500">বাতিল</p>
          <p className="text-2xl font-bold text-red-500 mt-1">
            {orderStats.cancelledOrders}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-500">মোট খরচ</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatPrice(orderStats.totalSpend)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 sm:p-8 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">ঠিকানার তথ্য</h2>
        {addresses.length ? (
          addresses.map((address) => (
            <div
              key={address.label}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-gray-50"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{address.label}</h3>
                <p className="text-sm text-gray-600 mt-1">{address.line}</p>
              </div>
              {address.mapLink && (
                <a
                  href={address.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  <FiMapPin className="text-base" /> মানচিত্র দেখুন
                </a>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-600">
            প্রোফাইলে ঠিকানা যোগ করা হয়নি।
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTab;
