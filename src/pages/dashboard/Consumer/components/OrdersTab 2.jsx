import { FiDownload, FiMessageCircle } from "react-icons/fi";
import ChatWidget from "../../supersaler/SupersalerOrders/ChatWidget";

const OrdersTab = ({
  orderStatuses,
  orderStats,
  orderTab,
  setOrderTab,
  ordersLoading,
  ordersError,
  setOrdersReloadTick,
  ordersByStatus,
  formatDate,
  formatPrice,
  getOrderTotal,
  handleInvoiceDownload,
  setActiveChatOrder,
  activeChatOrder,
  onCloseChat,
}) => {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-neutral-100 bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {orderStatuses.map((status) => {
            const count =
              status.id === "completed"
                ? orderStats.completedOrders
                : status.id === "pending"
                  ? orderStats.pendingOrders
                  : orderStats.cancelledOrders;

            return (
              <button
                key={status.id}
                onClick={() => setOrderTab(status.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  orderTab === status.id
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-neutral-100"
                }`}
              >
                <status.icon />
                {status.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    orderTab === status.id
                      ? "bg-white/20 text-white"
                      : "bg-white text-emerald-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {ordersLoading ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500">
          অর্ডার লোড হচ্ছে...
        </div>
      ) : ordersError ? (
        <div className="bg-white border border-red-200 rounded-2xl p-6 text-center text-red-600">
          <p>{ordersError}</p>
          <button
            type="button"
            onClick={() => setOrdersReloadTick((prev) => prev + 1)}
            className="mt-3 inline-flex items-center rounded-lg border border-red-300 px-3 py-1.5 text-sm hover:bg-red-50"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : ordersByStatus.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500">
          এই ক্যাটাগরিতে কোনো অর্ডার নেই।
        </div>
      ) : (
        <div className="space-y-4">
          {ordersByStatus.map((order) => {
            const statusMeta =
              orderStatuses.find((s) => s.id === order.status) || orderStatuses[1];

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-neutral-100 p-4 sm:p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">অর্ডার #{order.id}</p>
                    <p className="text-sm text-gray-500">তারিখ: {formatDate(order.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusMeta?.badgeClass}`}
                    >
                      <statusMeta.icon /> {statusMeta.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded-full">
                      মোট: {formatPrice(getOrderTotal(order))}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            পরিমাণ: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  {order.status === "completed" && (
                    <button
                      type="button"
                      onClick={() => handleInvoiceDownload(order)}
                      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                    >
                      <FiDownload /> ইনভয়েস ডাউনলোড
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveChatOrder({
                        o: {
                          orderId: order.id,
                          createdAt: order.date,
                        },
                        items: order.items.map((item) => ({
                          productImage: item.image,
                          productName: item.name,
                          quantity: item.quantity,
                          price: item.price,
                        })),
                      })
                    }
                    className="inline-flex items-center gap-2 bg-white text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 transition"
                  >
                    <FiMessageCircle /> অ্যাডমিনের সাথে যোগাযোগ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ChatWidget
        orderData={activeChatOrder}
        onClose={onCloseChat}
      />
    </div>
  );
};

export default OrdersTab;
