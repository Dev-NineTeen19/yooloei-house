import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification
} from "../../services/notificationService";
import { showAlert, showConfirm } from "../../context/ModalContext";

export default function NotificationCenter({ title = "การแจ้งเตือน", subtitle = "อัปเดตและรายการแจ้งเตือนล่าสุดของคุณ" }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // 'all', 'unread', 'booking', 'chat', 'review'
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAllAsRead() {
    const isConfirmed = await showConfirm({
      title: "ทำเครื่องหมายอ่านทั้งหมด",
      heading: "ต้องการทำเครื่องหมายว่าอ่านทั้งหมดใช่หรือไม่?",
      confirmText: "อ่านทั้งหมด",
      cancelText: "ยกเลิก",
      type: "warning"
    });
    if (!isConfirmed) return;

    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
      await showAlert({
        title: "สำเร็จ",
        heading: "อ่านทั้งหมดเรียบร้อยแล้ว",
        type: "success"
      });
    } catch (err) {
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถอัปเดตสถานะได้",
        message: err.message || "",
        type: "danger"
      });
    }
  }

  async function handleNotificationClick(n) {
    if (n.is_read === 0) {
      try {
        await markNotificationAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, is_read: 1 } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marking read:", err);
      }
    }

    if (n.link) {
      navigate(n.link);
    } else {
      setExpandedId((prev) => (prev === n.id ? null : n.id));
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation();

    const isConfirmed = await showConfirm({
      title: "ลบการแจ้งเตือน",
      heading: "ต้องการลบการแจ้งเตือนนี้ใช่หรือไม่?",
      confirmText: "ลบ",
      cancelText: "ยกเลิก",
      type: "danger"
    });
    if (!isConfirmed) return;

    try {
      await deleteNotification(id);
      setNotifications((prev) => {
        const target = prev.find((item) => item.id === id);
        if (target && target.is_read === 0) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((item) => item.id !== id);
      });
      await showAlert({
        title: "สำเร็จ",
        heading: "ลบการแจ้งเตือนเรียบร้อยแล้ว",
        type: "success"
      });
    } catch (err) {
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถลบรายการได้",
        message: err.message || "",
        type: "danger"
      });
    }
  }

  function getTypeDetails(type) {
    switch (type) {
      case "chat":
        return {
          icon: "fa-regular fa-comment-dots",
          bg: "#f0f9ff",
          color: "#0284c7",
          label: "ข้อความ",
          actionText: "เปิดกล่องข้อความ"
        };
      case "review":
        return {
          icon: "fa-regular fa-star",
          bg: "#fffbeb",
          color: "#d97706",
          label: "รีวิว",
          actionText: "ดูรายละเอียด"
        };
      case "booking":
        return {
          icon: "fa-regular fa-calendar-check",
          bg: "#f0fdf4",
          color: "#15803d",
          label: "การจอง",
          actionText: "ดูข้อมูลการจอง"
        };
      case "dormitory":
        return {
          icon: "fa-regular fa-building",
          bg: "#faf5ff",
          color: "#7e22ce",
          label: "หอพัก",
          actionText: "ดูข้อมูลหอพัก"
        };
      default:
        return {
          icon: "fa-regular fa-bell",
          bg: "#f8fafc",
          color: "#64748b",
          label: "ระบบ",
          actionText: "ดูรายละเอียด"
        };
    }
  }

  function formatTime(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "เมื่อสักครู่";
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;

    return date.toLocaleString("th-TH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "unread") return n.is_read === 0;
    if (filterType === "booking") return n.type === "booking";
    if (filterType === "chat") return n.type === "chat";
    if (filterType === "review") return n.type === "review";
    return true;
  });

  const filterOptions = [
    { key: "all", label: "ทั้งหมด", count: notifications.length, icon: "fa-regular fa-bell" },
    { key: "unread", label: "ยังไม่อ่าน", count: unreadCount, icon: "fa-solid fa-circle-dot" },
    { key: "booking", label: "การจอง", count: notifications.filter((n) => n.type === "booking").length, icon: "fa-regular fa-calendar-check" },
    { key: "chat", label: "ข้อความ", count: notifications.filter((n) => n.type === "chat").length, icon: "fa-regular fa-comment-dots" },
    { key: "review", label: "รีวิว", count: notifications.filter((n) => n.type === "review").length, icon: "fa-regular fa-star" },
  ];
  const currentFilter = filterOptions.find((o) => o.key === filterType) || filterOptions[0];

  return (
    <div className="bookings-page-container">
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <h1 style={{ fontSize: "20px", color: "#1e293b", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px", letterSpacing: "-0.2px" }}>
          <i className="fa-regular fa-bell" style={{ color: "#5b8e66", fontSize: "18px" }}></i>
          <span>{title}</span>
          {unreadCount > 0 && (
            <span style={{ fontSize: "11px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2", padding: "1px 8px", borderRadius: "12px", fontWeight: 600 }}>
              {unreadCount} ใหม่
            </span>
          )}
        </h1>
        <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px", margin: 0 }}>{subtitle}</p>
      </div>

      {/* Control Bar: Dropdown on Left, Mark All Read on Right */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        {/* Filter Dropdown */}
        <div ref={filterDropdownRef} style={{ position: "relative", width: "175px" }}>
          <button
            type="button"
            onClick={() => setFilterDropdownOpen((prev) => !prev)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              padding: "7px 12px",
              background: "#ffffff",
              border: "1px solid",
              borderColor: filterDropdownOpen ? "#5b8e66" : "#e2e8f0",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#334155",
              cursor: "pointer",
              boxShadow: filterDropdownOpen ? "0 0 0 2px rgba(91, 142, 102, 0.15)" : "none",
              transition: "all 0.15s ease",
              boxSizing: "border-box"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, overflow: "hidden" }}>
              <i className={currentFilter.icon} style={{ color: "#5b8e66", fontSize: "13px", flexShrink: 0 }}></i>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentFilter.label}
                <span style={{ color: "#94a3b8", marginLeft: "4px", fontSize: "12px" }}>({currentFilter.count})</span>
              </span>
            </div>
            <i
              className="fa-solid fa-chevron-down"
              style={{
                fontSize: "10px",
                color: "#94a3b8",
                flexShrink: 0,
                transition: "transform 0.2s ease",
                transform: filterDropdownOpen ? "rotate(180deg)" : "none"
              }}
            ></i>
          </button>

          {filterDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                width: "100%",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.06)",
                zIndex: 100,
                padding: "4px",
                boxSizing: "border-box",
                overflow: "hidden"
              }}
            >
              {filterOptions.map((opt) => {
                const isSelected = filterType === opt.key;
                return (
                  <div
                    key={opt.key}
                    onClick={() => {
                      setFilterType(opt.key);
                      setFilterDropdownOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? "#5b8e66" : "#334155",
                      background: isSelected ? "#f0f7f1" : "transparent",
                      cursor: "pointer",
                      transition: "background 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <i className={opt.icon} style={{ fontSize: "12px", color: isSelected ? "#5b8e66" : "#94a3b8", width: "16px", textAlign: "center" }}></i>
                      <span>{opt.label}</span>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: "10px",
                        background: isSelected ? "#dcfce7" : "#f1f5f9",
                        color: isSelected ? "#15803d" : "#64748b"
                      }}
                    >
                      {opt.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mark All Read Button */}
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            style={{
              background: "#ffffff",
              color: "#5b8e66",
              border: "1px solid #e2e8f0",
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f0fdf4";
              e.currentTarget.style.borderColor = "#bbf7d0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <i className="fa-solid fa-check-double" style={{ fontSize: "11px" }}></i>
            <span>อ่านทั้งหมด</span>
          </button>
        )}
      </div>

      {/* Main Content Card Container */}
      <div className="content-card" style={{ borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9", background: "#ffffff" }}>
        <div className="content-card-body" style={{ padding: "16px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px 0", color: "#5b8e66" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "24px", marginBottom: "10px" }}></i>
              <div style={{ fontSize: "14px" }}>กำลังโหลดการแจ้งเตือน...</div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px" }}>
              <i className="fa-regular fa-bell-slash" style={{ fontSize: "40px", color: "#cbd5e1", marginBottom: "12px" }}></i>
              <h3 style={{ color: "#334155", fontSize: "15px", fontWeight: 600, margin: "0 0 6px 0" }}>ไม่มีรายการแจ้งเตือน</h3>
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
                {filterType === "unread" ? "คุณอ่านการแจ้งเตือนครบทั้งหมดแล้ว" : "เมื่อมีความเคลื่อนไหวหรือการอัปเดตใหม่ ระบบจะแจ้งเตือนให้คุณทราบที่นี่"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredNotifications.map((n) => {
                const isUnread = n.is_read === 0;
                const isExpanded = expandedId === n.id;
                const typeDetails = getTypeDetails(n.type);

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: isUnread ? "1px solid #e2e8f0" : "1px solid #f8fafc",
                      background: isUnread ? "#fafcf9" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      position: "relative"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isUnread ? "#f4f9f4" : "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isUnread ? "#fafcf9" : "#ffffff";
                    }}
                  >
                    {/* Notification Type Icon */}
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: typeDetails.bg,
                        color: typeDetails.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "15px",
                        flexShrink: 0,
                        marginTop: "2px"
                      }}
                    >
                      <i className={typeDetails.icon}></i>
                    </div>

                    {/* Main Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Top Row: Title + Badge + Right Actions (Time & Delete) */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "3px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: 0, fontSize: "14px", color: "#1e293b", fontWeight: isUnread ? 600 : 500, lineHeight: 1.4 }}>
                            {n.title}
                          </h4>
                          <span
                            style={{
                              fontSize: "10.5px",
                              background: typeDetails.bg,
                              color: typeDetails.color,
                              padding: "1px 6px",
                              borderRadius: "4px",
                              fontWeight: 500,
                              lineHeight: "14px"
                            }}
                          >
                            {typeDetails.label}
                          </span>
                        </div>

                        {/* Top-Right: Time & Delete & Unread indicator */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, marginLeft: "auto" }}>
                          {isUnread && (
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                background: "#5b8e66",
                                borderRadius: "50%",
                                display: "inline-block"
                              }}
                              title="ยังไม่ได้อ่าน"
                            />
                          )}
                          <span style={{ fontSize: "11.5px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                            {formatTime(n.created_at)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, n.id)}
                            style={{
                              background: "transparent",
                              color: "#94a3b8",
                              border: "none",
                              borderRadius: "6px",
                              width: "26px",
                              height: "26px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: "12px",
                              transition: "all 0.15s ease",
                              marginLeft: "2px"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#fef2f2";
                              e.currentTarget.style.color = "#ef4444";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "#94a3b8";
                            }}
                            title="ลบการแจ้งเตือน"
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </div>
                      </div>

                      {/* Message */}
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#64748b",
                          lineHeight: 1.5,
                          overflow: isExpanded ? "visible" : "hidden",
                          display: isExpanded ? "block" : "-webkit-box",
                          WebkitLineClamp: isExpanded ? "unset" : 2,
                          WebkitBoxOrient: "vertical"
                        }}
                      >
                        {n.message}
                      </p>

                      {/* Action Link Button */}
                      {n.link && (
                        <div style={{ marginTop: "8px" }}>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(n);
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#5b8e66",
                              background: "#f0f7f1",
                              padding: "3px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "all 0.15s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#e2efe4";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#f0f7f1";
                            }}
                          >
                            <span>{typeDetails.actionText}</span>
                            <i className="fa-solid fa-arrow-right" style={{ fontSize: "10px" }}></i>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
