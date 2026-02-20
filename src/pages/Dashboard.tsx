import { Helmet } from "react-helmet-async";
import { EnhancedDashboard } from "@/components/dashboard/EnhancedDashboard";

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <EnhancedDashboard />
    </>
  );
};

export default Dashboard;