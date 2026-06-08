import { Outlet } from "react-router-dom";
import LeftNavbar from "../../../../components/LeftNavbar/LeftNavbar";


const ProducerDashboard = () => {
  

  return (
    <div>
      <div className="flex pb-20 sm:pb-24 pt-16 max-w-7xl mx-auto items-start gap-4 lg:gap-10">
       <LeftNavbar/>

        <Outlet />
      </div>
    </div>
  );
};

export default ProducerDashboard;
