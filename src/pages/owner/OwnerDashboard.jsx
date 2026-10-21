import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDormitoriesByOwner } from "../../services/dormitoryService";
import { getBookingsByOwner, updateBookingStatus } from "../../services/bookingService";
import { getRoomsByOwner } from "../../services/roomService";
import { showConfirm, showAlert } from "../../context/ModalContext";

export default function OwnerDashboard() {
  const { currentUser, userData } = useAuth();
  const [dorms, setDorms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const ownerId = currentUser.id || currentUser.uid;
      const [dormList, bookingList, roomList] = await Promise.all([
        getDormitoriesByOwner(ownerId),
        getBookingsByOwner(ownerId),
        getRoomsByOwner(ownerId)
      ]);
      setDorms(dormList || []);
      setBookings(bookingList || []);
      setRooms(roomList || []);
    } catch (err) {
      console.error("Error loading owner dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleUpdateStatus = async (bookingId, newStatus, tenantName) => {
    const statusLabel = newStatus === "approved" ? "อนุมัติการจอง" : "ปฏิเสธการจอง";
    const isConfirmed = await showConfirm({
      title: `${statusLabel}`,
      heading: `ต้องการ "${statusLabel}" ของ "${tenantName || 'ผู้เช่า'}" ใช่หรือไม่?`,
      confirmText: statusLabel,
      cancelText: "ยกเลิก",
      type: newStatus === "approved" ? "success" : "danger"
    });

    if (!isConfirmed) return;

    setActionLoadingId(bookingId);
    try {
      await updateBookingStatus(bookingId, newStatus);
      await showAlert({
        title: "สำเร็จ",
        heading: `${statusLabel} เรียบร้อยแล้ว!`,
        type: "success"
      });
      await loadData();
    } catch (err) {
      console.error("Error updating booking status:", err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถเปลี่ยนสถานะได้",
        message: err.message || "",
        type: "danger"
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const displayName = userData?.displayName || currentUser?.displayName || "คุณเจ้าของหอ";

  const getDormStatusBadge = (status) => {
    if (status === "approved") {
      return { label: "อนุมัติแล้ว", icon: "fa-circle-check", bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" };
    }
    if (status === "action_needed" || status === "rejected") {
      return { label: "ต้องแก้ไขพิกัด", icon: "fa-triangle-exclamation", bg: "#fef2f2", color: "#991b1b", border: "#fecaca" };
    }
    return { label: "รอตรวจสอบ", icon: "fa-clock", bg: "#fffbe6", color: "#b45309", border: "#fef08a" };
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Top Banner Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
          background: "linear-gradient(135deg, #ffffff 0%, #f7faf6 100%)",
          padding: "24px",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              color: "#1e293b",
              fontWeight: 800,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <i className="fa-solid fa-[#7da27c] fa-chart-line" style={{ color: "#7da27c" }}></i>
            ภาพรวมระบบ, {displayName}
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px", margin: "4px 0 0 0" }}>
            สรุปข้อมูลสถิติหอพัก การจองห้องพัก และคำขอจากผู้เช่าแบบเรียลไทม์
          </p>
        </div>

        <Link
          to="/owner/dormitories/create"
          className="btn-primary-action"
          style={{
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(125, 162, 124, 0.25)"
          }}
        >
          <i className="fa-solid fa-plus"></i> ลงประกาศหอพักใหม่
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px"
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #eef2ed",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#f0fdf4",
              color: "#166534",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              flexShrink: 0
            }}
          >
            <i className="fa-solid fa-building"></i>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>หอพักของฉัน</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#1e293b", marginTop: "2px" }}>
              {loading ? "-" : dorms.length} <span style={{ fontSize: "13px", fontWeight: 400, color: "#94a3b8" }}>แห่ง</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #eef2ed",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              flexShrink: 0
            }}
          >
            <i className="fa-solid fa-bed"></i>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>ห้องพักทั้งหมด</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#2563eb", marginTop: "2px" }}>
              {loading ? "-" : rooms.length} <span style={{ fontSize: "13px", fontWeight: 400, color: "#94a3b8" }}>ห้อง</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #eef2ed",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#fffbe6",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              flexShrink: 0
            }}
          >
            <i className="fa-solid fa-clock"></i>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>การจองรออนุมัติ</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#d97706", marginTop: "2px" }}>
              {loading ? "-" : pendingBookings.length} <span style={{ fontSize: "13px", fontWeight: 400, color: "#94a3b8" }}>รายการ</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #eef2ed",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#faf5ff",
              color: "#9333ea",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              flexShrink: 0
            }}
          >
            <i className="fa-solid fa-calendar-check"></i>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>การจองทั้งหมด</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#9333ea", marginTop: "2px" }}>
              {loading ? "-" : bookings.length} <span style={{ fontSize: "13px", fontWeight: 400, color: "#94a3b8" }}>รายการ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Bookings Section */}
      <div className="content-card" style={{ marginBottom: "28px" }}>
        <div className="content-card-header" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#1e293b" }}>
              คำขอจองห้องพักที่รอการอนุมัติ
            </h3>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                background: pendingBookings.length > 0 ? "#fffbe6" : "#f1f5f9",
                color: pendingBookings.length > 0 ? "#b45309" : "#64748b",
                padding: "2px 10px",
                borderRadius: "12px",
                border: pendingBookings.length > 0 ? "1px solid #fef08a" : "1px solid #e2e8f0"
              }}
            >
              {pendingBookings.length} รายการ
            </span>
          </div>
          <Link
            to="/owner/bookings"
            style={{ color: "#7da27c", textDecoration: "none", fontSize: "13.5px", fontWeight: 700 }}
          >
            ดูรายการจองทั้งหมด <i className="fa-solid fa-arrow-right" style={{ marginLeft: "4px" }}></i>
          </Link>
        </div>

        <div className="content-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#7da27c" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "8px" }}></i> กำลังโหลดข้อมูล...
            </div>
          ) : pendingBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
              <i className="fa-solid fa-calendar-check" style={{ fontSize: "36px", color: "#cbd5e1", marginBottom: "10px" }}></i>
              <p style={{ margin: 0, fontSize: "14px" }}>ไม่มีคำขอจองห้องพักที่รอการอนุมัติในขณะนี้</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="desktop-table-view table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ผู้ขอจอง</th>
                      <th>เบอร์โทรศัพท์</th>
                      <th>หอพัก</th>
                      <th>หมายเลขห้อง</th>
                      <th>วันที่ต้องการเข้าพัก</th>
                      <th style={{ textAlign: "center" }}>การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBookings.slice(0, 5).map((booking) => {
                      const tenantName = booking.userName || booking.userEmail || "ผู้เช่า";
                      const isBusy = actionLoadingId === booking.id;

                      return (
                        <tr key={booking.id} style={{ opacity: isBusy ? 0.6 : 1 }}>
                          <td>
                            <strong style={{ color: "#1e293b" }}>{tenantName}</strong>
                            {booking.userEmail && (
                              <div style={{ fontSize: "11px", color: "#94a3b8" }}>{booking.userEmail}</div>
                            )}
                          </td>
                          <td>{booking.userPhone || "-"}</td>
                          <td>{booking.dormitoryName}</td>
                          <td>
                            <span
                              style={{
                                background: "#f1f5f9",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 700
                              }}
                            >
                              ห้อง {booking.roomNumber}
                            </span>
                          </td>
                          <td style={{ fontSize: "13px", color: "#475569" }}>{booking.bookingDate || "-"}</td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleUpdateStatus(booking.id, "approved", tenantName)}
                                style={{
                                  background: "#f0fdf4",
                                  color: "#166534",
                                  border: "1px solid #bbf7d0",
                                  padding: "6px 12px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontSize: "12.5px",
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px"
                                }}
                              >
                                <i className="fa-solid fa-check"></i> อนุมัติ
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleUpdateStatus(booking.id, "rejected", tenantName)}
                                style={{
                                  background: "#fef2f2",
                                  color: "#dc2626",
                                  border: "1px solid #fecaca",
                                  padding: "6px 12px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontSize: "12.5px",
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px"
                                }}
                              >
                                <i className="fa-solid fa-xmark"></i> ปฏิเสธ
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="mobile-cards-view" style={{ padding: "12px" }}>
                {pendingBookings.slice(0, 5).map((booking) => {
                  const tenantName = booking.userName || booking.userEmail || "ผู้เช่า";
                  const isBusy = actionLoadingId === booking.id;

                  return (
                    <div
                      key={booking.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #eef2ed",
                        borderRadius: "12px",
                        padding: "12px 14px",
                        marginBottom: "10px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                        opacity: isBusy ? 0.6 : 1
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <div>
                          <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#1e293b" }}>
                            <i className="fa-solid fa-user me-1"></i> {tenantName}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                            <i className="fa-solid fa-phone me-1"></i> {booking.userPhone || "ไม่ระบุเบอร์โทร"}
                          </div>
                        </div>
                        <span
                          style={{
                            background: "#fffbe6",
                            color: "#b45309",
                            border: "1px solid #fef08a",
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "10px"
                          }}
                        >
                          รออนุมัติ
                        </span>
                      </div>

                      <div style={{ fontSize: "12.5px", color: "#475569", margin: "8px 0", background: "#f8fafc", padding: "8px", borderRadius: "8px" }}>
                        <div><i className="fa-solid fa-building me-1"></i> หอพัก: <strong>{booking.dormitoryName}</strong></div>
                        <div><i className="fa-solid fa-door-open me-1"></i> ห้องพัก: <strong>ห้อง {booking.roomNumber}</strong></div>
                        <div><i className="fa-solid fa-calendar-days me-1"></i> วันที่เข้าพัก: <strong>{booking.bookingDate || "-"}</strong></div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "10px" }}>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUpdateStatus(booking.id, "approved", tenantName)}
                          style={{
                            background: "#f0fdf4",
                            color: "#166534",
                            border: "1px solid #bbf7d0",
                            borderRadius: "8px",
                            padding: "8px",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px"
                          }}
                        >
                          <i className="fa-solid fa-check"></i> อนุมัติ
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUpdateStatus(booking.id, "rejected", tenantName)}
                          style={{
                            background: "#fef2f2",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                            borderRadius: "8px",
                            padding: "8px",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px"
                          }}
                        >
                          <i className="fa-solid fa-xmark"></i> ปฏิเสธ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* My Dormitories Quick Summary */}
      <div className="content-card">
        <div className="content-card-header" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#1e293b" }}>
              รายการหอพักของฉัน
            </h3>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                background: "#f0fdf4",
                color: "#166534",
                padding: "2px 10px",
                borderRadius: "12px",
                border: "1px solid #bbf7d0"
              }}
            >
              {dorms.length} แห่ง
            </span>
          </div>
          <Link
            to="/owner/dormitories"
            style={{ color: "#7da27c", textDecoration: "none", fontSize: "13.5px", fontWeight: 700 }}
          >
            จัดการหอพักทั้งหมด <i className="fa-solid fa-arrow-right" style={{ marginLeft: "4px" }}></i>
          </Link>
        </div>

        <div className="content-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#7da27c" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "8px" }}></i> กำลังโหลดหอพัก...
            </div>
          ) : dorms.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
              <i className="fa-solid fa-building" style={{ fontSize: "36px", color: "#cbd5e1", marginBottom: "10px" }}></i>
              <p style={{ margin: "0 0 14px 0", fontSize: "14px" }}>คุณยังไม่ได้ลงประกาศหอพักในระบบ</p>
              <Link
                to="/owner/dormitories/create"
                className="btn-primary-action"
                style={{ textDecoration: "none", fontSize: "13.5px", padding: "8px 16px" }}
              >
                <i className="fa-solid fa-plus"></i> เพิ่มหอพักแรกของคุณ
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="desktop-table-view table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: "80px" }}>รูปปก</th>
                      <th>ชื่อหอพัก / ทำเล</th>
                      <th>ช่วงราคา</th>
                      <th>สถานะตรวจสอบ</th>
                      <th style={{ textAlign: "center" }}>เข้าชม</th>
                      <th style={{ textAlign: "center" }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dorms.slice(0, 5).map((dorm) => {
                      const badge = getDormStatusBadge(dorm.status);
                      const coverImg = (dorm.images && dorm.images[0]) || "/images/dorm-1.jpg";

                      return (
                        <tr key={dorm.id}>
                          <td>
                            <img
                              src={coverImg}
                              alt={dorm.name}
                              style={{ width: "60px", height: "42px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                              onError={(e) => { e.target.src = "/images/banner.jpg"; }}
                            />
                          </td>
                          <td>
                            <strong style={{ color: "#1e293b", fontSize: "14.5px" }}>{dorm.name}</strong>
                            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                              <i className="fa-solid fa-location-dot" style={{ color: "#ef4444", marginRight: "4px" }}></i>
                              {dorm.district || "อำเภอเมืองเลย"}
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: "#166534", fontSize: "14px" }}>
                              ฿{Number(dorm.priceMin || 0).toLocaleString()} - ฿{Number(dorm.priceMax || 0).toLocaleString()}
                            </strong>
                            <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "4px" }}>บาท/เดือน</span>
                          </td>
                          <td>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11.5px",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "10px",
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`
                              }}
                            >
                              <i className={`fa-solid ${badge.icon}`}></i> {badge.label}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>
                              <i className="fa-solid fa-eye me-1"></i> {Number(dorm.viewCount || 0).toLocaleString()} ครั้ง
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                              <Link
                                to={`/owner/rooms?dormId=${dorm.id}`}
                                className="btn-icon"
                                title="จัดการห้องพัก"
                                style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}
                              >
                                <i className="fa-solid fa-door-open"></i>
                              </Link>
                              <Link
                                to={`/owner/dormitories/${dorm.id}/edit`}
                                className="btn-icon"
                                title="แก้ไขข้อมูล"
                                style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" }}
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </Link>
                              <Link
                                to={`/dorms/${dorm.id}`}
                                className="btn-icon"
                                title="ดูหน้าประกาศ"
                                style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}
                              >
                                <i className="fa-solid fa-eye"></i>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="mobile-cards-view" style={{ padding: "12px" }}>
                {dorms.slice(0, 5).map((dorm) => {
                  const badge = getDormStatusBadge(dorm.status);
                  const coverImg = (dorm.images && dorm.images[0]) || "/images/dorm-1.jpg";

                  return (
                    <div
                      key={dorm.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #eef2ed",
                        borderRadius: "12px",
                        padding: "12px 14px",
                        marginBottom: "10px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
                      }}
                    >
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <img
                          src={coverImg}
                          alt={dorm.name}
                          style={{ width: "54px", height: "54px", borderRadius: "8px", objectFit: "cover", border: "1px solid #e2e8f0" }}
                          onError={(e) => { e.target.src = "/images/banner.jpg"; }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {dorm.name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>
                            <i className="fa-solid fa-location-dot me-1"></i> {dorm.district || "อำเภอเมืองเลย"}
                          </div>
                          <div style={{ marginTop: "4px" }}>
                            <span
                              style={{
                                fontSize: "10.5px",
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: "8px",
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`
                              }}
                            >
                              {badge.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9", fontSize: "12px" }}>
                        <span style={{ color: "#166534", fontWeight: 700 }}>
                          ฿{Number(dorm.priceMin || 0).toLocaleString()} - ฿{Number(dorm.priceMax || 0).toLocaleString()}/เดือน
                        </span>
                        <span style={{ color: "#64748b" }}><i className="fa-solid fa-eye me-1"></i> {Number(dorm.viewCount || 0).toLocaleString()} ครั้ง</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginTop: "8px" }}>
                        <Link
                          to={`/owner/rooms?dormId=${dorm.id}`}
                          style={{ textDecoration: "none", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "6px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 600, textAlign: "center" }}
                        >
                          <i className="fa-solid fa-door-open me-1"></i> ห้อง
                        </Link>
                        <Link
                          to={`/owner/dormitories/${dorm.id}/edit`}
                          style={{ textDecoration: "none", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "6px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 600, textAlign: "center" }}
                        >
                          <i className="fa-solid fa-pen-to-square me-1"></i> แก้ไข
                        </Link>
                        <Link
                          to={`/dorms/${dorm.id}`}
                          style={{ textDecoration: "none", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "6px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 600, textAlign: "center" }}
                        >
                          <i className="fa-solid fa-eye me-1"></i> ดูหน้า
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
