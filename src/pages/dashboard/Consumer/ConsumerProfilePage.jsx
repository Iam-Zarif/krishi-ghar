import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPackage,
  FiPhone,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { Api } from "../../../api/API";
import { createProductReview, getUserReviews } from "../../../api/reviews";
import { UserProfileContext } from "../../../providers/getUserProfile/getUserProfile";
import ChatWidget from "../supersaler/SupersalerOrders/ChatWidget";
import ProfileTab from "./components/ProfileTab";
import OrdersTab from "./components/OrdersTab";
import ReviewsTab from "./components/ReviewsTab";

const tabs = [
  { id: "profile", label: "প্রোফাইল" },
  { id: "orders", label: "অর্ডারসমূহ" },
  { id: "reviews", label: "আমার রিভিউ" },
];

const resolveUserName = (profile) =>
  profile?.username ||
  profile?.name ||
  profile?.userName ||
  profile?.fullName ||
  profile?.consumerName ||
  "";

const resolveUserNames = (profile, fallback = "") =>
  Array.from(
    new Set(
      [
        profile?.username,
        profile?.userName,
        profile?.name,
        profile?.fullName,
        profile?.consumerName,
        fallback,
      ]
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );

const orderStatuses = [
  {
    id: "completed",
    label: "সম্পন্ন",
    badgeClass: "bg-neutral-100 text-emerald-700",
    icon: FiCheckCircle,
  },
  {
    id: "pending",
    label: "অপেক্ষমাণ",
    badgeClass: "bg-amber-100 text-amber-700",
    icon: FiClock,
  },
  {
    id: "cancelled",
    label: "বাতিল",
    badgeClass: "bg-red-100 text-red-700",
    icon: FiXCircle,
  },
];

const mapOrderStatusToTab = (status) => {
  const value = String(status || "").toLowerCase();

  if (["completed", "complete", "delivered", "success"].includes(value)) {
    return "completed";
  }

  if (["cancelled", "canceled", "rejected", "failed"].includes(value)) {
    return "cancelled";
  }

  return "pending";
};

const normalizeOrderItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    const product =
      item?.productId && typeof item.productId === "object" ? item.productId : {};

    const quantity = Number(item?.quantity || 1) || 1;
    const unitPrice =
      Number(item?.price || item?.unitPrice || product?.price || 0) || 0;

    return {
      id: String(item?._id || product?._id || index),
      productId: String(product?._id || item?.productId || item?._id || index),
      name: item?.productName || product?.productName || product?.name || "পণ্য",
      quantity,
      price: unitPrice,
      image:
        item?.productImage ||
        product?.image ||
        "https://placehold.co/96x96?text=%E0%A6%A8%E0%A6%BE+%E0%A6%9B%E0%A6%AC%E0%A6%BF",
    };
  });
};

const normalizeOrders = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row, index) => ({
    id: String(row?.orderId || row?._id || "ORD-" + (index + 1)),
    status: mapOrderStatusToTab(row?.orderStatus || row?.status),
    date: row?.createdAt || row?.updatedAt || new Date().toISOString(),
    items: normalizeOrderItems(row?.items),
    totalAmount: Number(row?.totalAmount || row?.grandTotal || 0) || 0,
  }));
};

const STORAGE_KEYS = {
  activeTab: "consumerProfile.activeTab",
  orderTab: "consumerProfile.orderTab",
};

const getStoredTab = (key, fallback, validValues) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = window.localStorage.getItem(key);
  return validValues.includes(value) ? value : fallback;
};

const formatDate = (value) => {
  if (!value) {
    return "তারিখ পাওয়া যায়নি";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "তারিখ পাওয়া যায়নি";
  }

  return date.toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formatPrice = (value) => `৳ ${value.toLocaleString("bn-BD")}`;
const formatInvoiceMoney = (value) => `৳ ${value.toLocaleString("bn-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getOrderTotal = (order) =>
  order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const toPdfSafeText = (value, fallback = "N/A") => {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return fallback;
  }

  const safe = raw.replace(/[^\x00-\x7F]/g, "").trim();
  return safe || fallback;
};

const INVOICE_LOGO_PATH = "/photos/auth/brandLogo.svg";
const MISSING_PROFILE_TEXT = "দেওয়া হয়নি";

const getSvgLogoData = async (logoPath) => {
  try {
    const response = await fetch(logoPath);
    if (!response.ok) {
      return null;
    }

    const svgText = await response.text();
    const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = svgUrl;
    });

    const naturalWidth = image.naturalWidth || image.width || 240;
    const naturalHeight = image.naturalHeight || image.height || 78;
    const canvas = document.createElement("canvas");
    canvas.width = naturalWidth;
    canvas.height = naturalHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      URL.revokeObjectURL(svgUrl);
      return null;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(svgUrl);

    return {
      dataUrl: canvas.toDataURL("image/png"),
      width: naturalWidth,
      height: naturalHeight,
    };
  } catch {
    return null;
  }
};

const ConsumerProfilePage = () => {
  const { userProfile } = useContext(UserProfileContext);
  const [activeTab, setActiveTab] = useState(() =>
    getStoredTab(
      STORAGE_KEYS.activeTab,
      "profile",
      tabs.map((tab) => tab.id),
    ),
  );
  const [orderTab, setOrderTab] = useState(() =>
    getStoredTab(
      STORAGE_KEYS.orderTab,
      "completed",
      orderStatuses.map((status) => status.id),
    ),
  );
  const token = localStorage.getItem("token") || Cookies.get("token");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [ordersReloadTick, setOrdersReloadTick] = useState(0);
  const [activeChatOrder, setActiveChatOrder] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewsReloadTick, setReviewsReloadTick] = useState(0);
  const [submittingReviewKey, setSubmittingReviewKey] = useState("");

  const hasApiConsumerProfile =
    !!userProfile &&
    typeof userProfile === "object" &&
    (String(userProfile.role || "").toLowerCase() === "consumer" || !!userProfile._id);

  const profileForView = useMemo(() => {
    const phone = userProfile?.phone ? String(userProfile.phone) : "";
    const generatedUsername = phone ? "ক্রেতা-" + phone.slice(-4) : "";

    return {
      name: userProfile?.name || MISSING_PROFILE_TEXT,
      username: userProfile?.username || generatedUsername || MISSING_PROFILE_TEXT,
      email: userProfile?.email || MISSING_PROFILE_TEXT,
      phone: phone || MISSING_PROFILE_TEXT,
      joined: userProfile?.createdAt || userProfile?.joined || "",
      avatar: hasApiConsumerProfile ? userProfile?.image || "" : "",
    };
  }, [hasApiConsumerProfile, userProfile]);

  const profileAddresses = useMemo(() => {
    const addressLine = [
      userProfile?.address,
      userProfile?.thana,
      userProfile?.district,
      userProfile?.division,
    ]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(", ");

    if (!addressLine) {
      return [];
    }

    return [
      {
        label: "প্রোফাইল ঠিকানা",
        line: addressLine,
        mapLink: `https://maps.google.com/?q=${encodeURIComponent(addressLine)}`,
      },
    ];
  }, [userProfile]);

  const userName = useMemo(
    () => resolveUserName(userProfile) || profileForView.username,
    [profileForView.username, userProfile],
  );
  const userNames = useMemo(
    () => resolveUserNames(userProfile, profileForView.username),
    [profileForView.username, userProfile],
  );

  const [userReviews, setUserReviews] = useState([]);

  const existingReviewMap = useMemo(
    () =>
      userReviews.reduce((acc, review) => {
        const key = String(review.productId || "");
        if (!key) return acc;
        acc[key] = {
          rating: review.rating,
          feedback: review.comment,
          date: review.date,
        };
        return acc;
      }, {}),
    [userReviews],
  );

  const [draftReviews, setDraftReviews] = useState({});
  const [submittedReviews, setSubmittedReviews] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.activeTab, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.orderTab, orderTab);
  }, [orderTab]);

  useEffect(() => {
    setSubmittedReviews(existingReviewMap);
  }, [existingReviewMap]);

  useEffect(() => {
    if (!token) {
      setOrders([]);
      setOrdersLoading(false);
      setOrdersError("অর্ডার দেখতে লগইন করুন");
      return;
    }

    let isCancelled = false;
    setOrdersLoading(true);
    setOrdersError("");

    axios
      .get(Api + "/api/v1/order", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => {
        if (isCancelled) return;
        const payload = res?.data?.data || res?.data || {};
        const list = Array.isArray(payload?.orders) ? payload.orders : [];
        setOrders(normalizeOrders(list));
      })
      .catch((err) => {
        if (isCancelled) return;
        const message = err?.response?.data?.message || "অর্ডার লোড করা যায়নি";
        setOrdersError(message);
        setOrders([]);
      })
      .finally(() => {
        if (!isCancelled) {
          setOrdersLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [token, ordersReloadTick]);

  useEffect(() => {
    if (!token || !userName) {
      setUserReviews([]);
      setReviewsLoading(false);
      setReviewsError("রিভিউ দেখতে লগইন করুন");
      return;
    }

    let isCancelled = false;
    setReviewsLoading(true);
    setReviewsError("");

    getUserReviews({ token, userName, userNames })
      .then((reviews) => {
        if (isCancelled) return;
        setUserReviews(reviews);
      })
      .catch((err) => {
        if (isCancelled) return;
        setReviewsError(
          err?.response?.data?.message || "রিভিউ লোড করা যায়নি",
        );
        setUserReviews([]);
      })
      .finally(() => {
        if (!isCancelled) {
          setReviewsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [token, userName, userNames, reviewsReloadTick]);

  const orderStats = useMemo(() => {
    const stats = orders.reduce(
      (acc, order) => {
        acc.totalOrders += 1;
        acc.totalSpend += getOrderTotal(order);
        acc[`${order.status}Orders`] += 1;
        return acc;
      },
      {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        totalSpend: 0,
      },
    );

    return stats;
  }, [orders]);

  const ordersByStatus = useMemo(
    () => orders.filter((order) => order.status === orderTab),
    [orders, orderTab],
  );

  const reviewCandidates = useMemo(
            () =>
              orders
                .filter((order) => order.status === "completed")
                .flatMap((order) =>
                  order.items.map((item) => ({
            key: String(item.productId || `${order.id}-${item.id}`),
            orderId: order.id,
            item,
            orderDate: order.date,
          })),
        ),
    [orders],
  );

  const pendingReviewCandidates = useMemo(
    () =>
      reviewCandidates.filter(
        ({ key }) => !submittedReviews[String(key || "")],
      ),
    [reviewCandidates, submittedReviews],
  );

  const handleReviewDraft = (key, rating, feedback) => {
    setDraftReviews((prev) => ({
      ...prev,
      [key]: {
        rating,
        feedback,
      },
    }));
  };

  const handleReviewSubmit = async (key, item) => {
    const draft = draftReviews[key];
    if (!draft?.rating || !draft?.feedback?.trim() || !item?.productId) {
      return;
    }

    try {
      setSubmittingReviewKey(key);
      const createdReview = await createProductReview({
        token,
        payload: {
          userName,
          name: profileForView.name,
          userId: userProfile?._id,
          rating: draft.rating,
          comment: draft.feedback.trim(),
          productId: item.productId,
        },
      });

      setSubmittedReviews((prev) => ({
        ...prev,
        [key]: {
          rating: createdReview.rating,
          feedback: createdReview.comment,
          date: createdReview.date,
        },
      }));
      setUserReviews((prev) => {
        const next = prev.filter(
          (review) => String(review.productId || "") !== String(item.productId),
        );
        return [...next, createdReview];
      });
    } finally {
      setSubmittingReviewKey("");
    }
  };

  const handleInvoiceDownload = async (order) => {
    const [{ jsPDF }, autoTableModule] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const autoTable = autoTableModule.default || autoTableModule.autoTable;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();
    const subtotal = getOrderTotal(order);
    const shipping = 80;
    const grandTotal = subtotal + shipping;
    const billingAddressLine = profileAddresses[0]?.line || MISSING_PROFILE_TEXT;

    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 90, "F");

    const logo = await getSvgLogoData(INVOICE_LOGO_PATH);
    if (logo) {
      const maxLogoWidth = 132;
      const maxLogoHeight = 38;
      const scale = Math.min(maxLogoWidth / logo.width, maxLogoHeight / logo.height);
      const drawWidth = logo.width * scale;
      const drawHeight = logo.height * scale;

      doc.addImage(logo.dataUrl, "PNG", 40, 14, drawWidth, drawHeight);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("কৃষি ঘর - ইনভয়েস", 40, 72);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`ইনভয়েস নং: INV-${order.id}`, pageWidth - 200, 36);
    doc.text(`ইস্যু তারিখ: ${now.toLocaleDateString("bn-BD")}`, pageWidth - 200, 54);
    doc.text(
      `অর্ডারের তারিখ: ${new Date(order.date).toLocaleDateString("bn-BD")}`,
      pageWidth - 200,
      72,
    );

    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("বিল প্রাপক", 40, 125);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(toPdfSafeText(profileForView.name, "ক্রেতা"), 40, 144);
    doc.text(toPdfSafeText(profileForView.email), 40, 160);
    doc.text(toPdfSafeText(profileForView.phone), 40, 176);
    doc.text(toPdfSafeText(billingAddressLine), 40, 192);

    const tableRows = order.items.map((item, index) => {
      const lineTotal = item.price * item.quantity;
      return [
        String(index + 1),
        toPdfSafeText(item.name, `পণ্য ${index + 1}`),
        String(item.quantity),
        formatInvoiceMoney(item.price),
        formatInvoiceMoney(lineTotal),
      ];
    });

    autoTable(doc, {
      head: [["নং", "পণ্য", "পরিমাণ", "একক দাম", "লাইন মোট"]],
      body: tableRows,
      startY: 220,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 8,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 36 },
        2: { halign: "center", cellWidth: 50 },
        3: { halign: "right", cellWidth: 95 },
        4: { halign: "right", cellWidth: 95 },
      },
    });

    const tableEndY = doc.lastAutoTable?.finalY || 360;
    const summaryXLabel = pageWidth - 200;
    const summaryXValue = pageWidth - 40;
    const summaryStartY = tableEndY + 28;

    doc.setFont("helvetica", "normal");
    doc.text("সাবটোটাল:", summaryXLabel, summaryStartY);
    doc.text(formatInvoiceMoney(subtotal), summaryXValue, summaryStartY, {
      align: "right",
    });
    doc.text("শিপিং:", summaryXLabel, summaryStartY + 20);
    doc.text(formatInvoiceMoney(shipping), summaryXValue, summaryStartY + 20, {
      align: "right",
    });
    doc.setDrawColor(209, 213, 219);
    doc.line(summaryXLabel, summaryStartY + 30, summaryXValue, summaryStartY + 30);
    doc.setFont("helvetica", "bold");
    doc.text("মোট:", summaryXLabel, summaryStartY + 52);
    doc.text(formatInvoiceMoney(grandTotal), summaryXValue, summaryStartY + 52, {
      align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(
      "কৃষি ঘরে কেনাকাটার জন্য ধন্যবাদ। এটি সিস্টেম থেকে তৈরি ইনভয়েস।",
      40,
      790,
    );

    doc.save(`invoice-${order.id}.pdf`);
  };

  return (
    <div className="min-h-screen  pt-24 pb-10 px-4 lg:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl border border-neutral-100 bg-white/90 backdrop-blur p-4 sm:p-6 shadow-[0_10px_40px_rgba(16,24,40,0.06)]">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-emerald-50 text-emerald-700 hover:bg-neutral-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "profile" && (
          <ProfileTab
            profileForView={profileForView}
            orderStats={orderStats}
            formatDate={formatDate}
            formatPrice={formatPrice}
            addresses={profileAddresses}
          />
        )}

        {activeTab === "orders" && (
          <OrdersTab
            orderStatuses={orderStatuses}
            orderStats={orderStats}
            orderTab={orderTab}
            setOrderTab={setOrderTab}
            ordersLoading={ordersLoading}
            ordersError={ordersError}
            setOrdersReloadTick={setOrdersReloadTick}
            ordersByStatus={ordersByStatus}
            formatDate={formatDate}
            formatPrice={formatPrice}
            getOrderTotal={getOrderTotal}
            handleInvoiceDownload={handleInvoiceDownload}
            setActiveChatOrder={setActiveChatOrder}
            activeChatOrder={activeChatOrder}
            onCloseChat={() => setActiveChatOrder(null)}
          />
        )}

        {activeTab === "reviews" && (
          <ReviewsTab
            reviewsLoading={reviewsLoading}
            reviewsError={reviewsError}
            setReviewsReloadTick={setReviewsReloadTick}
            userReviews={userReviews}
            pendingReviewCandidates={pendingReviewCandidates}
            draftReviews={draftReviews}
            handleReviewDraft={handleReviewDraft}
            handleReviewSubmit={handleReviewSubmit}
            submittingReviewKey={submittingReviewKey}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
};

export default ConsumerProfilePage;
