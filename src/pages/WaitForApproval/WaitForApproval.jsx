
import { Link } from "react-router-dom";
import logo from "../../../public/photos/auth/brandLogo.svg";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const WaitForApproval = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-primary to-secondary text-center p-6">
      <h2 className="text-3xl font-bold text-textPrimary sm:text-4xl md:text-5xl">
        <span className="text-green">অ্যাডমিন</span>{" "}
        <span className="text-yellow">অনুমোদনের</span> জন্য অপেক্ষা করুন
      </h2>

      <p className="text-xl font-medium mt-2 sm:text-2xl md:text-3xl">
        প্রয়োজনে <span className="text-accent">কল</span> /{" "}
        <span className="text-warning">ইমেইল</span> করুন
      </p>

      <img
        src={logo}
        alt="অনুমোদনের জন্য অপেক্ষা"
        className="mt-6 rounded-full w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 shadow-xl"
      />

      <div className="mt-6 bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg flex flex-col gap-4 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 text-green-700 font-semibold">
          <FaPhoneAlt />
          <span>01822769722</span>
        </div>

        <div className="flex items-center justify-center gap-3 text-blue-600 font-semibold">
          <FaEnvelope />
          <span>admin@krishighar.com</span>
        </div>
      </div>

      <p className="text-textSecondary mt-4 text-lg sm:text-xl md:text-2xl">
        আপনার আবেদনটি পর্যালোচনাধীন রয়েছে। পরবর্তী নির্দেশনার জন্য অনুগ্রহ করে
        অপেক্ষা করুন।{" "}
        <Link to="/auth/login" className="text-blue-600 underline">
          লগইন
        </Link>
      </p>
    </div>
  );
};

export default WaitForApproval;

// krishighar
// {
//   "phone": "01822769722",
//   "password": "admin1234"
// }

