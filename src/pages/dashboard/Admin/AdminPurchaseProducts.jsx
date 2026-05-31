import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Toaster, toast } from "react-hot-toast";
import { FaSyncAlt } from "react-icons/fa";
import { Api } from "../../../api/API";
import { ApiPaths } from "../../../api/apiPaths";

const TABS = [
  {
    id: "supersaler",
    label: "সুপার সেলার",
    endpoint: ApiPaths.admin.viewSupersalerProduct,
    status: "pending",
  },
  {
    id: "wholesaler",
    label: "হোলসেলার",
    endpoint: null,
  },
  {
    id: "consumer",
    label: "কনজিউমার",
    endpoint: null,
  },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

const getToken = () => Cookies.get("token") || localStorage.getItem("token") || "";

const isOrderRow = (row) => {
  if (!row || typeof row !== "object") return false;

  return Boolean(
    row.orderId ||
      row.orderStatus ||
      row.paymentStatus ||
      row.purchaseStatus ||
      row.order ||
      Array.isArray(row.items),
  );
};

const getResponseArrays = (data) =>
  [
    data,
    data?.orders,
    data?.purchases,
    data?.data,
    data?.data?.orders,
    data?.data?.purchases,
    data?.products,
    data?.data?.products,
  ].filter(Array.isArray);

const getRows = (data) => {
  const arrays = getResponseArrays(data);
  const rows = arrays.flatMap((items) => items.filter(isOrderRow));

  return {
    rows,
    unsupportedShape: rows.length === 0 && arrays.some((items) => items.length > 0),
  };
};

const getOrderId = (row) =>
  row?._id || row?.id || row?.order?._id || row?.orderId || row?.order?.orderId || "";

const getStatus = (row) => {
  const status = String(
    row?.status || row?.orderStatus || row?.purchaseStatus || "pending"
  ).toLowerCase();

  return status === "purchased" ? "completed" : status;
};

const getStatusPayload = (nextStatus) => {
  if (nextStatus === "completed") {
    return { orderStatus: "completed", paymentStatus: "paid" };
  }

  return { orderStatus: nextStatus };
};

const getItems = (row) => {
  if (Array.isArray(row?.items)) return row.items;
  if (Array.isArray(row?.products)) return row.products;
  if (row?.product) return [{ productId: row.product }];
  if (row?.productId) return [{ productId: row.productId }];
  return [];
};

const getProductName = (item) => {
  const product = item?.productId || item?.product || item;
  if (product && typeof product === "object") {
    return product.productName || product.name || item?.productName || "নামহীন পণ্য";
  }
  return item?.productName || "নামহীন পণ্য";
};

const getBuyerName = (row) => {
  const user = row?.user || row?.userId || row?.supersaler || row?.buyer || row?.customer;
  if (user && typeof user === "object") {
    return user.name || user.phone || user.email || "ব্যবহারকারী";
  }
  return row?.buyerName || row?.customerName || "ব্যবহারকারী";
};

export default function AdminPurchaseProducts() {
  const [activeTab, setActiveTab] = useState("supersaler");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const [reloadTick, setReloadTick] = useState(0);

  const activeConfig = useMemo(
    () => TABS.find((tab) => tab.id === activeTab) || TABS[0],
    [activeTab],
  );

  useEffect(() => {
    const token = getToken();
    setRows([]);
    setError("");
    setNotice("");

    if (!activeConfig.endpoint) {
      setLoading(false);
      setNotice("এই ট্যাবের অর্ডার তালিকা API এখনো উপলব্ধ নয়।");
      return;
    }

    if (!token) {
      setError("অ্যাডমিন হিসেবে লগইন করুন");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadRows = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${Api}${activeConfig.endpoint}`, {
          params: activeConfig.status ? { status: activeConfig.status } : undefined,
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        });
        const parsed = getRows(data);
        setRows(parsed.rows);
        setNotice(
          parsed.unsupportedShape
            ? "এই endpoint থেকে অর্ডার তালিকা পাওয়া যায়নি। অ্যাডমিন সুপারসেলার অর্ডার তালিকা API প্রয়োজন।"
            : "",
        );
      } catch (err) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setError(err?.response?.data?.message || "ডাটা লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    };

    loadRows();

    return () => controller.abort();
  }, [activeConfig.endpoint, activeConfig.status, reloadTick]);

  const handleStatusChange = async (row, nextStatus) => {
    const token = getToken();
    const orderId = getOrderId(row);

    if (!token) {
      toast.error("অ্যাডমিন হিসেবে লগইন করুন");
      return;
    }

    if (!orderId) {
      toast.error("অর্ডার আইডি পাওয়া যায়নি");
      return;
    }

    try {
      setBusyId(orderId);
      const payload = getStatusPayload(nextStatus);

      await axios.patch(
        `${Api}${ApiPaths.admin.updateStatus(orderId)}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
      setRows((current) =>
        current.map((item) =>
          getOrderId(item) === orderId
            ? { ...item, status: nextStatus, ...payload }
            : item,
        ),
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "স্ট্যাটাস আপডেট করা যায়নি");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              ক্রয় অর্ডার ম্যানেজমেন্ট
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              পেন্ডিং ক্রয় অর্ডার যাচাই করে স্ট্যাটাস আপডেট করুন।
            </p>
          </div>

          <button
            type="button"
            onClick={() => setReloadTick((current) => current + 1)}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-green hover:text-green"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            রিফ্রেশ
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={!tab.endpoint}
                onClick={() => {
                  if (tab.endpoint) setActiveTab(tab.id);
                }}
                className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-green text-green"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                } disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:text-gray-300`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {!activeConfig.endpoint ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            এই ট্যাবের API endpoint এখনো দেওয়া হয়নি।
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        ) : loading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
            ডাটা লোড হচ্ছে...
          </div>
        ) : notice ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            {notice}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            কোনো ক্রয় অর্ডার পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Products</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => {
                    const orderId = getOrderId(row);
                    const items = getItems(row);
                    const status = getStatus(row);

                    return (
                      <tr key={orderId || JSON.stringify(row)} className="align-top">
                        <td className="px-4 py-4 font-medium text-gray-900">
                          {row?.orderId || orderId || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-gray-700">{getBuyerName(row)}</td>
                        <td className="px-4 py-4 text-gray-700">
                          <div className="space-y-1">
                            {items.length ? (
                              items.map((item, index) => (
                                <div key={`${orderId}-${index}`}>
                                  {getProductName(item)}
                                  {item?.quantity ? ` x ${item.quantity}` : ""}
                                </div>
                              ))
                            ) : (
                              <span>পণ্য নেই</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-green">
                          ৳ {Number(row?.totalAmount || row?.totalPrice || row?.subtotal || 0).toLocaleString("bn-BD")}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold capitalize text-yellow-700">
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={status}
                            disabled={busyId === orderId}
                            onChange={(event) => handleStatusChange(row, event.target.value)}
                            className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-green disabled:opacity-60"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
