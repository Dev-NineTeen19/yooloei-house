import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function BottomNavbar() {
  const location = useLocation();
  const { currentUser, userData, userRole } = useAuth();

  const getProfilePath = () => {
    if (!currentUser) return "/login";
    if (userRole === "admin") return "/admin/profile";
    if (userRole === "owner") return "/owner/profile";
    return "/user/profile";
  };

  const getMessagePath = () => {
    if (!currentUser) return "/login";
    if (userRole === "admin") return "/admin/messages";
    if (userRole === "owner") return "/owner/messages";
    return "/user/messages";
  };

  const avatarSrc = userData?.avatarUrl || userData?.photoURL || userData?.avatar_url;

  return (
    <nav className="mobile-bottom-nav">
      {/* 1. หน้าแรก */}
      <Link
        to="/"
        className={`bottom-nav-item ${location.pathname === "/" ? "active" : ""}`}
      >
        <i className="fa-solid fa-house"></i>
        <span>หน้าแรก</span>
      </Link>

      {/* 2. ค้นหาหอพัก */}
      <Link
        to="/dorms"
        className={`bottom-nav-item ${location.pathname === "/dorms" ? "active" : ""}`}
      >
        <i className="fa-solid fa-bed"></i>
        <span>ค้นหาหอพัก</span>
      </Link>

      {/* 3. โปรไฟล์ (Center elevated arch & circle) */}
      <Link
        to={getProfilePath()}
        className={`bottom-nav-item bottom-nav-center-item ${
          location.pathname.includes("/profile") || location.pathname === "/login" ? "active" : ""
        }`}
      >
        <div className="bottom-nav-center-arch">
          <div className="bottom-nav-avatar-circle">
            {currentUser && avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Avatar"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              <i className="fa-solid fa-user"></i>
            )}
          </div>
        </div>
        <span>โปรไฟล์</span>
      </Link>

      {/* 4. แชทข้อความ */}
      <Link
        to={getMessagePath()}
        className={`bottom-nav-item ${location.pathname.includes("/messages") ? "active" : ""}`}
      >
        <i className="fa-solid fa-comments"></i>
        <span>แชทข้อความ</span>
      </Link>

      {/* 5. ติดต่อ / แดชบอร์ด (ถ้าเป็นแอดมิน) */}
      {userRole === "admin" ? (
        <Link
          to="/admin/dashboard"
          className={`bottom-nav-item ${location.pathname.includes("/admin") ? "active" : ""}`}
        >
          <i className="fa-solid fa-chart-simple"></i>
          <span>แดชบอร์ด</span>
        </Link>
      ) : (
        <Link
          to="/contact"
          className={`bottom-nav-item ${location.pathname === "/contact" ? "active" : ""}`}
        >
          <i className="fa-solid fa-phone"></i>
          <span>ติดต่อ</span>
        </Link>
      )}
    </nav>
  );
}
