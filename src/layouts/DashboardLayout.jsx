import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardMobileHeader from "../components/dashboard/DashboardMobileHeader";
import BottomNavbar from "../components/common/BottomNavbar";
import "../styles/dashboard.css";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMessagesPage = location.pathname.includes("/messages");

  useEffect(() => {
    if (isMessagesPage) {
      document.body.classList.add("messages-view-active");
    } else {
      document.body.classList.remove("messages-view-active");
    }
    return () => {
      document.body.classList.remove("messages-view-active");
    };
  }, [isMessagesPage]);

  return (
    <>
      <Navbar />
      <div className={`dashboard-layout ${isMessagesPage ? "messages-layout" : ""}`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="dashboard-main">
          {/* Mobile responsive header for Dashboard pages */}
          <DashboardMobileHeader />

          {/* Main Outlet */}
          <main className={`dashboard-content ${isMessagesPage ? "messages-content" : ""}`}>
            <Outlet />
          </main>
        </div>
      </div>
      <BottomNavbar />
    </>
  );
}
