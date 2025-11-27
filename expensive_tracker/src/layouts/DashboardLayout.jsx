import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-60 w-full min-h-screen bg-gray-50 p-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
