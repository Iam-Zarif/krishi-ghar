import { Outlet } from "react-router-dom";
import WholesalerLeftnav from "../../../components/WholesalerLeftnav/WholesalerLeftnav";

const WholesellerHome = () => {
  return (
    <div>
      <div className="flex pb-20 sm:pb-24 pt-16 max-w-7xl mx-auto items-start gap-4 lg:gap-10 ">
        <WholesalerLeftnav />
        <Outlet />
      </div>
    </div>
  );
};

export default WholesellerHome;
