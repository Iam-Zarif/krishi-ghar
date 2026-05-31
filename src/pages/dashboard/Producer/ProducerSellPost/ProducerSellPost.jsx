import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { FiRefreshCw } from "react-icons/fi";
import { Api } from "../../../../api/API";
import { ApiPaths } from "../../../../api/apiPaths";
import SkeletonLoader from "../../../../components/common/SkeletonLoader";
import { normalizeProducerCategoryName, resolveProductImageUrl } from "../../../../utils/producerProduct";

const statusOptions = [
  { value: "", label: "সব" },
  { value: "pending", label: "অপেক্ষমাণ" },
  { value: "approved", label: "অনুমোদিত" },
  { value: "rejected", label: "বাতিল" },
];

const statusLabel = {
  pending: "অপেক্ষমাণ",
  approved: "অনুমোদিত",
  rejected: "বাতিল",
  completed: "সম্পন্ন",
};

const getToken = () => Cookies.get("token") || localStorage.getItem("token") || "";

const normalizeRequest = (request = {}) => {
  const product =
    request.product ||
    request.productId ||
    request.producerProduct ||
    request.item ||
    {};
  const productObject = product && typeof product === "object" ? product : {};
  const productId =
    productObject._id ||
    productObject.id ||
    request.product ||
    request.productId ||
    request._id;

  return {
    ...request,
    id: request._id || request.id || productId,
    productId,
    productName:
      request.productName ||
      request.name ||
      productObject.productName ||
      productObject.name ||
      "নামহীন পণ্য",
    description:
      request.description ||
      productObject.description ||
      "কোনো বিবরণ দেওয়া হয়নি।",
    image: resolveProductImageUrl(request.image || productObject.image, Api),
    categoryName: normalizeProducerCategoryName(
      request.category || productObject.category || request.categoryName,
    ),
    requestedQuantity: request.requestedQuantity ?? request.quantity ?? productObject.quantity ?? 1,
    requestedPrice: request.requestedPrice ?? request.price ?? productObject.price ?? "",
    status: String(request.status || "pending").toLowerCase(),
  };
};

const ProducerSellPost = () => {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [drafts, setDrafts] = useState({});

  const loadRequests = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      toast.error("লগইন করা প্রয়োজন");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const query = status ? `?status=${encodeURIComponent(status)}` : "";
      const { data } = await axios.get(`${Api}${ApiPaths.producer.sellingRequests}${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(data?.requests) ? data.requests : [];
      const normalized = list.map(normalizeRequest);
      setRequests(normalized);
      setDrafts(
        normalized.reduce((acc, item) => {
          acc[item.id] = {
            quantity: String(item.requestedQuantity || 1),
            price: String(item.requestedPrice || ""),
          };
          return acc;
        }, {}),
      );
    } catch (requestError) {
      const message = requestError?.response?.data?.message || "বিক্রির অনুরোধ লোড করা যায়নি";
      setError(message);
      setRequests([]);
      toast.error(message);
    } finally {
      setLoaded(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const sortedRequests = useMemo(
    () =>
      [...requests].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      ),
    [requests],
  );

  const updateDraft = (id, key, value) => {
    const numeric = value.replace(/[^0-9]/g, "");
    setDrafts((current) => ({
      ...current,
      [id]: { ...(current[id] || {}), [key]: numeric },
    }));
  };

  const confirmSelling = async (request) => {
    const token = getToken();
    const draft = drafts[request.id] || {};
    const quantity = Number(draft.quantity || 0);
    const price = Number(draft.price || 0);

    if (!request.productId) {
      toast.error("পণ্যের আইডি পাওয়া যায়নি");
      return;
    }
    if (!quantity || quantity <= 0) {
      toast.error("সঠিক পরিমাণ দিন");
      return;
    }
    if (!price || price <= 0) {
      toast.error("সঠিক মূল্য দিন");
      return;
    }

    try {
      setSavingId(request.id);
      await axios.put(
        `${Api}${ApiPaths.producer.confirmSelling(request.productId)}`,
        { quantity, price },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("বিক্রির অনুরোধ নিশ্চিত হয়েছে");
      loadRequests();
    } catch (confirmError) {
      toast.error(confirmError?.response?.data?.message || "অনুরোধ নিশ্চিত করা যায়নি");
    } finally {
      setSavingId("");
    }
  };

  const showSkeleton = loading || !loaded;

  return (
    <div className="w-full px-4 pt-6 pb-16">
      <Toaster />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-green">বিক্রির অনুরোধ</h1>
          <p className="mt-1 text-sm text-gray-500">
            ডকুমেন্টেড উৎপাদক বিক্রির অনুরোধ এপিআই থেকে পাওয়া তালিকা
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-green"
          >
            {statusOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadRequests}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:border-green cursor-pointer"
          >
            <FiRefreshCw />
            রিফ্রেশ
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {showSkeleton ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonLoader key={index} variant="reseller-card" />
          ))}
        </div>
      ) : sortedRequests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-gray-800">কোনো বিক্রির অনুরোধ নেই</p>
          <p className="mt-2 text-sm text-gray-500">
            নতুন অনুরোধ পাওয়া গেলে এখানে দেখা যাবে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {sortedRequests.map((request) => {
            const draft = drafts[request.id] || {};
            const canConfirm = request.status === "pending";
            return (
              <article
                key={request.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                  <img
                    src={request.image || "https://placehold.co/400x300?text=No+Image"}
                    alt={request.productName}
                    className="h-36 w-full rounded-xl object-cover sm:w-44"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="line-clamp-1 text-lg font-semibold text-gray-900">
                          {request.productName}
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">{request.categoryName}</p>
                      </div>
                      <span className="rounded-full bg-green/10 px-3 py-1 text-xs font-semibold text-green">
                        {statusLabel[request.status] || request.status}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
                      {request.description}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 border-t border-gray-100 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <label className="grid gap-1 text-sm font-medium text-gray-700">
                    পরিমাণ
                    <input
                      value={draft.quantity || ""}
                      onChange={(event) => updateDraft(request.id, "quantity", event.target.value)}
                      disabled={!canConfirm || savingId === request.id}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-green disabled:bg-gray-100"
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-gray-700">
                    মূল্য
                    <input
                      value={draft.price || ""}
                      onChange={(event) => updateDraft(request.id, "price", event.target.value)}
                      disabled={!canConfirm || savingId === request.id}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-green disabled:bg-gray-100"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => confirmSelling(request)}
                    disabled={!canConfirm || savingId === request.id}
                    className="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green/90 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {savingId === request.id ? "নিশ্চিত হচ্ছে..." : "নিশ্চিত করুন"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProducerSellPost;
