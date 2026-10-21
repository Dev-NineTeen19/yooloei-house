import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { getNotifications } from "../../services/notificationService";

export default function Sidebar({ isOpen, onClose }) {
  const { userData, userRole, logout } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadUnreadCount() {
      try {
        const data = await getNotifications();
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        console.error("Failed to load unread count in sidebar:", err);
      }
    }

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 10000); // refresh every 10 seconds
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      if (onClose) onClose();
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getRoleLabel = () => {
    if (userRole === "admin") return "ผู้ดูแลระบบ";
    if (userRole === "owner") return "เจ้าของหอพัก";
    return "ผู้เช่าหอพัก";
  };

  // เมนูของ User (ผู้เช่าหอพัก)
  const userMenuItems = [
    { to: "/user/notifications", label: "การแจ้งเตือน", icon: "fa-solid fa-bell", badge: unreadCount },
    { to: "/user/profile", label: "ข้อมูลส่วนตัว", icon: "fa-solid fa-user" },
    { to: "/user/messages", label: "แชทข้อความ", icon: "fa-solid fa-comments" },
    { to: "/user/history", label: "ประวัติการดูหอพัก", icon: "fa-solid fa-clock-rotate-left" },
    { to: "/user/bookings", label: "ห้องพักที่จองไว้", icon: "fa-solid fa-calendar-check" },
  ];

  // เมนูของ Owner (เจ้าของหอพัก)
  const ownerMenuItems = [
    { to: "/owner/notifications", label: "การแจ้งเตือน", icon: "fa-solid fa-bell", badge: unreadCount },
    { to: "/owner/profile", label: "ข้อมูลส่วนตัว", icon: "fa-solid fa-user-gear" },
    { to: "/owner/messages", label: "แชทข้อความ", icon: "fa-solid fa-comments" },
    { to: "/owner/dashboard", label: "ภาพรวมหอพัก", icon: "fa-solid fa-chart-line" },
    { to: "/owner/history", label: "ประวัติการดูหอพัก", icon: "fa-solid fa-clock-rotate-left" },
    { to: "/owner/dormitories", label: "หอพักของฉัน", icon: "fa-solid fa-building" },
    { to: "/owner/dormitories/create", label: "ลงประกาศหอพักใหม่", icon: "fa-solid fa-plus-circle" },
    { to: "/owner/rooms", label: "จัดการห้องพัก", icon: "fa-solid fa-bed" },
    { to: "/owner/bookings", label: "รายการจองห้อง", icon: "fa-solid fa-calendar-days" },
    { to: "/owner/reviews", label: "รีวิวจากผู้เช่า", icon: "fa-solid fa-star-half-stroke" }
  ];

  // เมนูของ Admin (ผู้ดูแลระบบ)
  const adminMenuItems = [
    { to: "/admin/notifications", label: "การแจ้งเตือน", icon: "fa-solid fa-bell", badge: unreadCount },
    { to: "/admin/profile", label: "ข้อมูลส่วนตัว", icon: "fa-solid fa-user-shield" },
    { to: "/admin/messages", label: "แชทข้อความ", icon: "fa-solid fa-comments" },
    { to: "/admin/history", label: "ประวัติการดูหอพัก", icon: "fa-solid fa-clock-rotate-left" },
    { to: "/admin/dashboard", label: "สถิติภาพรวม", icon: "fa-solid fa-chart-column" },
    { to: "/admin/announcements", label: "ประกาศข่าวหน้าแรก", icon: "fa-solid fa-bullhorn" },
    { to: "/admin/dormitories", label: "ตรวจสอบหอพัก", icon: "fa-solid fa-hotel" },
    { to: "/admin/locations", label: "จัดการพื้นที่ / ประเภทห้อง", icon: "fa-solid fa-map-location-dot" },
    { to: "/admin/users", label: "จัดการผู้ใช้งาน", icon: "fa-solid fa-users" },
    { to: "/admin/owners", label: "จัดการเจ้าของหอ", icon: "fa-solid fa-user-tie" },
    { to: "/admin/bookings", label: "การจองทั้งหมด", icon: "fa-solid fa-clipboard-list" },
    { to: "/admin/reviews", label: "รีวิวจากผู้เช่า", icon: "fa-solid fa-comments" },
    { to: "/admin/reports", label: "รายงานปัญหา", icon: "fa-solid fa-flag" },
    { to: "/admin/logs", label: "บันทึกกิจกรรม", icon: "fa-solid fa-clock-rotate-left" },
    { to: "/admin/settings", label: "ตั้งค่าระบบ", icon: "fa-solid fa-sliders" }
  ];

  let menuItems = userMenuItems;
  if (userRole === "owner") menuItems = ownerMenuItems;
  if (userRole === "admin") menuItems = adminMenuItems;

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}
      <aside className={`dashboard-sidebar ${isOpen ? "open" : ""}`}>
        {/* Drawer Header with Logo & Close button (Mobile Only) */}
        <div className="sidebar-drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={settings.siteLogo || "/images/logo.png"}
              alt="Logo"
              style={{ height: "32px", width: "auto" }}
              onError={(e) => { e.target.src = "/images/logo.png"; }}
            />
            <span style={{ fontWeight: "700", fontSize: "16px", color: "#1e293b" }}>
              {settings.siteName || "อยู่เลย เฮาส์"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            aria-label="ปิดเมนู"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* User Info Card (Mobile Only) */}
        <div className="sidebar-user-card">
          <img
            src={userData?.photoURL || userData?.avatarUrl || userData?.avatar_url || "/images/default-avatar.jpg"}
            alt="User Avatar"
            className="sidebar-user-avatar"
            onError={(e) => {
              e.target.src = "/images/default-avatar.jpg";
            }}
          />
          <div className="sidebar-user-info">
            <h4>{userData?.displayName || userData?.first_name || userData?.username || "ผู้ใช้งาน"}</h4>
            <span>{getRoleLabel()}</span>
          </div>
        </div>

        <div className="sidebar-scrollable-content">
          {/* Main Website Navigation Links (Mobile Only) */}
          <div className="sidebar-main-site-links sidebar-nav-section">
            <NavLink
              to="/"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
              onClick={() => { if (onClose) onClose(); }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <i className="fa-solid fa-house"></i>
                <span>หน้าแรก</span>
              </div>
            </NavLink>

            <NavLink
              to="/dorms"
              end
              className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
              onClick={() => { if (onClose) onClose(); }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <span>ค้นหาหอพัก</span>
              </div>
            </NavLink>

            <NavLink
              to="/map"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
              onClick={() => { if (onClose) onClose(); }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <i className="fa-solid fa-map-location-dot"></i>
                <span>แผนที่หอพัก</span>
              </div>
            </NavLink>

            <NavLink
              to="/dorms?sort=latest"
              className={() => `sidebar-nav-item ${location.pathname === "/dorms" && location.search.includes("latest") ? "active" : ""}`}
              onClick={() => { if (onClose) onClose(); }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <i className="fa-solid fa-clock"></i>
                <span>หอพักล่าสุด</span>
              </div>
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
              onClick={() => { if (onClose) onClose(); }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <i className="fa-solid fa-circle-info"></i>
                <span>เกี่ยวกับเรา</span>
              </div>
            </NavLink>
          </div>

          <div className="sidebar-mobile-divider sidebar-divider" />

          {/* Desktop & Mobile Dashboard Navigation Links (Shown on Desktop & Mobile) */}
          <div className="sidebar-nav-section" style={{ padding: "12px 10px" }}>
            {userRole !== "admin" && userRole !== "owner" && (
              <NavLink
                to="/user/favorites"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
                onClick={() => { if (onClose) onClose(); }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <i className="fa-regular fa-heart"></i>
                  <span>หอพักที่บันทึกไว้</span>
                </div>
              </NavLink>
            )}

            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/owner/dormitories" || item.to === "/admin/dormitories" || item.to.endsWith("/dashboard")}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  if (onClose) onClose();
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badge) && item.badge > 0 && (
                  <span className="sidebar-badge">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}

            <button className="sidebar-logout-item" onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
