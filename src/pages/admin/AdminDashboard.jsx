import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllDormitoriesAdmin, setDormitoryStatus, deleteDormitory } from "../../services/dormitoryService";
import { getAllUsersAdmin } from "../../services/userService";
import { getAllBookingsAdmin } from "../../services/bookingService";
import { getAllReviewsAdmin } from "../../services/reviewService";
import { showConfirm, showAlert } from "../../context/ModalContext";

export default function AdminDashboard() {
  const [dorms, setDorms] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const quickMenuRef = useRef(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dormList, userList, bookingList, reviewList] = await Promise.all([
        getAllDormitoriesAdmin(),
        getAllUsersAdmin(),
        getAllBookingsAdmin(),
        getAllReviewsAdmin()
      ]);
      setDorms(dormList || []);
      setUsers(userList || []);
      setBookings(bookingList || []);
      setReviews(reviewList || []);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (quickMenuRef.current && !quickMenuRef.current.contains(e.target)) {
        setQuickMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleStatusChange = async (dormId, status, dormName) => {
    const statusLabel = status === "approved" ? "อนุมัติหอพัก" : "ปฏิเสธหอพัก";
    const isConfirmed = await showConfirm({
      title: `${statusLabel}`,
      heading: `คุณต้องการ "${statusLabel}" ของ "${dormName || 'หอพักนี้'}" ใช่หรือไม่?`,
      confirmText: statusLabel,
      cancelText: "ยกเลิก",
      type: status === "rejected" ? "danger" : "success"
    });

    if (!isConfirmed) return;

    setActionLoadingId(dormId);
    try {
      await setDormitoryStatus(dormId, status);
      await showAlert({
        title: "สำเร็จ",
        heading: `${statusLabel} เรียบร้อยแล้ว!`,
        type: "success"
      });
      await loadAllData();
    } catch (err) {
      console.error("Error updating status:", err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถอัปเดตสถานะได้",
        message: err.message || "",
        type: "danger"
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteDorm = async (dormId, dormName) => {
    const isConfirmed = await showConfirm({
      title: "ลบหอพัก",
      heading: `ต้องการลบหอพัก "${dormName || 'นี้'}" ออกจากระบบ?`,
      message: "ข้อมูลหอพักและห้องพักที่เกี่ยวข้องทั้งหมดจะถูกลบออกจากระบบอย่างถาวร",
      confirmText: "ลบหอพัก",
      cancelText: "ยกเลิก",
      type: "danger"
    });

    if (isConfirmed) {
      setActionLoadingId(dormId);
      try {
        await deleteDormitory(dormId);
        await showAlert({
          title: "สำเร็จ",
          heading: "ลบหอพักเรียบร้อยแล้ว!",
          type: "success"
        });
        await loadAllData();
      } catch (err) {
        console.error("Error deleting dorm:", err);
        await showAlert({
          title: "เกิดข้อผิดพลาด",
          heading: "ไม่สามารถลบหอพักได้",
          message: err.message || "",
          type: "danger"
        });
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const normalUsers = users.filter((u) => u.role === "user");
  const owners = users.filter((u) => u.role === "owner");
  const pendingDorms = dorms.filter((d) => d.status === "pending" || !d.status);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Top Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
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
            <i className="fa-solid fa-crown" style={{ color: "#8b5cf6" }}></i>
            ภาพรวมระบบ (Admin Dashboard)
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px", margin: "4px 0 0 0" }}>
            ตรวจสอบสถิติรวมของระบบ อนุมัติประกาศหอพักใหม่ และจัดการข้อมูลทั้งหมด
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            to="/admin/dormitories"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "13.5px",
              fontWeight: 700,
              background: "#7da27c",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(125, 162, 124, 0.25)"
            }}
          >
            <i className="fa-solid fa-building"></i> จัดการหอพัก
          </Link>
          <Link
            to="/admin/users"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "13.5px",
              fontWeight: 700,
              background: "#ffffff",
              color: "#334155",
              border: "1px solid #cbd5e1"
            }}
          >
            <i className="fa-solid fa-users"></i> จัดการผู้ใช้
          </Link>
        </div>
      </div>

      {/* 6 Stats KPI Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "14px",
          marginBottom: "28px"
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "18px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0
            }}
          >
            <i className="fa-solid fa-users"></i>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>ผู้เช่า (Users)</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#1e293b", marginTop: "2px" }}>
              {loading ? "-" : normalUsers.length} <span style={{ fontSize: "12px", fontWeight: 400, color: "#94a3b8" }}>คน</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "18px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#faf5ff",
              color: "#9333ea",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0
            }}
          >
            <i className="fa-solid fa-user-tie"></i>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>เจ้าของหอ (Owners)</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#9333ea", marginTop: "2px" }}>
              {loading ? "-" : owners.length} <span style={{ fontSize: "12px", fontWeight: 400, color: "#94a3b8" }}>ราย</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "18px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#f0fdf4",
              color: "#166534",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0
            }}
          >
            <i className="fa-solid fa-hotel"></i>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>หอพักทั้งหมด</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#166534", marginTop: "2px" }}>
              {loading ? "-" : dorms.length} <span style={{ fontSize: "12px", fontWeight: 400, color: "#94a3b8" }}>แห่ง</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "18px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#fffbe6",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0
            }}
          >
            <i className="fa-solid fa-clock-rotate-left"></i>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>หอพักรอการตรวจสอบ</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#d97706", marginTop: "2px" }}>
              {loading ? "-" : pendingDorms.length} <span style={{ fontSize: "12px", fontWeight: 400, color: "#94a3b8" }}>แห่ง</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "18px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#ecfdf5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0
            }}
          >
            <i className="fa-solid fa-calendar-check"></i>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>การจองทั้งหมด</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#059669", marginTop: "2px" }}>
              {loading ? "-" : bookings.length} <span style={{ fontSize: "12px", fontWeight: 400, color: "#94a3b8" }}>ครั้ง</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "18px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#fff7ed",
              color: "#ea580c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0
            }}
          >
            <i className="fa-solid fa-star"></i>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>รีวิวทั้งหมด</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#ea580c", marginTop: "2px" }}>
              {loading ? "-" : reviews.length} <span style={{ fontSize: "12px", fontWeight: 400, color: "#94a3b8" }}>รีวิว</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Dormitories Table */}
      <div className="content-card" style={{ marginBottom: "28px" }}>
        <div className="content-card-header" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#1e293b" }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: "#d97706", marginRight: "8px" }}></i>
              หอพักที่รอการตรวจสอบและอนุมัติ
            </h3>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                background: pendingDorms.length > 0 ? "#fffbe6" : "#f1f5f9",
                color: pendingDorms.length > 0 ? "#b45309" : "#64748b",
                padding: "2px 10px",
                borderRadius: "12px",
                border: pendingDorms.length > 0 ? "1px solid #fef08a" : "1px solid #e2e8f0"
              }}
            >
              {pendingDorms.length} แห่ง
            </span>
          </div>
          <Link
            to="/admin/dormitories"
            style={{ color: "#7da27c", textDecoration: "none", fontSize: "13.5px", fontWeight: 700 }}
          >
            ดูหอพักทั้งหมด <i className="fa-solid fa-arrow-right" style={{ marginLeft: "4px" }}></i>
          </Link>
        </div>

        <div className="content-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#7da27c" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "8px" }}></i> กำลังโหลดข้อมูล...
            </div>
          ) : pendingDorms.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: "36px", color: "#10b981", marginBottom: "10px" }}></i>
              <p style={{ margin: 0, fontSize: "14.5px", fontWeight: 600, color: "#1e293b" }}>
                ไม่มีหอพักที่รอการตรวจสอบในขณะนี้
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                ประกาศหอพักทั้งหมดในระบบได้รับการอนุมัติเรียบร้อยแล้ว
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="desktop-table-view table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: "80px" }}>รูปปก</th>
                      <th>ชื่อหอพัก</th>
                      <th>เจ้าของหอพัก</th>
                      <th>อำเภอ / ทำเล</th>
                      <th>ช่วงราคา</th>
                      <th>สถานะ</th>
                      <th style={{ textAlign: "center" }}>การดำเนินการ (อนุมัติ / ปฏิเสธ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDorms.map((dorm) => {
                      const isBusy = actionLoadingId === dorm.id;
                      const coverImg = (dorm.images && dorm.images[0]) || "/images/dorm-1.jpg";

                      return (
                        <tr key={dorm.id} style={{ opacity: isBusy ? 0.6 : 1 }}>
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
                          </td>
                          <td>
                            <span style={{ fontSize: "13.5px", color: "#334155", fontWeight: 600 }}>
                              {dorm.ownerName || dorm.ownerId || "-"}
                            </span>
                          </td>
                          <td style={{ fontSize: "13px", color: "#64748b" }}>
                            {dorm.district || dorm.address || "อำเภอเมืองเลย"}
                          </td>
                          <td>
                            <strong style={{ color: "#166534", fontSize: "14px" }}>
                              ฿{Number(dorm.priceMin || 0).toLocaleString()} - ฿{Number(dorm.priceMax || 0).toLocaleString()}
                            </strong>
                          </td>
                          <td>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11.5px",
                                fontWeight: 700,
                                padding: "3px 10px",
                                borderRadius: "10px",
                                background: "#fffbe6",
                                color: "#b45309",
                                border: "1px solid #fef08a"
                              }}
                            >
                              <i className="fa-solid fa-clock"></i> รอตรวจสอบ
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleStatusChange(dorm.id, "approved", dorm.name)}
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
                                  gap: "4px"
                                }}
                              >
                                <i className="fa-solid fa-check"></i> อนุมัติ
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleStatusChange(dorm.id, "rejected", dorm.name)}
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
                                  gap: "4px"
                                }}
                              >
                                <i className="fa-solid fa-xmark"></i> ปฏิเสธ
                              </button>
                              <Link
                                to={`/dorms/${dorm.id}`}
                                className="btn-icon"
                                title="ดูรายละเอียดประกาศ"
                                style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}
                              >
                                <i className="fa-solid fa-eye"></i>
                              </Link>
                              <button
                                type="button"
                                className="btn-icon delete"
                                disabled={isBusy}
                                onClick={() => handleDeleteDorm(dorm.id, dorm.name)}
                                title="ลบประกาศนี้"
                                style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                              >
                                <i className="fa-solid fa-trash-can"></i>
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
                {pendingDorms.map((dorm) => {
                  const isBusy = actionLoadingId === dorm.id;
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
                        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                        opacity: isBusy ? 0.6 : 1
                      }}
                    >
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <img
                          src={coverImg}
                          alt={dorm.name}
                          style={{ width: "56px", height: "56px", borderRadius: "8px", objectFit: "cover", border: "1px solid #e2e8f0" }}
                          onError={(e) => { e.target.src = "/images/banner.jpg"; }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {dorm.name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>
                            <i className="fa-solid fa-building-user me-1"></i> เจ้าของ: <strong>{dorm.ownerName || dorm.ownerId || "-"}</strong>
                          </div>
                          <div style={{ marginTop: "4px" }}>
                            <span style={{ fontSize: "10.5px", fontWeight: 700, padding: "1px 7px", borderRadius: "8px", background: "#fffbe6", color: "#b45309", border: "1px solid #fef08a" }}>
                              <i className="fa-solid fa-clock me-1"></i> รอตรวจสอบ
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9", fontSize: "12px" }}>
                        <span style={{ color: "#64748b" }}>ทำเล: {dorm.district || "อำเภอเมืองเลย"}</span>
                        <span style={{ color: "#166534", fontWeight: 700 }}>฿{Number(dorm.priceMin || 0).toLocaleString()} - ฿{Number(dorm.priceMax || 0).toLocaleString()}</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginTop: "10px" }}>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleStatusChange(dorm.id, "approved", dorm.name)}
                          style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                        >
                          <i className="fa-solid fa-check"></i> อนุมัติ
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleStatusChange(dorm.id, "rejected", dorm.name)}
                          style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
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

      {/* Quick Access Admin Modules Dropdown */}
      <div style={{ background: "#ffffff", borderRadius: "16px", padding: "18px 22px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="fa-solid fa-sliders" style={{ color: "#7da27c" }}></i>
              เมนูจัดการลัดของแอดมิน (Admin Quick Modules)
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>
              คลิกเลือกโมดูลเพื่อไปยังหน้าระบบการจัดการต่างๆ ได้อย่างรวดเร็ว
            </p>
          </div>

          <div ref={quickMenuRef} style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
            <button
              type="button"
              onClick={() => setQuickMenuOpen(!quickMenuOpen)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "#f8fafc",
                border: "1px solid",
                borderColor: quickMenuOpen ? "#7da27c" : "#cbd5e1",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13.5px",
                color: "#1e293b",
                fontWeight: 600,
                boxShadow: quickMenuOpen ? "0 0 0 3px rgba(125, 162, 124, 0.15)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                <i className="fa-solid fa-compass" style={{ color: "#7da27c", fontSize: "14px" }}></i>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  เลือกเมนูจัดการลัด...
                </span>
              </div>
              <i
                className="fa-solid fa-chevron-down"
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  transform: quickMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  flexShrink: 0,
                  marginLeft: "8px"
                }}
              ></i>
            </button>

            {quickMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  width: "100%",
                  minWidth: "280px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                  zIndex: 100,
                  padding: "4px 0",
                  maxHeight: "340px",
                  overflowY: "auto"
                }}
              >
                {[
                  { label: "จัดการผู้ใช้งาน", route: "/admin/users", icon: "fa-users-gear", bg: "#f0fdf4", color: "#166534" },
                  { label: "จัดการเจ้าของหอ", route: "/admin/owners", icon: "fa-user-tie", bg: "#faf5ff", color: "#9333ea" },
                  { label: "จัดการหอพัก", route: "/admin/dormitories", icon: "fa-building", bg: "#eff6ff", color: "#2563eb" },
                  { label: "จัดการพื้นที่/โซน", route: "/admin/locations", icon: "fa-map-location-dot", bg: "#fff7ed", color: "#ea580c" },
                  { label: "การจองทั้งหมด", route: "/admin/bookings", icon: "fa-calendar-check", bg: "#ecfdf5", color: "#059669" },
                  { label: "รีวิวและความเห็น", route: "/admin/reviews", icon: "fa-star", bg: "#fffbe6", color: "#d97706" },
                  { label: "ประกาศข่าวสาร", route: "/admin/announcements", icon: "fa-bullhorn", bg: "#fdf2f8", color: "#db2777" },
                  { label: "รายงานและสถิติ", route: "/admin/reports", icon: "fa-chart-pie", bg: "#f0fdfa", color: "#0d9488" },
                  { label: "บันทึกกิจกรรมระบบ", route: "/admin/logs", icon: "fa-clipboard-list", bg: "#f1f5f9", color: "#475569" }
                ].map((mod) => (
                  <Link
                    key={mod.route}
                    to={mod.route}
                    onClick={() => setQuickMenuOpen(false)}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "9px 14px",
                      transition: "background 0.15s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "8px",
                          background: mod.bg,
                          color: mod.color,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          flexShrink: 0
                        }}
                      >
                        <i className={`fa-solid ${mod.icon}`}></i>
                      </span>
                      <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#1e293b" }}>{mod.label}</span>
                    </div>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: "11px", color: "#cbd5e1" }}></i>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
