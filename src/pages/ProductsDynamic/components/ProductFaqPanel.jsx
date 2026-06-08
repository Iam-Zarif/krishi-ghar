import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createFaq, getFaqs } from "../../../api/faq";

// eslint-disable-next-line react/prop-types
const ProductFaqPanel = ({
  initialFaqs = [],
  token = "",
  onAuthRequired,
  onFaqCountChange,
}) => {
  const [faqItems, setFaqItems] = useState(initialFaqs);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [faqError, setFaqError] = useState("");
  const [submittingFaq, setSubmittingFaq] = useState(false);

  useEffect(() => {
    setFaqItems(initialFaqs);
    setFaqQuestion("");
  }, [initialFaqs]);

  useEffect(() => {
    onFaqCountChange?.(faqItems.length);
  }, [faqItems.length, onFaqCountChange]);

  useEffect(() => {
    let isCancelled = false;

    const loadFaqs = async () => {
      try {
        setLoadingFaqs(true);
        setFaqError("");
        const nextFaqs = await getFaqs();
        if (!isCancelled) {
          setFaqItems(nextFaqs);
        }
      } catch (error) {
        if (!isCancelled) {
          setFaqItems(initialFaqs);
          setFaqError(
            error?.response?.data?.message || "প্রশ্নোত্তর লোড করা যায়নি।",
          );
        }
      } finally {
        if (!isCancelled) {
          setLoadingFaqs(false);
        }
      }
    };

    loadFaqs();

    return () => {
      isCancelled = true;
    };
  }, [initialFaqs]);

  const submitQuestion = async () => {
    if (!token) {
      toast.error("প্রশ্ন করতে লগইন করুন");
      onAuthRequired?.();
      return;
    }

    if (!faqQuestion.trim()) {
      toast.error("প্রশ্ন লিখুন");
      return;
    }

    try {
      setSubmittingFaq(true);
      const createdFaq = await toast.promise(
        createFaq({
          token,
          payload: {
            question: faqQuestion.trim(),
          },
        }),
        {
          loading: "প্রশ্ন জমা হচ্ছে…",
          success: "প্রশ্ন জমা হয়েছে",
          error: (error) =>
            error?.response?.data?.message || "প্রশ্ন জমা দেওয়া যায়নি",
        },
      );

      setFaqItems((prev) => [createdFaq, ...prev]);
      setFaqQuestion("");
    } finally {
      setSubmittingFaq(false);
    }
  };

  return (
    <div className="space-y-4">
      {loadingFaqs ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-xl border p-3"
            >
              <div className="h-5 w-3/4 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-1/3 rounded bg-gray-100" />
              <div className="mt-3 h-4 w-20 rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {faqError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {faqError}
            </div>
          )}
        {faqItems.length > 0 ? (
          faqItems.map((faq) => (
            <div key={faq.id} className="rounded-xl border p-3">
              <p className="font-semibold text-gray-800">
                প্রশ্ন: {faq.question}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                করেছেন: {faq.askedBy} •{" "}
                {new Date(faq.askedAt).toLocaleDateString("bn-BD")}
              </p>
              {faq.answer ? (
                <p className="mt-2 text-sm text-gray-700">উত্তর: {faq.answer}</p>
              ) : (
                <p className="mt-2 inline-flex rounded-full bg-yellow/15 px-3 py-1 text-xs font-medium text-yellow">
                  উত্তর অপেক্ষমাণ
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed bg-white p-6 text-center text-sm text-gray-500">
            এখনো কোনও প্রশ্ন নেই।
          </div>
        )}
        </div>
      )}

      <div className="rounded-xl border bg-gray-50 p-4">
        <p className="font-semibold text-gray-800">আপনার প্রশ্ন করুন</p>
        <textarea
          value={faqQuestion}
          onChange={(e) => setFaqQuestion(e.target.value)}
          placeholder="প্রশ্ন লিখুন..."
          className="mt-3 w-full min-h-[110px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
        />
        <button
          type="button"
          onClick={submitQuestion}
          disabled={submittingFaq}
          className="mt-3 rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green/90 cursor-pointer"
        >
          {submittingFaq ? "জমা হচ্ছে..." : "প্রশ্ন জমা দিন"}
        </button>
      </div>
    </div>
  );
};

export default ProductFaqPanel;
