import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getBookingsByUser, cancelBooking } from "../../services/bookingService";
import { showConfirm, showAlert } from "../../context/ModalContext";

export default function UserBookings() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  const loadBookings = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userId = currentUser.id || currentUser.uid;
      const data = await getBookingsByUser(userId);
      setBookings(data);
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleCancel = async (bookingId) => {
    const isConfirmed = await showConfirm({
      title: "ยกเลิกคำขอจองห้องพัก",
      heading: "ต้องการยกเลิกคำขอจองห้องพักนี้ใช่ไหมครับ?",
      message: "หากยกเลิกแล้ว คำขอของคุณจะถูกระงับและไม่สามารถกู้คืนได้",
      confirmText: "ยืนยันยกเลิก",
      cancelText: "ปิด",
      type: "danger"
    });

    if (isConfirmed) {
      try {
        await cancelBooking(bookingId);
        await showAlert({
          title: "ยกเลิกคำขอเรียบร้อย",
          heading: "ยกเลิกการจองสำเร็จแล้ว",
          message: "ระบบได้ทำการปรับปรุงสถานะการจองของคุณเรียบร้อยแล้วครับ",
          type: "success"
        });
        loadBookings();
      } catch (err) {
        console.error("Error cancelling booking:", err);
        await showAlert({
          title: "เกิดข้อผิดพลาด",
          heading: "ไม่สามารถยกเลิกการจองได้",
          message: err.message || "",
          type: "danger"
        });
      }
    }
  };

  function formatThaiDate(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function formatDateTime(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function getStatusConfig(status) {
    switch (status) {
      case "approved":
        return {
          label: "จองแล้ว (อนุมัติ)",
          badgeClass: "approved",
          icon: "fa-solid fa-circle-check"
        };
      case "cancelled":
      case "rejected":
      case "available":
        return {
          label: "ยกเลิกคำขอ",
          badgeClass: "cancelled",
          icon: "fa-solid fa-circle-xmark"
        };
      case "completed":
        return {
          label: "เข้าพักแล้ว",
          badgeClass: "completed",
          icon: "fa-solid fa-house-circle-check"
        };
      case "pending":
      default:
        return {
          label: "รออนุมัติ",
          badgeClass: "pending",
          icon: "fa-regular fa-clock"
        };
    }
  }

  // Filter calculations
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const approvedCount = bookings.filter((b) => b.status === "approved").length;
  const cancelledCount = bookings.filter(
    (b) => b.status === "cancelled" || b.status === "rejected" || b.status === "available"
  ).length;

  const statusOptions = [
    { value: "all", label: "ทั้งหมด", count: bookings.length, circleColor: "#5b8e66" },
    { value: "pending", label: "รออนุมัติ", count: pendingCount, circleColor: "#eab308" },
    { value: "approved", label: "อนุมัติแล้ว", count: approvedCount, circleColor: "#16a34a" },
    { value: "cancelled", label: "ยกเลิกแล้ว", count: cancelledCount, circleColor: "#ef4444" }
  ];

  const currentOption = statusOptions.find((opt) => opt.value === statusFilter) || statusOptions[0];

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter === "pending") return booking.status === "pending";
    if (statusFilter === "approved") return booking.status === "approved";
    if (statusFilter === "cancelled")
      return booking.status === "cancelled" || booking.status === "rejected" || booking.status === "available";
    return true;
  });

  return (
    <div className="bookings-page-container">
      {/* Header Bar */}
      <div className="booking-header-bar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "22px", color: "#1e293b", fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>
              ห้องพักที่จองไว้
            </h1>
            {!loading && bookings.length > 0 && (
              <span
                style={{
                  background: "#eef6ee",
                  color: "#5b8e66",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "2px 10px",
                  borderRadius: "999px"
                }}
              >
                {bookings.length} รายการ
              </span>
            )}
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
            ติดตามและตรวจสอบสถานะคำขอจองห้องพักของคุณ
          </p>
        </div>
      </div>

      {/* Status Filter Dropdown */}
      {!loading && bookings.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div ref={statusDropdownRef} style={{ position: "relative", width: "240px", maxWidth: "100%" }}>
            <button
              type="button"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              style={{
                width: "100%",
                height: "40px",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 14px",
                background: "#ffffff",
                border: "1px solid",
                borderColor: statusDropdownOpen ? "#5b8e66" : "#cbd5e1",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                color: "#1e293b",
                boxShadow: statusDropdownOpen ? "0 0 0 3px rgba(91, 142, 102, 0.15)" : "none",
                transition: "all 0.15s ease",
                gap: "10px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, overflow: "hidden" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: currentOption.circleColor,
                    flexShrink: 0
                  }}
                ></span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {currentOption.label} ({currentOption.count})
                </span>
              </div>
              <i
                className="fa-solid fa-chevron-down"
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  flexShrink: 0,
                  transform: statusDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease"
                }}
              ></i>
            </button>

            {statusDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  width: "100%",
                  boxSizing: "border-box",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                  zIndex: 50,
                  padding: "4px 0"
                }}
              >
                {statusOptions.map((opt) => {
                  const isSelected = statusFilter === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setStatusDropdownOpen(false);
                      }}
                      style={{
                        padding: "9px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        background: isSelected ? "#f0fdf4" : "transparent",
                        color: isSelected ? "#166534" : "#1e293b",
                        fontSize: "13px",
                        fontWeight: isSelected ? 700 : 500,
                        transition: "background 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, overflow: "hidden" }}>
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: opt.circleColor,
                            flexShrink: 0
                          }}
                        ></span>
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {opt.label} ({opt.count})
                        </span>
                      </div>
                      {isSelected && (
                        <i className="fa-solid fa-check" style={{ color: "#166534", fontSize: "12px", flexShrink: 0 }}></i>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#7da27c" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "10px", fontSize: "20px" }}></i>
          กำลังโหลดข้อมูลการจองห้องพัก...
        </div>
      ) : bookings.length === 0 ? (
        <div
          className="content-card"
          style={{
            textAlign: "center",
            padding: "60px 20px",
            borderRadius: "16px",
            background: "#ffffff",
            border: "1px solid #eef2ed"
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "#f0fdf4",
              color: "#166534",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              marginBottom: "16px"
            }}
          >
            <i className="fa-regular fa-calendar-xmark"></i>
          </div>
          <h3 style={{ color: "#1e293b", margin: "0 0 6px 0", fontSize: "18px", fontWeight: 700 }}>
            ยังไม่มีรายการจองห้องพัก
          </h3>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: 0, marginBottom: "20px" }}>
            ยังไม่มีประวัติการจอง ลองเลือกดูหอพักที่ถูกใจแล้วกดจองห้องได้เลยครับ
          </p>
          <Link
            to="/dorms"
            style={{
              textDecoration: "none",
              background: "#7da27c",
              color: "#ffffff",
              padding: "10px 22px",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <i className="fa-solid fa-magnifying-glass"></i> ค้นหาหอพักเลย
          </Link>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div
          className="content-card"
          style={{
            textAlign: "center",
            padding: "50px 20px",
            borderRadius: "16px",
            background: "#ffffff",
            border: "1px solid #eef2ed"
          }}
        >
          <i
            className="fa-solid fa-filter-circle-xmark"
            style={{ fontSize: "36px", color: "#cbd5e1", marginBottom: "12px", display: "block" }}
          ></i>
          <h4 style={{ color: "#334155", margin: "0 0 6px 0", fontSize: "16px" }}>
            ไม่พบรายการในหมวดหมู่นี้
          </h4>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 16px 0" }}>
            ลองเลือกตัวกรองสถานะอื่น หรือดูรายการทั้งหมด
          </p>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            style={{
              background: "#f1f5f9",
              color: "#334155",
              border: "1px solid #e2e8f0",
              padding: "6px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            ดูรายการทั้งหมด
          </button>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="booking-cards-grid">
          {filteredBookings.map((booking) => {
            const statusCfg = getStatusConfig(booking.status);

            return (
              <div key={booking.id} className="booking-clean-card">
                {/* Card Header: Dorm avatar + Dorm Name + Status pill */}
                <div className="booking-card-header">
                  <div className="booking-card-dorm-info">
                    <div className="booking-dorm-avatar">
                      <i className="fa-solid fa-hotel"></i>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <Link
                        to={`/dorms/${booking.dormitoryId}`}
                        className="booking-dorm-name"
                        title={booking.dormitoryName || "หอพัก"}
                      >
                        {booking.dormitoryName || "หอพัก"}
                      </Link>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        รหัสการจอง #{String(booking.id).slice(-6)}
                      </span>
                    </div>
                  </div>

                  <span className={`booking-status-pill ${statusCfg.badgeClass}`}>
                    <i className={statusCfg.icon}></i>
                    <span>{statusCfg.label}</span>
                  </span>
                </div>

                {/* Card Body: Details */}
                <div className="booking-card-body">
                  <div className="booking-detail-row">
                    <i className="fa-solid fa-door-open"></i>
                    <div>
                      <span>ห้องพัก: </span>
                      <strong>{booking.roomNumber || "ห้องมาตรฐาน"}</strong>
                    </div>
                  </div>

                  <div className="booking-detail-row">
                    <i className="fa-regular fa-calendar-check"></i>
                    <div>
                      <span>วันที่ต้องการเข้าพัก: </span>
                      <strong style={{ color: "#0f172a" }}>{formatThaiDate(booking.bookingDate)}</strong>
                    </div>
                  </div>

                  {booking.note && (
                    <div className="booking-note-callout">
                      <i className="fa-solid fa-comment-dots"></i>
                      <div style={{ minWidth: 0, wordBreak: "break-word" }}>
                        <strong style={{ display: "block", marginBottom: "2px", color: "#1e293b", fontSize: "12px" }}>
                          ข้อความถึงเจ้าของ:
                        </strong>
                        {booking.note}
                      </div>
                    </div>
                  )}

                  {booking.createdAt && (
                    <div style={{ color: "#94a3b8", fontSize: "11.5px", marginTop: "2px", display: "flex", alignItems: "center", gap: "5px" }}>
                      <i className="fa-regular fa-clock" style={{ fontSize: "11px" }}></i>
                      <span>ส่งคำขอเมื่อ {formatDateTime(booking.createdAt)}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: View Dorm + Cancel button */}
                <div className="booking-card-footer">
                  <Link
                    to={`/dorms/${booking.dormitoryId}`}
                    className="booking-view-dorm-link"
                  >
                    <i className="fa-solid fa-eye"></i>
                    <span>ดูข้อมูลหอพัก</span>
                  </Link>

                  {booking.status === "pending" && (
                    <button
                      type="button"
                      className="booking-cancel-action-btn"
                      onClick={() => handleCancel(booking.id)}
                      title="ยกเลิกการจอง"
                    >
                      <i className="fa-solid fa-ban"></i>
                      <span>ยกเลิกคำขอ</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
