import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { getNotifications } from "../../services/notificationService";

export default function Navbar() {
  const { currentUser, userData, userRole, logout } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!currentUser) return;

    async function loadUnreadCount() {
      try {
        const data = await getNotifications();
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        console.error("Failed to fetch unread notifications in navbar:", err);
      }
    }

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [currentUser, location.pathname]);

  // Handle click outside dropdown to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getDashboardPath = () => {
    if (userRole === "admin") return "/admin/dashboard";
    if (userRole === "owner") return "/owner/dashboard";
    return "/user/bookings";
  };

  const getProfilePath = () => {
    if (userRole === "admin") return "/admin/profile";
    if (userRole === "owner") return "/owner/profile";
    return "/user/profile";
  };

  const getNotificationPath = () => {
    if (userRole === "admin") return "/admin/notifications";
    if (userRole === "owner") return "/owner/notifications";
    return "/user/notifications";
  };

  const getRoleLabel = () => {
    if (userRole === "admin") return "ผู้ดูแลระบบ";
    if (userRole === "owner") return "เจ้าของหอพัก";
    return "สมาชิก";
  };

  const avatarSrc = userData?.avatarUrl || userData?.photoURL || userData?.avatar_url || "/images/default-avatar.jpg";
  const displayName = userData?.displayName || userData?.first_name || userData?.username || "ผู้ใช้งาน";
  const isDormDetailPage = location.pathname.startsWith('/dorms/') || location.pathname.startsWith('/dormitories/');

  return (
    <header className={isDormDetailPage ? "hide-on-dorm-detail-mobile" : ""}>
      <div className="navbar">
        {/* Mobile Hamburger Toggle (Mobile Only <= 768px) */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="เปิดเมนูนำทาง"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        {/* Logo */}
        <Link to="/" className="logo navbar-logo-link" style={{ textDecoration: "none" }}>
          <img
            src={settings.siteLogo || "/images/logo.png"}
            alt="Logo"
            className="navbar-logo-img"
            onError={(e) => { e.target.src = "/images/logo.png"; }}
          />
          <div className="logo-text">
            <h2>{settings.siteName || "อยู่เลย เฮาส์"}</h2>
            <span>{settings.siteNameEn || "YOOLOEI HOUSE"}</span>
          </div>
        </Link>

        {/* Menu */}
        <nav className="nav-menu">
          <Link to="/" style={{ color: location.pathname === "/" ? "var(--primary-color, #7da27c)" : undefined }}>
            หน้าแรก
          </Link>
          <Link to="/dorms" style={{ color: location.pathname === "/dorms" && !location.search.includes("latest") ? "var(--primary-color, #7da27c)" : undefined }}>
            ค้นหาหอพัก
          </Link>
          <Link to="/map" style={{ color: location.pathname === "/map" ? "var(--primary-color, #7da27c)" : undefined }}>
            แผนที่หอพัก
          </Link>
          <Link to="/dorms?sort=latest" style={{ color: location.pathname === "/dorms" && location.search.includes("latest") ? "var(--primary-color, #7da27c)" : undefined }}>
            หอพักล่าสุด
          </Link>
          <Link to="/about" style={{ color: location.pathname === "/about" ? "var(--primary-color, #7da27c)" : undefined }}>
            เกี่ยวกับเรา
          </Link>
          {userRole !== "admin" && (
            <Link to="/contact" style={{ color: location.pathname === "/contact" ? "var(--primary-color, #7da27c)" : undefined }}>
              ติดต่อ
            </Link>
          )}
        </nav>

        {/* User / Auth Menu */}
        <div className="nav-btn" style={{ alignItems: "center" }}>
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Notification Bell */}
              <button
                onClick={() => navigate(getNotificationPath())}
                style={{
                  position: "relative",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#333333",
                  borderRadius: "50%",
                  boxShadow: "none",
                  transform: "none",
                  outline: "none"
                }}
                className="navbar-bell-btn btn-no-hover"
                title="การแจ้งเตือน"
              >
                <i className="fa-solid fa-bell" style={{ fontSize: "20px", color: "#374151" }}></i>
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-2px",
                      backgroundColor: "#ef4444",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "700",
                      borderRadius: "9999px",
                      minWidth: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      lineHeight: "1",
                      border: "2px solid #ffffff"
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* User Profile Trigger & Dropdown */}
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    userSelect: "none",
                    padding: "4px 8px",
                    borderRadius: "24px",
                    transition: "all 0.2s ease"
                  }}
                  className="navbar-profile-trigger"
                >
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      backgroundColor: "#dce8d6",
                      border: "1px solid #cbd5e1"
                    }}
                    onError={(e) => {
                      e.target.src = "/images/default-avatar.jpg";
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "left" }}>
                    <span style={{ fontWeight: "700", fontSize: "15px", color: "#1e293b", lineHeight: "1.2" }}>
                      {displayName}
                    </span>
                    <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "400", marginTop: "2px" }}>
                      {getRoleLabel()}
                    </span>
                  </div>
                  <i
                    className="fa-solid fa-chevron-down"
                    style={{
                      fontSize: "13px",
                      color: "#94a3b8",
                      marginLeft: "4px",
                      transition: "transform 0.2s ease",
                      transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)"
                    }}
                  ></i>
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 10px)",
                      right: "0",
                      minWidth: "220px",
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e2e8f0",
                      zIndex: 1000,
                      padding: "8px 0",
                      overflow: "hidden"
                    }}
                  >
                    <div style={{ padding: "8px 16px 10px 16px", borderBottom: "1px solid #f1f5f9", marginBottom: "4px" }}>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>
                        {displayName}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {userData?.email || getRoleLabel()}
                      </div>
                    </div>

                    <Link
                      to={getProfilePath()}
                      onClick={() => setDropdownOpen(false)}
                      className="navbar-dropdown-item"
                    >
                      <i className="fa-solid fa-user" style={{ width: "20px", color: "#64748b" }}></i>
                      <span>โปรไฟล์ส่วนตัว</span>
                    </Link>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setDropdownOpen(false)}
                      className="navbar-dropdown-item"
                    >
                      <i
                        className={
                          userRole === "admin"
                            ? "fa-solid fa-chart-pie"
                            : userRole === "owner"
                            ? "fa-solid fa-building"
                            : "fa-solid fa-calendar-check"
                        }
                        style={{ width: "20px", color: "#64748b" }}
                      ></i>
                      <span>
                        {userRole === "admin"
                          ? "แดชบอร์ดแอดมิน"
                          : userRole === "owner"
                          ? "จัดการหอพัก"
                          : "ประวัติการจองห้องพัก"}
                      </span>
                    </Link>

                    {userRole === "admin" && (
                      <>
                        <Link
                          to="/admin/announcements"
                          onClick={() => setDropdownOpen(false)}
                          className="navbar-dropdown-item"
                        >
                          <i className="fa-solid fa-bullhorn" style={{ width: "20px", color: "#64748b" }}></i>
                          <span>ประกาศข่าวหน้าแรก</span>
                        </Link>
                        <Link
                          to="/admin/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="navbar-dropdown-item"
                        >
                          <i className="fa-solid fa-sliders" style={{ width: "20px", color: "#64748b" }}></i>
                          <span>ตั้งค่าระบบ</span>
                        </Link>
                      </>
                    )}

                    {userRole !== "admin" && userRole !== "owner" && (
                      <>
                        <Link
                          to="/user/favorites"
                          onClick={() => setDropdownOpen(false)}
                          className="navbar-dropdown-item"
                        >
                          <i className="fa-regular fa-heart" style={{ width: "20px", color: "#64748b" }}></i>
                          <span>หอพักที่บันทึกไว้</span>
                        </Link>
                        <Link
                          to="/user/history"
                          onClick={() => setDropdownOpen(false)}
                          className="navbar-dropdown-item"
                        >
                          <i className="fa-solid fa-clock-rotate-left" style={{ width: "20px", color: "#64748b" }}></i>
                          <span>ประวัติการดูหอพัก</span>
                        </Link>
                      </>
                    )}

                    <Link
                      to={getNotificationPath()}
                      onClick={() => setDropdownOpen(false)}
                      className="navbar-dropdown-item"
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <i className="fa-solid fa-bell" style={{ width: "20px", color: "#64748b" }}></i>
                        <span>การแจ้งเตือน</span>
                      </div>
                      {unreadCount > 0 && (
                        <span style={{ backgroundColor: "#ef4444", color: "#fff", fontSize: "11px", fontWeight: "bold", padding: "1px 7px", borderRadius: "10px" }}>
                          {unreadCount}
                        </span>
                      )}
                    </Link>

                    <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "6px 0" }}></div>

                    <button
                      onClick={handleLogout}
                      className="navbar-dropdown-item danger"
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket" style={{ width: "20px", color: "#ef4444" }}></i>
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <button className="btn-login">เข้าสู่ระบบ</button>
              </Link>
              <Link to="/register" style={{ textDecoration: "none" }}>
                <button className="btn-register">สมัครสมาชิก</button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Header Action Icons (Search, Heart, Bell) */}
        <div className="mobile-header-actions">
          <button
            type="button"
            className="mobile-header-icon-btn"
            onClick={() => navigate("/dorms")}
            aria-label="ค้นหาหอพัก"
            title="ค้นหาหอพัก"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>

          <button
            type="button"
            className="mobile-header-icon-btn"
            onClick={() => navigate(currentUser ? "/user/favorites" : "/login")}
            aria-label="หอพักที่บันทึกไว้"
            title="หอพักที่บันทึกไว้"
          >
            <i className="fa-regular fa-heart"></i>
          </button>

          <button
            type="button"
            className="mobile-header-icon-btn"
            onClick={() => navigate(currentUser ? getNotificationPath() : "/login")}
            aria-label="การแจ้งเตือน"
            title="การแจ้งเตือน"
            style={{ position: "relative" }}
          >
            <i className="fa-regular fa-bell"></i>
            {unreadCount > 0 && (
              <span className="mobile-bell-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer & Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              zIndex: 1000,
              backdropFilter: "blur(2px)",
              transition: "opacity 0.2s"
            }}
          />

          {/* Drawer Panel */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "280px",
              maxWidth: "82vw",
              backgroundColor: "#ffffff",
              zIndex: 1001,
              boxShadow: "4px 0 24px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              animation: "slideInLeft 0.25s ease-out"
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 18px",
                borderBottom: "1px solid #f1f5f9"
              }}
            >
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
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: "4px"
                }}
                aria-label="ปิดเมนู"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* User Info / Auth Buttons */}
            <div style={{ padding: "16px 18px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
              {currentUser ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #7da27c"
                    }}
                    onError={(e) => { e.target.src = "/images/default-avatar.jpg"; }}
                  />
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {getRoleLabel()}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "10px" }}>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "8px 0",
                      backgroundColor: "#ffffff",
                      border: "1.5px solid #7da27c",
                      borderRadius: "8px",
                      color: "#7da27c",
                      fontWeight: "600",
                      fontSize: "13px",
                      textDecoration: "none"
                    }}
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "8px 0",
                      backgroundColor: "#7da27c",
                      border: "1.5px solid #7da27c",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: "13px",
                      textDecoration: "none"
                    }}
                  >
                    สมัครสมาชิก
                  </Link>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: location.pathname === "/" ? "#7da27c" : "#334155",
                  fontWeight: location.pathname === "/" ? "700" : "500",
                  backgroundColor: location.pathname === "/" ? "#f0fdf4" : "transparent"
                }}
              >
                <i className="fa-solid fa-house" style={{ width: "20px" }}></i>
                <span>หน้าแรก</span>
              </Link>

              <Link
                to="/dorms"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: location.pathname === "/dorms" && !location.search.includes("latest") ? "#7da27c" : "#334155",
                  fontWeight: location.pathname === "/dorms" && !location.search.includes("latest") ? "700" : "500",
                  backgroundColor: location.pathname === "/dorms" && !location.search.includes("latest") ? "#f0fdf4" : "transparent"
                }}
              >
                <i className="fa-solid fa-magnifying-glass" style={{ width: "20px" }}></i>
                <span>ค้นหาหอพัก</span>
              </Link>

              <Link
                to="/map"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: location.pathname === "/map" ? "#7da27c" : "#334155",
                  fontWeight: location.pathname === "/map" ? "700" : "500",
                  backgroundColor: location.pathname === "/map" ? "#f0fdf4" : "transparent"
                }}
              >
                <i className="fa-solid fa-map-location-dot" style={{ width: "20px" }}></i>
                <span>แผนที่หอพัก</span>
              </Link>

              <Link
                to="/dorms?sort=latest"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: location.pathname === "/dorms" && location.search.includes("latest") ? "#7da27c" : "#334155",
                  fontWeight: location.pathname === "/dorms" && location.search.includes("latest") ? "700" : "500",
                  backgroundColor: location.pathname === "/dorms" && location.search.includes("latest") ? "#f0fdf4" : "transparent"
                }}
              >
                <i className="fa-solid fa-clock" style={{ width: "20px" }}></i>
                <span>หอพักล่าสุด</span>
              </Link>

              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: location.pathname === "/about" ? "#7da27c" : "#334155",
                  fontWeight: location.pathname === "/about" ? "700" : "500",
                  backgroundColor: location.pathname === "/about" ? "#f0fdf4" : "transparent"
                }}
              >
                <i className="fa-solid fa-circle-info" style={{ width: "20px" }}></i>
                <span>เกี่ยวกับเรา</span>
              </Link>

              {userRole !== "admin" && (
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: location.pathname === "/contact" ? "#7da27c" : "#334155",
                    fontWeight: location.pathname === "/contact" ? "700" : "500",
                    backgroundColor: location.pathname === "/contact" ? "#f0fdf4" : "transparent"
                  }}
                >
                  <i className="fa-solid fa-envelope" style={{ width: "20px" }}></i>
                  <span>ติดต่อเรา</span>
                </Link>
              )}

              {currentUser && (
                <>
                  <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "8px 0" }} />

                  {userRole !== "admin" && userRole !== "owner" && (
                    <>
                      <Link
                        to="/user/favorites"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: location.pathname === "/user/favorites" ? "#7da27c" : "#334155",
                          fontWeight: location.pathname === "/user/favorites" ? "700" : "500",
                          backgroundColor: location.pathname === "/user/favorites" ? "#f0fdf4" : "transparent"
                        }}
                      >
                        <i className="fa-regular fa-heart" style={{ width: "20px" }}></i>
                        <span>หอพักที่บันทึกไว้</span>
                      </Link>

                      <Link
                        to="/user/history"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: location.pathname === "/user/history" ? "#7da27c" : "#334155",
                          fontWeight: location.pathname === "/user/history" ? "700" : "500",
                          backgroundColor: location.pathname === "/user/history" ? "#f0fdf4" : "transparent"
                        }}
                      >
                        <i className="fa-solid fa-clock-rotate-left" style={{ width: "20px" }}></i>
                        <span>ประวัติการดูหอพัก</span>
                      </Link>
                    </>
                  )}

                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: location.pathname.includes("/dashboard") ? "#7da27c" : "#334155",
                      fontWeight: location.pathname.includes("/dashboard") ? "700" : "500",
                      backgroundColor: location.pathname.includes("/dashboard") ? "#f0fdf4" : "transparent"
                    }}
                  >
                    <i
                      className={
                        userRole === "admin"
                          ? "fa-solid fa-chart-column"
                          : userRole === "owner"
                          ? "fa-solid fa-chart-line"
                          : "fa-solid fa-calendar-check"
                      }
                      style={{ width: "20px" }}
                    />
                    <span>
                      {userRole === "admin"
                        ? "แดชบอร์ดแอดมิน"
                        : userRole === "owner"
                        ? "ภาพรวมหอพัก"
                        : "ประวัติการจองห้องพัก"}
                    </span>
                  </Link>

                  {userRole === "owner" && (
                    <>
                      <Link
                        to="/owner/dormitories"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: location.pathname === "/owner/dormitories" ? "#7da27c" : "#334155",
                          fontWeight: location.pathname === "/owner/dormitories" ? "700" : "500"
                        }}
                      >
                        <i className="fa-solid fa-building" style={{ width: "20px" }}></i>
                        <span>หอพักของฉัน</span>
                      </Link>
                      <Link
                        to="/owner/dormitories/create"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: location.pathname === "/owner/dormitories/create" ? "#7da27c" : "#334155",
                          fontWeight: location.pathname === "/owner/dormitories/create" ? "700" : "500"
                        }}
                      >
                        <i className="fa-solid fa-plus-circle" style={{ width: "20px" }}></i>
                        <span>ลงประกาศหอพักใหม่</span>
                      </Link>
                      <Link
                        to="/owner/rooms"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: location.pathname === "/owner/rooms" ? "#7da27c" : "#334155",
                          fontWeight: location.pathname === "/owner/rooms" ? "700" : "500"
                        }}
                      >
                        <i className="fa-solid fa-bed" style={{ width: "20px" }}></i>
                        <span>จัดการห้องพัก</span>
                      </Link>
                    </>
                  )}

                  {userRole === "admin" && (
                    <>
                      <Link
                        to="/admin/announcements"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: location.pathname === "/admin/announcements" ? "#7da27c" : "#334155",
                          fontWeight: location.pathname === "/admin/announcements" ? "700" : "500",
                          backgroundColor: location.pathname === "/admin/announcements" ? "#f0fdf4" : "transparent"
                        }}
                      >
                        <i className="fa-solid fa-bullhorn" style={{ width: "20px" }}></i>
                        <span>ประกาศข่าวหน้าแรก</span>
                      </Link>
                      <Link
                        to="/admin/dormitories"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: location.pathname === "/admin/dormitories" ? "#7da27c" : "#334155",
                          fontWeight: location.pathname === "/admin/dormitories" ? "700" : "500"
                        }}
                      >
                        <i className="fa-solid fa-hotel" style={{ width: "20px" }}></i>
                        <span>ตรวจสอบหอพัก</span>
                      </Link>
                      <Link
                        to="/admin/locations"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: location.pathname === "/admin/locations" ? "#7da27c" : "#334155",
                          fontWeight: location.pathname === "/admin/locations" ? "700" : "500"
                        }}
                      >
                        <i className="fa-solid fa-map-location-dot" style={{ width: "20px" }}></i>
                        <span>จัดการพื้นที่ / ประเภทห้อง</span>
                      </Link>
                      <Link
                        to="/admin/users"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: location.pathname === "/admin/users" ? "#7da27c" : "#334155",
                          fontWeight: location.pathname === "/admin/users" ? "700" : "500"
                        }}
                      >
                        <i className="fa-solid fa-users" style={{ width: "20px" }}></i>
                        <span>จัดการผู้ใช้งาน</span>
                      </Link>
                      <Link
                        to="/admin/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          color: location.pathname === "/admin/settings" ? "#7da27c" : "#334155",
                          fontWeight: location.pathname === "/admin/settings" ? "700" : "500",
                          backgroundColor: location.pathname === "/admin/settings" ? "#f0fdf4" : "transparent"
                        }}
                      >
                        <i className="fa-solid fa-sliders" style={{ width: "20px" }}></i>
                        <span>ตั้งค่าระบบ</span>
                      </Link>
                    </>
                  )}

                  <Link
                    to={getProfilePath()}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: location.pathname.includes("/profile") ? "#7da27c" : "#334155",
                      fontWeight: location.pathname.includes("/profile") ? "700" : "500",
                      backgroundColor: location.pathname.includes("/profile") ? "#f0fdf4" : "transparent"
                    }}
                  >
                    <i className="fa-solid fa-user" style={{ width: "20px" }}></i>
                    <span>โปรไฟล์ส่วนตัว</span>
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "none",
                      background: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginTop: "4px"
                    }}
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket" style={{ width: "20px" }}></i>
                    <span>ออกจากระบบ</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
