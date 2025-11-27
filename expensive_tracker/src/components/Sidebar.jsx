import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menus = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Transactions", path: "/expenses", icon: "💳" },
    { name: "Budget", path: "/budget", icon: "📊" },
    { name: "Savings", path: "/savings", icon: "💰" },
    { name: "Profile", path: "/profile", icon: "👤" },
  ];

  return (
    <div className="h-screen w-60 fixed left-0 top-0 flex flex-col bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 shadow-2xl">
      {/* Header with Gradient Accent */}
      <div className="px-6 py-6 border-b border-white border-opacity-20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
            <span className="text-2xl">📊</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Budget AI
          </h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menus.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out
              ${
                location.pathname === item.path
                  ? "bg-white bg-opacity-20 text-white shadow-lg backdrop-blur-md transform scale-105"
                  : "text-purple-100 hover:bg-white hover:bg-opacity-10 hover:text-white hover:translate-x-1"
              }
            `}
          >
            <span 
              className={`
                text-2xl transform transition-transform duration-300 
                ${location.pathname === item.path ? "scale-110" : "group-hover:scale-110"}
              `}
            >
              {item.icon}
            </span>
            <span className={`font-medium ${location.pathname === item.path ? "font-semibold" : ""}`}>
              {item.name}
            </span>
            {location.pathname === item.path && (
              <span className="ml-auto w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse"></span>
            )}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-4 pb-6 pt-4 border-t border-white border-opacity-20">
        <button
          onClick={() => {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("user");
            window.dispatchEvent(new Event("userLoggedOut"));
          }}
          className="group flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left
            bg-red-500 bg-opacity-10 text-red-300 hover:bg-red-500 hover:text-white
            transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105
            border border-red-400 border-opacity-30 hover:border-opacity-0"
        >
          <span className="text-xl transform group-hover:rotate-12 transition-transform duration-300">
            🚪
          </span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;