import { useState, useEffect, useRef } from "react";
import { getAllBookingsAdmin, updateBookingStatus } from "../../services/bookingService";
import { showConfirm, showAlert } from "../../context/ModalContext";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  // Active status edit dropdown (which booking has its status dropdown open)
  const [openStatusId, setOpenStatusId] = useState(null);

  // Active booking details dropdown in table (which booking has its details open)
  const [openDetailsId, setOpenDetailsId] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await getAllBookingsAdmin();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Click outside listener for custom dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
      if (!event.target.closest(".booking-status-dropdown")) {
        setOpenStatusId(null);
      }
      if (!event.target.closest(".booking-details-dropdown")) {
        setOpenDetailsId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const statusLabels = {
      pending: "รออนุมัติ",
      approved: "อนุมัติแล้ว",
      rejected: "ปฏิเสธ",
      cancelled: "ยกเลิกแล้ว",
      completed: "เสร็จสิ้น"
    };

    const isConfirmed = await showConfirm({
      title: "เปลี่ยนสถานะการจอง",
      heading: `ต้องการเปลี่ยนเป็น "${statusLabels[newStatus] || newStatus}" ใช่หรือไม่?`,
      message: "ระบบจะอัปเดตสถานะของรายการจองนี้ทันที",
      confirmText: "ยืนยัน",
      cancelText: "ยกเลิก",
      type: newStatus === "rejected" || newStatus === "cancelled" ? "danger" : "warning"
    });

    if (!isConfirmed) return;

    try {
      await updateBookingStatus(id, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
      await showAlert({
        title: "สำเร็จ",
        heading: "เปลี่ยนสถานะเรียบร้อยแล้ว!",
        type: "success"
      });
      loadBookings();
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถเปลี่ยนสถานะได้",
        message: err.message || "",
        type: "danger"
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return {
          label: "อนุมัติแล้ว",
          circleColor: "#16a34a", // วงกลมสีเขียว
          circleRing: "#86efac",
          bg: "#f0fdf4",
          border: "#bbf7d0",
          textColor: "#15803d",
          className: "approved"
        };
      case "completed":
        return {
          label: "เสร็จสิ้น",
          circleColor: "#059669", // วงกลมสีเขียวมรกต
          circleRing: "#6ee7b7",
          bg: "#ecfdf5",
          border: "#a7f3d0",
          textColor: "#065f46",
          className: "completed"
        };
      case "rejected":
        return {
          label: "ปฏิเสธ",
          circleColor: "#dc2626", // วงกลมสีแดง
          circleRing: "#fca5a5",
          bg: "#fef2f2",
          border: "#fecaca",
          textColor: "#991b1b",
          className: "rejected"
        };
      case "cancelled":
        return {
          label: "ยกเลิกแล้ว",
          circleColor: "#64748b", // วงกลมสีเทา
          circleRing: "#cbd5e1",
          bg: "#f8fafc",
          border: "#e2e8f0",
          textColor: "#334155",
          className: "cancelled"
        };
      default:
        return {
          label: "รออนุมัติ",
          circleColor: "#eab308", // วงกลมสีเหลือง
          circleRing: "#fde047",
          bg: "#fefce8",
          border: "#fef08a",
          textColor: "#854d0e",
          className: "pending"
        };
    }
  };

  const statusOptions = [
    { key: "all", label: "ทั้งหมด", circleColor: "#5b8e66", count: bookings.length },
    { key: "pending", label: "รออนุมัติ", circleColor: "#eab308", count: bookings.filter((b) => b.status === "pending" || !b.status).length },
    { key: "approved", label: "อนุมัติแล้ว", circleColor: "#16a34a", count: bookings.filter((b) => b.status === "approved").length },
    { key: "rejected", label: "ปฏิเสธ", circleColor: "#dc2626", count: bookings.filter((b) => b.status === "rejected").length },
    { key: "cancelled", label: "ยกเลิกแล้ว", circleColor: "#64748b", count: bookings.filter((b) => b.status === "cancelled").length },
    { key: "completed", label: "เสร็จสิ้น", circleColor: "#059669", count: bookings.filter((b) => b.status === "completed").length }
  ];

  const statusChangeOptions = [
    { value: "pending", label: "รออนุมัติ", circleColor: "#eab308" },
    { value: "approved", label: "อนุมัติแล้ว", circleColor: "#16a34a" },
    { value: "rejected", label: "ปฏิเสธ", circleColor: "#dc2626" },
    { value: "cancelled", label: "ยกเลิกแล้ว", circleColor: "#64748b" },
    { value: "completed", label: "เสร็จสิ้น", circleColor: "#059669" }
  ];

  const currentStatusOption = statusOptions.find((o) => o.key === statusFilter) || statusOptions[0];

  const filteredBookings = bookings.filter((b) => {
    // Status Filter
    if (statusFilter !== "all") {
      const bStatus = b.status || "pending";
      if (bStatus !== statusFilter) return false;
    }

    // Search Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const userName = (b.userName || "").toLowerCase();
      const userEmail = (b.userEmail || "").toLowerCase();
      const userPhone = (b.userPhone || "").toLowerCase();
      const dormName = (b.dormitoryName || "").toLowerCase();
      const roomNum = String(b.roomNumber || "").toLowerCase();
      const note = (b.note || "").toLowerCase();
      return (
        userName.includes(term) ||
        userEmail.includes(term) ||
        userPhone.includes(term) ||
        dormName.includes(term) ||
        roomNum.includes(term) ||
        note.includes(term)
      );
    }

    return true;
  });

  return (
    <div>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "24px", color: "#1e293b", fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>
              การจองห้องพักทั้งหมดในระบบ
            </h1>
            {!loading && (
              <span
                style={{
                  background: "#eef8ee",
                  color: "#2e7d32",
                  border: "1px solid #c8e6c9",
                  fontSize: "13px",
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                  flexShrink: 0
                }}
              >
                <i className="fa-solid fa-calendar-check" style={{ fontSize: "11px" }}></i>
                {bookings.length} รายการ
              </span>
            )}
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            ตรวจสอบประวัติ ค้นหา และปรับปรุงสถานะการจองของผู้ใช้งานทุกหอพัก
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="content-card" style={{ marginBottom: "20px", padding: "16px 20px", overflow: "visible", position: "relative", zIndex: 50 }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          {/* Search Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 280px", minWidth: 0, width: "100%" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>
              ค้นหารายการจอง:
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px" }}
              ></i>
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้จอง, เบอร์โทร, หอพัก หรือเลขห้อง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  height: "42px",
                  width: "100%",
                  padding: "0 38px 0 38px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontSize: "14px",
                    padding: "4px"
                  }}
                  title="ล้างข้อความค้นหา"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>
          </div>

          {/* Status Dropdown Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 200px", minWidth: 0, width: "100%", position: "relative" }} ref={statusDropdownRef}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>
              สถานะการจอง:
            </label>
            <button
              type="button"
              onClick={() => setStatusDropdownOpen((prev) => !prev)}
              style={{
                height: "42px",
                width: "100%",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: statusDropdownOpen ? "#5b8e66" : "#cbd5e1",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#334155",
                cursor: "pointer",
                boxShadow: statusDropdownOpen ? "0 0 0 2px rgba(91, 142, 102, 0.15)" : "none",
                transition: "all 0.15s ease",
                boxSizing: "border-box"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, overflow: "hidden" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: currentStatusOption.circleColor,
                    flexShrink: 0
                  }}
                ></span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {currentStatusOption.label}
                  <span style={{ color: "#94a3b8", marginLeft: "4px", fontSize: "12px" }}>({currentStatusOption.count})</span>
                </span>
              </div>
              <i
                className="fa-solid fa-chevron-down"
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  flexShrink: 0,
                  transition: "transform 0.2s ease",
                  transform: statusDropdownOpen ? "rotate(180deg)" : "none"
                }}
              ></i>
            </button>

            {statusDropdownOpen && (
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
                {statusOptions.map((opt) => {
                  const isSelected = statusFilter === opt.key;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => {
                        setStatusFilter(opt.key);
                        setStatusDropdownOpen(false);
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#f0fdf4" : "transparent",
                        color: isSelected ? "#15803d" : "#334155",
                        fontWeight: isSelected ? 600 : 400,
                        fontSize: "13.5px",
                        transition: "background-color 0.1s ease"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            width: "9px",
                            height: "9px",
                            borderRadius: "50%",
                            backgroundColor: opt.circleColor,
                            flexShrink: 0
                          }}
                        ></span>
                        <span>{opt.label}</span>
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor: isSelected ? "#dcfce7" : "#f1f5f9",
                          color: isSelected ? "#166534" : "#64748b",
                          padding: "1px 8px",
                          borderRadius: "999px"
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
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-card">
        <div className="content-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#7da27c" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "24px", marginBottom: "12px", display: "block" }}></i>
              กำลังโหลดข้อมูลการจอง...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#888" }}>
              <i className="fa-regular fa-calendar-xmark" style={{ fontSize: "48px", color: "#cbd5e1", marginBottom: "16px", display: "block" }}></i>
              <h3 style={{ color: "#475569", fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0" }}>ไม่พบข้อมูลการจอง</h3>
              <p style={{ color: "#94a3b8", fontSize: "13.5px", margin: 0 }}>
                {searchTerm || statusFilter !== "all"
                  ? "ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองสถานะใหม่อีกครั้ง"
                  : "ยังไม่มีข้อมูลการจองในระบบ"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Minimalist & Perfectly Equal Dimensions */}
              <div className="table-responsive desktop-table-view" style={{ overflowX: "auto", minHeight: "260px" }}>
                <table className="custom-table" style={{ width: "100%", tableLayout: "auto" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ width: "32%", whiteSpace: "nowrap", padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        ผู้จอง
                      </th>
                      <th style={{ width: "30%", whiteSpace: "nowrap", padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        ข้อมูลการจอง
                      </th>
                      <th style={{ width: "19%", whiteSpace: "nowrap", padding: "14px 20px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        สถานะ
                      </th>
                      <th style={{ width: "19%", whiteSpace: "nowrap", padding: "14px 20px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        ปรับสถานะ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b, index) => {
                      const badge = getStatusBadge(b.status);
                      const isStatusOpen = openStatusId === `desktop-${b.id}`;
                      const isDetailsOpen = openDetailsId === b.id;
                      const isLastRow = index >= filteredBookings.length - 2 && filteredBookings.length > 2;

                      return (
                        <tr
                          key={b.id}
                          style={{
                            position: "relative",
                            zIndex: isStatusOpen || isDetailsOpen ? 9999 : 1,
                            borderBottom: "1px solid #f1f5f9"
                          }}
                        >
                          {/* 1. ผู้จอง */}
                          <td style={{ verticalAlign: "middle", padding: "14px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", whiteSpace: "nowrap" }}>
                              <div
                                style={{
                                  width: "38px",
                                  height: "38px",
                                  borderRadius: "50%",
                                  backgroundColor: "#eef6ee",
                                  color: "#2e7d32",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "14px",
                                  fontWeight: 700,
                                  flexShrink: 0
                                }}
                              >
                                <i className="fa-solid fa-user"></i>
                              </div>
                              <div style={{ overflow: "hidden" }}>
                                <strong style={{ color: "#1e293b", fontSize: "14px", display: "block" }}>
                                  {b.userName || b.userEmail || "ไม่ระบุชื่อ"}
                                </strong>
                                {b.userEmail && b.userName && (
                                  <span style={{ color: "#94a3b8", fontSize: "12px", display: "block" }}>
                                    {b.userEmail}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 2. ข้อมูลการจอง (Fixed uniform width: 220px, height: 38px) */}
                          <td style={{ verticalAlign: "middle", padding: "14px 20px", position: "relative" }}>
                            <div
                              className="booking-details-dropdown"
                              style={{
                                position: "relative",
                                width: "220px"
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => setOpenDetailsId(isDetailsOpen ? null : b.id)}
                                style={{
                                  width: "100%",
                                  height: "38px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "8px",
                                  padding: "0 12px",
                                  borderRadius: "8px",
                                  border: "1px solid",
                                  borderColor: isDetailsOpen ? "#5b8e66" : "#e2e8f0",
                                  backgroundColor: isDetailsOpen ? "#f8fafc" : "#ffffff",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  color: "#334155",
                                  cursor: "pointer",
                                  boxSizing: "border-box",
                                  boxShadow: isDetailsOpen ? "0 0 0 2px rgba(91, 142, 102, 0.15)" : "none",
                                  transition: "all 0.15s ease"
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, overflow: "hidden" }}>
                                  <i className="fa-solid fa-hotel" style={{ color: "#94a3b8", fontSize: "12px", flexShrink: 0 }}></i>
                                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 600, color: "#1e293b" }}>
                                    {b.dormitoryName || "หอพัก"}
                                  </span>
                                  {b.roomNumber && (
                                    <span style={{ whiteSpace: "nowrap", color: "#64748b", fontSize: "12px", flexShrink: 0 }}>
                                      ({b.roomNumber})
                                    </span>
                                  )}
                                </div>
                                <i
                                  className="fa-solid fa-chevron-down"
                                  style={{
                                    fontSize: "10px",
                                    color: "#94a3b8",
                                    flexShrink: 0,
                                    transition: "transform 0.2s ease",
                                    transform: isDetailsOpen ? "rotate(180deg)" : "none"
                                  }}
                                ></i>
                              </button>

                              {/* Details Popover Menu */}
                              {isDetailsOpen && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: isLastRow ? "auto" : "calc(100% + 6px)",
                                    bottom: isLastRow ? "calc(100% + 6px)" : "auto",
                                    left: 0,
                                    width: "280px",
                                    backgroundColor: "#ffffff",
                                    borderRadius: "12px",
                                    border: "1px solid #cbd5e1",
                                    boxShadow: "0 14px 35px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)",
                                    zIndex: 10000,
                                    padding: "14px 16px",
                                    textAlign: "left",
                                    boxSizing: "border-box"
                                  }}
                                >
                                  <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <i className="fa-solid fa-circle-info" style={{ color: "#7da27c" }}></i>
                                    รายละเอียดการจอง
                                  </div>

                                  {/* 1. เบอร์โทรศัพท์ */}
                                  <div style={{ marginBottom: "10px", paddingBottom: "8px", borderBottom: "1px solid #f1f5f9" }}>
                                    <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: "3px" }}>เบอร์โทรศัพท์:</div>
                                    {b.userPhone ? (
                                      <a
                                        href={`tel:${b.userPhone}`}
                                        style={{ color: "#2563eb", textDecoration: "none", fontSize: "13.5px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}
                                      >
                                        <i className="fa-solid fa-phone" style={{ fontSize: "11px" }}></i>
                                        {b.userPhone}
                                      </a>
                                    ) : (
                                      <span style={{ color: "#94a3b8", fontSize: "13px" }}>-</span>
                                    )}
                                  </div>

                                  {/* 2. หอพัก */}
                                  <div style={{ marginBottom: "10px", paddingBottom: "8px", borderBottom: "1px solid #f1f5f9" }}>
                                    <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: "3px" }}>หอพัก:</div>
                                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                                      <i className="fa-solid fa-hotel" style={{ color: "#7da27c", fontSize: "12px" }}></i>
                                      {b.dormitoryName || "-"}
                                    </div>
                                  </div>

                                  {/* 3. ห้องพัก */}
                                  <div style={{ marginBottom: "10px", paddingBottom: "8px", borderBottom: "1px solid #f1f5f9" }}>
                                    <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: "3px" }}>ห้องพัก:</div>
                                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                                      <i className="fa-solid fa-door-open" style={{ color: "#7da27c", fontSize: "12px" }}></i>
                                      {b.roomNumber || "-"}
                                    </div>
                                  </div>

                                  {/* 4. วันที่ต้องการเข้าพัก */}
                                  <div style={{ marginBottom: b.note ? "10px" : 0, paddingBottom: b.note ? "8px" : 0, borderBottom: b.note ? "1px solid #f1f5f9" : "none" }}>
                                    <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: "3px" }}>วันที่ต้องการเข้าพัก:</div>
                                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                                      <i className="fa-regular fa-calendar-days" style={{ color: "#7da27c", fontSize: "12px" }}></i>
                                      {b.bookingDate || "-"}
                                    </div>
                                  </div>

                                  {/* 5. หมายเหตุเพิ่มเติม */}
                                  {b.note && (
                                    <div>
                                      <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: "3px" }}>ข้อความเพิ่มเติม:</div>
                                      <div style={{ fontSize: "12.5px", color: "#334155", fontStyle: "italic", background: "#f8fafc", padding: "6px 8px", borderRadius: "6px" }}>
                                        {b.note}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 3. สถานะ (Fixed uniform width: 120px, height: 38px, matching 8px radius) */}
                          <td style={{ verticalAlign: "middle", padding: "14px 20px", textAlign: "center", whiteSpace: "nowrap" }}>
                            <div
                              style={{
                                width: "120px",
                                height: "38px",
                                margin: "0 auto",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                padding: "0 10px",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: 600,
                                backgroundColor: badge.bg,
                                color: badge.textColor,
                                border: `1px solid ${badge.border}`,
                                boxSizing: "border-box"
                              }}
                            >
                              <span
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  backgroundColor: badge.circleColor,
                                  flexShrink: 0
                                }}
                              ></span>
                              <span>{badge.label}</span>
                            </div>
                          </td>

                          {/* 4. ปรับสถานะ (Fixed uniform width: 130px, height: 38px, matching 8px radius) */}
                          <td style={{ verticalAlign: "middle", padding: "14px 20px", textAlign: "center", whiteSpace: "nowrap" }}>
                            <div
                              className="booking-status-dropdown"
                              style={{
                                position: "relative",
                                display: "inline-block",
                                width: "130px",
                                margin: "0 auto"
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => setOpenStatusId(isStatusOpen ? null : `desktop-${b.id}`)}
                                style={{
                                  width: "100%",
                                  height: "38px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "0 12px",
                                  borderRadius: "8px",
                                  border: "1px solid",
                                  borderColor: isStatusOpen ? "#5b8e66" : "#e2e8f0",
                                  backgroundColor: isStatusOpen ? "#f8fafc" : "#ffffff",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  color: "#334155",
                                  cursor: "pointer",
                                  boxSizing: "border-box",
                                  boxShadow: isStatusOpen ? "0 0 0 2px rgba(91, 142, 102, 0.15)" : "none",
                                  transition: "all 0.15s ease"
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, overflow: "hidden" }}>
                                  <span
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      backgroundColor: badge.circleColor,
                                      flexShrink: 0
                                    }}
                                  ></span>
                                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
                                    {badge.label}
                                  </span>
                                </div>
                                <i
                                  className="fa-solid fa-chevron-down"
                                  style={{
                                    fontSize: "10px",
                                    color: "#94a3b8",
                                    flexShrink: 0,
                                    transition: "transform 0.2s ease",
                                    transform: isStatusOpen ? "rotate(180deg)" : "none"
                                  }}
                                ></i>
                              </button>

                              {isStatusOpen && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: isLastRow ? "auto" : "calc(100% + 4px)",
                                    bottom: isLastRow ? "calc(100% + 4px)" : "auto",
                                    left: 0,
                                    right: 0,
                                    width: "100%",
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.08)",
                                    zIndex: 10000,
                                    padding: "4px",
                                    boxSizing: "border-box",
                                    textAlign: "left"
                                  }}
                                >
                                  {statusChangeOptions.map((opt) => {
                                    const isSelected = (b.status || "pending") === opt.value;
                                    return (
                                      <div
                                        key={opt.value}
                                        onClick={() => {
                                          setOpenStatusId(null);
                                          if (!isSelected) {
                                            handleStatusChange(b.id, opt.value);
                                          }
                                        }}
                                        style={{
                                          padding: "8px 10px",
                                          borderRadius: "6px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          cursor: "pointer",
                                          backgroundColor: isSelected ? "#f0fdf4" : "transparent",
                                          color: isSelected ? "#15803d" : "#334155",
                                          fontWeight: isSelected ? 600 : 500,
                                          fontSize: "12.5px",
                                          transition: "background-color 0.1s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                                        }}
                                      >
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                          <span
                                            style={{
                                              width: "8px",
                                              height: "8px",
                                              borderRadius: "50%",
                                              backgroundColor: opt.circleColor,
                                              flexShrink: 0
                                            }}
                                          ></span>
                                          <span>{opt.label}</span>
                                        </div>
                                        {isSelected && (
                                          <i className="fa-solid fa-check" style={{ fontSize: "10px", color: "#16a34a" }}></i>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="mobile-cards-view" style={{ padding: "14px" }}>
                {filteredBookings.map((b, index) => {
                  const badge = getStatusBadge(b.status);
                  const isStatusOpen = openStatusId === `mobile-${b.id}`;
                  const isLastItem = index >= filteredBookings.length - 1 && filteredBookings.length > 1;

                  return (
                    <div
                      key={b.id}
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "14px",
                        padding: "16px",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        position: "relative",
                        zIndex: isStatusOpen ? 50 : 1
                      }}
                    >
                      {/* Card Header: User & Status Badge (วงกลม) */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "50%",
                              backgroundColor: "#eef6ee",
                              color: "#2e7d32",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "16px",
                              fontWeight: 700,
                              flexShrink: 0
                            }}
                          >
                            <i className="fa-solid fa-user"></i>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <h3 style={{ margin: "0 0 2px 0", fontSize: "15px", fontWeight: 700, color: "#1e293b", wordBreak: "break-word" }}>
                              {b.userName || b.userEmail || "ไม่ระบุชื่อ"}
                            </h3>
                            {b.userPhone && (
                              <a
                                href={`tel:${b.userPhone}`}
                                style={{ color: "#2563eb", textDecoration: "none", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                              >
                                <i className="fa-solid fa-phone" style={{ fontSize: "11px" }}></i>
                                {b.userPhone}
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Status Badge with วงกลม (Circle) */}
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 700,
                            backgroundColor: badge.bg,
                            color: badge.textColor,
                            border: `1px solid ${badge.border}`,
                            flexShrink: 0
                          }}
                        >
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: badge.circleColor,
                              boxShadow: `0 0 0 2px ${badge.circleRing}`,
                              flexShrink: 0
                            }}
                          ></span>
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      {/* Card Body: Details */}
                      <div
                        style={{
                          backgroundColor: "#f8fafc",
                          borderRadius: "10px",
                          padding: "12px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          fontSize: "13px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="fa-solid fa-hotel" style={{ color: "#7da27c" }}></i> หอพัก:
                          </span>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>{b.dormitoryName || "-"}</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="fa-solid fa-door-open" style={{ color: "#7da27c" }}></i> ห้องพัก:
                          </span>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>{b.roomNumber || "-"}</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="fa-regular fa-calendar-days" style={{ color: "#7da27c" }}></i> วันที่เข้าพัก:
                          </span>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>{b.bookingDate || "-"}</span>
                        </div>

                        {b.note && (
                          <div style={{ marginTop: "4px", paddingTop: "8px", borderTop: "1px dashed #e2e8f0" }}>
                            <span style={{ color: "#64748b", display: "block", marginBottom: "2px" }}>
                              <i className="fa-regular fa-message" style={{ marginRight: "4px" }}></i> ข้อความเพิ่มเติม:
                            </span>
                            <span style={{ color: "#334155", fontStyle: "italic" }}>{b.note}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Status Action with 100% Matching Width Custom Dropdown */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px",
                          paddingTop: "6px"
                        }}
                      >
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>
                          เปลี่ยนสถานะ:
                        </span>

                        <div
                          className="booking-status-dropdown"
                          style={{
                            position: "relative",
                            flex: 1,
                            zIndex: isStatusOpen ? 9999 : 1
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenStatusId(isStatusOpen ? null : `mobile-${b.id}`)}
                            style={{
                              width: "100%",
                              height: "40px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0 12px",
                              borderRadius: "8px",
                              border: "1.5px solid",
                              borderColor: isStatusOpen ? "#5b8e66" : "#cbd5e1",
                              backgroundColor: "#ffffff",
                              fontSize: "13.5px",
                              fontWeight: 600,
                              color: "#1e293b",
                              cursor: "pointer",
                              boxSizing: "border-box",
                              boxShadow: isStatusOpen ? "0 0 0 2px rgba(91, 142, 102, 0.15)" : "none",
                              transition: "all 0.15s ease"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span
                                style={{
                                  width: "9px",
                                  height: "9px",
                                  borderRadius: "50%",
                                  backgroundColor: badge.circleColor,
                                  flexShrink: 0
                                }}
                              ></span>
                              <span>{badge.label}</span>
                            </div>
                            <i
                              className="fa-solid fa-chevron-down"
                              style={{
                                fontSize: "11px",
                                color: "#94a3b8",
                                transition: "transform 0.2s ease",
                                transform: isStatusOpen ? "rotate(180deg)" : "none"
                              }}
                            ></i>
                          </button>

                          {isStatusOpen && (
                            <div
                              style={{
                                position: "absolute",
                                top: isLastItem ? "auto" : "calc(100% + 4px)",
                                bottom: isLastItem ? "calc(100% + 4px)" : "auto",
                                left: 0,
                                right: 0,
                                width: "100%",
                                backgroundColor: "#ffffff",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.08)",
                                zIndex: 10000,
                                padding: "4px",
                                boxSizing: "border-box",
                                overflow: "hidden"
                              }}
                            >
                              {statusChangeOptions.map((opt) => {
                                const isSelected = (b.status || "pending") === opt.value;
                                return (
                                  <div
                                    key={opt.value}
                                    onClick={() => {
                                      setOpenStatusId(null);
                                      if (!isSelected) {
                                        handleStatusChange(b.id, opt.value);
                                      }
                                    }}
                                    style={{
                                      padding: "10px 12px",
                                      borderRadius: "6px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      cursor: "pointer",
                                      backgroundColor: isSelected ? "#f0fdf4" : "transparent",
                                      color: isSelected ? "#15803d" : "#334155",
                                      fontWeight: isSelected ? 600 : 500,
                                      fontSize: "13px",
                                      transition: "background-color 0.1s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <span
                                        style={{
                                          width: "9px",
                                          height: "9px",
                                          borderRadius: "50%",
                                          backgroundColor: opt.circleColor,
                                          flexShrink: 0
                                        }}
                                      ></span>
                                      <span>{opt.label}</span>
                                    </div>
                                    {isSelected && (
                                      <i className="fa-solid fa-check" style={{ fontSize: "11px", color: "#16a34a" }}></i>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
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
