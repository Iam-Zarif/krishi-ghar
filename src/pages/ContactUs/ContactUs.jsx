import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { FiPhone, FiMail, FiMapPin, FiMessageCircle } from "react-icons/fi";
import { usePageSeo } from "../../utils/seo";
import { UserProfileContext } from "../../providers/getUserProfile/getUserProfile";
import ChatSystem from "../../components/common/ChatSystem";

const ContactUs = () => {
  const { userProfile } = useContext(UserProfileContext);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [open, setOpen] = useState(null);
  const isConsumer = String(userProfile?.role || "").toLowerCase() === "consumer";

  usePageSeo({
    title: "যোগাযোগ করুন | কৃষিঘর",
    description:
      "কৃষিঘর সাপোর্ট, পার্টনারশিপ বা পণ্য সংক্রান্ত সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন।",
    keywords: "কৃষিঘর যোগাযোগ, কৃষি সাপোর্ট বাংলাদেশ",
    path: "/contact",
  });

  // eslint-disable-next-line react/prop-types
  const Info = ({ icon, title, text }) => (
    <div className="flex items-start gap-3 rounded-xl border bg-white p-4">
      <div className="p-2 rounded-lg bg-green/10 text-green">{icon}</div>
      <div>
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-gray-600 text-sm">{text}</p>
      </div>
    </div>
  );

  const faqs = [
    {
      q: "ডেলিভারিতে কত সময় লাগে?",
      a: "আপনার এলাকা ও সরবরাহকারীর অবস্থানের ওপর নির্ভর করে বেশিরভাগ অর্ডার ২-৫ দিনের মধ্যে পৌঁছে যায়।",
    },
    {
      q: "পণ্য ফেরত দেওয়া যাবে?",
      a: "হ্যাঁ, পণ্য ব্যবহার না করা হলে এবং আসল অবস্থায় থাকলে ডেলিভারির ৭ দিনের মধ্যে রিটার্ন অনুরোধ করা যাবে।",
    },
    {
      q: "বাল্ক অর্ডার করা যাবে?",
      a: "হ্যাঁ, আপনার প্রয়োজন জানালে আমরা সেই অনুযায়ী কোটেশন প্রস্তুত করব।",
    },
    {
      q: "কোন কোন পেমেন্ট পদ্ধতি আছে?",
      a: "ক্যাশ অন ডেলিভারি, মোবাইল পেমেন্ট এবং নির্দিষ্ট এলাকায় কার্ড পেমেন্ট সাপোর্ট করা হয়।",
    },
  ];

  return (
    <div className="pt-28 pb-20 bg-[#ffffde2e]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-semibold text-gray-800">
            যোগাযোগ করুন
          </h1>
          <p className="text-gray-600 mt-2">
            প্রশ্ন, পার্টনারশিপ বা সহায়তার জন্য আমাদের সাথে কথা বলুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-white p-6 sm:p-8">
            <div className="max-w-2xl">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green/10 text-green">
                <FiMessageCircle className="text-2xl" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-gray-800">
                লাইভ সাপোর্ট
              </h2>
              <p className="mt-3 text-gray-600">
                অর্ডার, পণ্য, পার্টনারশিপ বা অ্যাকাউন্ট সংক্রান্ত সহায়তার জন্য আমাদের সাপোর্ট টিমের সাথে কথা বলুন।
              </p>
              <div className="mt-6">
                {isConsumer ? (
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-green px-6 py-2.5 font-medium text-white transition hover:shadow-md"
                  >
                    <FiMessageCircle />
                    সাপোর্ট চ্যাট শুরু করুন
                  </button>
                ) : (
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-2 rounded-lg bg-green px-6 py-2.5 font-medium text-white transition hover:shadow-md"
                  >
                    লগইন করে সাপোর্ট নিন
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Info icon={<FiPhone />} title="ফোন" text="+880 1234-567890" />
            <Info
              icon={<FiMail />}
              title="ইমেইল"
              text="support@krishighar.com"
            />
            <Info
              icon={<FiMapPin />}
              title="ঠিকানা"
              text="ঢাকা, বাংলাদেশ"
            />
            <div className="rounded-2xl overflow-hidden border bg-white">
              <iframe
                title="মানচিত্র"
                loading="lazy"
                className="w-full h-[260px]"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.903316040933!2d90.391!3d23.750!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b0863b7f03%3A0x9a3c!2sDhaka!5e0!3m2!1sen!2sbd!4v1700000000000"
              />
            </div>
          </div>
        </div>

        <ChatSystem
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          initialSubject="সাপোর্ট যোগাযোগ"
          category="support"
        />

        <div className="mt-12 rounded-2xl border bg-white p-4 sm:p-6">
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-4">
            সাধারণ প্রশ্নোত্তর
          </h2>
          <div className="divide-y">
            {faqs.map((f, i) => (
              <button
                key={i}
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800">{f.q}</p>
                  <span className="text-green">{open === i ? "−" : "+"}</span>
                </div>
                {open === i && (
                  <p className="mt-2 text-gray-600 text-sm">{f.a}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
