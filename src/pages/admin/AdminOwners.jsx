import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllUsersAdmin, updateUserRole, deleteUserDoc } from "../../services/userService";
import { showConfirm, showAlert } from "../../context/ModalContext";

export default function AdminOwners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openRoleId, setOpenRoleId] = useState(null);

  const loadOwners = async () => {
    setLoading(true);
    try {
      const data = await getAllUsersAdmin();
      setOwners(data.filter((u) => u.role === "owner"));
    } catch (err) {
      console.error("Error loading owners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, []);

  // Click outside listener for custom dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".owner-role-dropdown")) {
        setOpenRoleId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleRoleChange = async (uid, newRole) => {
    const roleLabels = {
      owner: "เจ้าของหอ (owner)",
      user: "ผู้เช่า (user)",
      admin: "แอดมิน (admin)"
    };

    const isConfirmed = await showConfirm({
      title: "เปลี่ยนบทบาทผู้ใช้",
      heading: `ต้องการเปลี่ยนสิทธิ์เป็น "${roleLabels[newRole] || newRole}" ใช่หรือไม่?`,
      message: "สิทธิ์การเข้าถึงเมนูต่างๆ ในระบบจะถูกอัปเดตทันที",
      confirmText: "ยืนยัน",
      cancelText: "ยกเลิก",
      type: newRole === "user" ? "warning" : "question"
    });

    if (!isConfirmed) return;

    try {
      await updateUserRole(uid, newRole);
      await showAlert({
        title: "สำเร็จ",
        heading: "เปลี่ยนบทบาทเรียบร้อยแล้ว!",
        type: "success"
      });
      await loadOwners();
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถเปลี่ยนสิทธิ์ได้",
        message: err.data?.error || err.message || "",
        type: "danger"
      });
    }
  };

  const handleDelete = async (uid) => {
    const isConfirmed = await showConfirm({
      title: "ลบข้อมูลเจ้าของหอพัก",
      heading: "คุณต้องการลบข้อมูลเจ้าของหอพักนี้ใช่หรือไม่?",
      message: "คำเตือน: หอพักและข้อมูลที่เกี่ยวข้องทั้งหมดจะถูกลบออกจากระบบอย่างถาวรและไม่สามารถกู้คืนได้",
      confirmText: "ลบเจ้าของหอพัก",
      cancelText: "ยกเลิก",
      type: "danger"
    });

    if (!isConfirmed) return;

    try {
      await deleteUserDoc(uid);
      await showAlert({
        title: "สำเร็จ",
        heading: "ลบข้อมูลเจ้าของหอพักเรียบร้อยแล้ว!",
        type: "success"
      });
      await loadOwners();
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถลบข้อมูลได้",
        message: err.data?.error || err.message || "",
        type: "danger"
      });
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return {
          label: "ผู้ดูแลระบบ",
          circleColor: "#7c3aed",
          bg: "#f5f3ff",
          border: "#ddd6fe",
          textColor: "#6d28d9"
        };
      case "user":
        return {
          label: "ผู้เช่าทั่วไป",
          circleColor: "#0284c7",
          bg: "#f0f9ff",
          border: "#bae6fd",
          textColor: "#0369a1"
        };
      default:
        return {
          label: "เจ้าของหอพัก",
          circleColor: "#16a34a",
          bg: "#f0fdf4",
          border: "#bbf7d0",
          textColor: "#15803d"
        };
    }
  };

  const roleChangeOptions = [
    { value: "owner", label: "เจ้าของหอพัก", circleColor: "#16a34a" },
    { value: "user", label: "ผู้เช่าทั่วไป", circleColor: "#0284c7" },
    { value: "admin", label: "ผู้ดูแลระบบ", circleColor: "#7c3aed" }
  ];

  const filteredOwners = owners.filter((o) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const name = (o.displayName || `${o.firstName || ""} ${o.lastName || ""}`).toLowerCase();
    const email = (o.email || "").toLowerCase();
    const phone = (o.phone || "").toLowerCase();
    return name.includes(term) || email.includes(term) || phone.includes(term);
  });

  return (
    <div>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "24px", color: "#1e293b", fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>
              จัดการเจ้าของหอพัก (Owners)
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
                <i className="fa-solid fa-user-tie" style={{ fontSize: "11px" }}></i>
                {owners.length} ท่าน
              </span>
            )}
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            รายชื่อเจ้าของหอพักทั้งหมดที่ลงทะเบียนในระบบ จัดการสิทธิ์การใช้งานและติดต่อสื่อสาร
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="content-card" style={{ marginBottom: "20px", padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "260px" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>
              ค้นหาเจ้าของหอพัก:
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px" }}
              ></i>
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล หรือเบอร์โทรศัพท์..."
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
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-card">
        <div className="content-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#7da27c" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "24px", marginBottom: "12px", display: "block" }}></i>
              กำลังโหลดข้อมูลเจ้าของหอพัก...
            </div>
          ) : filteredOwners.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#888" }}>
              <i className="fa-regular fa-user" style={{ fontSize: "48px", color: "#cbd5e1", marginBottom: "16px", display: "block" }}></i>
              <h3 style={{ color: "#475569", fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0" }}>ไม่พบข้อมูลเจ้าของหอพัก</h3>
              <p style={{ color: "#94a3b8", fontSize: "13.5px", margin: 0 }}>
                {searchTerm ? "ลองปรับเปลี่ยนคำค้นหาใหม่อีกครั้ง" : "ยังไม่มีข้อมูลเจ้าของหอพักในระบบ"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Minimalist & Perfectly Balanced */}
              <div className="table-responsive desktop-table-view" style={{ overflowX: "auto", minHeight: "260px" }}>
                <table className="custom-table" style={{ width: "100%", tableLayout: "auto" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ width: "32%", whiteSpace: "nowrap", padding: "12px 14px", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        เจ้าของหอพัก
                      </th>
                      <th style={{ width: "20%", whiteSpace: "nowrap", padding: "12px 10px", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        เบอร์โทรศัพท์
                      </th>
                      <th style={{ width: "18%", whiteSpace: "nowrap", padding: "12px 10px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        บทบาทในระบบ
                      </th>
                      <th style={{ width: "18%", whiteSpace: "nowrap", padding: "12px 10px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        เปลี่ยนสิทธิ์
                      </th>
                      <th style={{ width: "12%", whiteSpace: "nowrap", padding: "12px 14px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOwners.map((o, index) => {
                      const roleBadge = getRoleBadge(o.role || "owner");
                      const isRoleOpen = openRoleId === `desktop-${o.id}`;
                      const isLastRow = index >= filteredOwners.length - 2 && filteredOwners.length > 2;

                      return (
                        <tr
                          key={o.id}
                          style={{
                            position: "relative",
                            zIndex: isRoleOpen ? 9999 : 1,
                            borderBottom: "1px solid #f1f5f9"
                          }}
                        >
                          {/* 1. เจ้าของหอพัก */}
                          <td style={{ verticalAlign: "middle", padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
                              <div
                                style={{
                                  width: "36px",
                                  height: "36px",
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
                                <i className="fa-solid fa-user-tie"></i>
                              </div>
                              <div style={{ overflow: "hidden", minWidth: 0 }}>
                                <strong style={{ color: "#1e293b", fontSize: "13.5px", display: "block" }}>
                                  {o.displayName || `${o.firstName || ""} ${o.lastName || ""}`.trim() || "-"}
                                </strong>
                                <span style={{ color: "#94a3b8", fontSize: "12px", display: "block" }}>
                                  {o.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 2. เบอร์โทรศัพท์ */}
                          <td style={{ verticalAlign: "middle", padding: "12px 10px", whiteSpace: "nowrap" }}>
                            {o.phone ? (
                              <a
                                href={`tel:${o.phone}`}
                                style={{ color: "#2563eb", textDecoration: "none", fontSize: "13px", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "6px" }}
                              >
                                <i className="fa-solid fa-phone" style={{ fontSize: "11px", color: "#64748b" }}></i>
                                {o.phone}
                              </a>
                            ) : (
                              <span style={{ color: "#94a3b8", fontSize: "13px" }}>-</span>
                            )}
                          </td>

                          {/* 3. บทบาทในระบบ */}
                          <td style={{ verticalAlign: "middle", padding: "12px 10px", textAlign: "center", whiteSpace: "nowrap" }}>
                            <div
                              style={{
                                width: "116px",
                                height: "36px",
                                margin: "0 auto",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "7px",
                                padding: "0 8px",
                                borderRadius: "8px",
                                fontSize: "12.5px",
                                fontWeight: 600,
                                backgroundColor: roleBadge.bg,
                                color: roleBadge.textColor,
                                border: `1px solid ${roleBadge.border}`,
                                boxSizing: "border-box"
                              }}
                            >
                              <span
                                style={{
                                  width: "7px",
                                  height: "7px",
                                  borderRadius: "50%",
                                  backgroundColor: roleBadge.circleColor,
                                  flexShrink: 0
                                }}
                              ></span>
                              <span>{roleBadge.label}</span>
                            </div>
                          </td>

                          {/* 4. เปลี่ยนสิทธิ์ */}
                          <td style={{ verticalAlign: "middle", padding: "12px 10px", textAlign: "center", whiteSpace: "nowrap" }}>
                            <div
                              className="owner-role-dropdown"
                              style={{
                                position: "relative",
                                display: "inline-block",
                                width: "132px",
                                margin: "0 auto"
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => setOpenRoleId(isRoleOpen ? null : `desktop-${o.id}`)}
                                style={{
                                  width: "100%",
                                  height: "36px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "0 10px",
                                  borderRadius: "8px",
                                  border: "1px solid",
                                  borderColor: isRoleOpen ? "#5b8e66" : "#e2e8f0",
                                  backgroundColor: isRoleOpen ? "#f8fafc" : "#ffffff",
                                  fontSize: "12.5px",
                                  fontWeight: 500,
                                  color: "#334155",
                                  cursor: "pointer",
                                  boxSizing: "border-box",
                                  boxShadow: isRoleOpen ? "0 0 0 2px rgba(91, 142, 102, 0.15)" : "none",
                                  transition: "all 0.15s ease"
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, overflow: "hidden" }}>
                                  <span
                                    style={{
                                      width: "7px",
                                      height: "7px",
                                      borderRadius: "50%",
                                      backgroundColor: roleBadge.circleColor,
                                      flexShrink: 0
                                    }}
                                  ></span>
                                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
                                    {o.role === "admin" ? "ผู้ดูแลระบบ" : o.role === "user" ? "ผู้เช่าทั่วไป" : "เจ้าของหอพัก"}
                                  </span>
                                </div>
                                <i
                                  className="fa-solid fa-chevron-down"
                                  style={{
                                    fontSize: "10px",
                                    color: "#94a3b8",
                                    flexShrink: 0,
                                    transition: "transform 0.2s ease",
                                    transform: isRoleOpen ? "rotate(180deg)" : "none"
                                  }}
                                ></i>
                              </button>

                              {isRoleOpen && (
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
                                  {roleChangeOptions.map((opt) => {
                                    const isSelected = (o.role || "owner") === opt.value;
                                    return (
                                      <div
                                        key={opt.value}
                                        onClick={() => {
                                          setOpenRoleId(null);
                                          if (!isSelected) {
                                            handleRoleChange(o.id, opt.value);
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
                                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                          <span
                                            style={{
                                              width: "7px",
                                              height: "7px",
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

                          {/* 5. การดำเนินการ */}
                          <td style={{ verticalAlign: "middle", padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                              <Link
                                to={`/admin/messages?ownerId=${o.id}&ownerName=${encodeURIComponent(o.displayName || `${o.firstName || ""} ${o.lastName || ""}`.trim() || o.username || "เจ้าของหอพัก")}`}
                                title="แชทกับเจ้าของหอพักนี้"
                              >
                                <button
                                  type="button"
                                  style={{
                                    width: "34px",
                                    height: "34px",
                                    borderRadius: "8px",
                                    border: "1px solid #c8e6c9",
                                    backgroundColor: "#e8f5e9",
                                    color: "#2e7d32",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "13px",
                                    transition: "all 0.15s ease"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#c8e6c9";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#e8f5e9";
                                  }}
                                >
                                  <i className="fa-solid fa-comments"></i>
                                </button>
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(o.id)}
                                title="ลบข้อมูล"
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "8px",
                                  border: "1px solid #fecaca",
                                  backgroundColor: "#fef2f2",
                                  color: "#dc2626",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "13px",
                                  transition: "all 0.15s ease"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#fee2e2";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#fef2f2";
                                }}
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
              <div className="mobile-cards-view" style={{ padding: "14px" }}>
                {filteredOwners.map((o, index) => {
                  const roleBadge = getRoleBadge(o.role || "owner");
                  const isRoleOpen = openRoleId === `mobile-${o.id}`;
                  const isLastItem = index >= filteredOwners.length - 1 && filteredOwners.length > 1;

                  return (
                    <div
                      key={o.id}
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
                        zIndex: isRoleOpen ? 50 : 1
                      }}
                    >
                      {/* Card Header: Owner Info & Role Badge */}
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
                            <i className="fa-solid fa-user-tie"></i>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <h3 style={{ margin: "0 0 2px 0", fontSize: "15px", fontWeight: 700, color: "#1e293b", wordBreak: "break-word" }}>
                              {o.displayName || `${o.firstName || ""} ${o.lastName || ""}`.trim() || "-"}
                            </h3>
                            <span style={{ color: "#64748b", fontSize: "12.5px", display: "block", wordBreak: "break-word" }}>
                              {o.email}
                            </span>
                          </div>
                        </div>

                        {/* Role Badge with Circle Indicator */}
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 700,
                            backgroundColor: roleBadge.bg,
                            color: roleBadge.textColor,
                            border: `1px solid ${roleBadge.border}`,
                            flexShrink: 0
                          }}
                        >
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: roleBadge.circleColor,
                              flexShrink: 0
                            }}
                          ></span>
                          <span>{roleBadge.label}</span>
                        </span>
                      </div>

                      {/* Card Body: Phone & Chat */}
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
                            <i className="fa-solid fa-phone" style={{ color: "#7da27c" }}></i> เบอร์โทรศัพท์:
                          </span>
                          {o.phone ? (
                            <a href={`tel:${o.phone}`} style={{ fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                              {o.phone}
                            </a>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>-</span>
                          )}
                        </div>

                        <div style={{ marginTop: "4px", paddingTop: "8px", borderTop: "1px dashed #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
                          <Link
                            to={`/admin/messages?ownerId=${o.id}&ownerName=${encodeURIComponent(o.displayName || `${o.firstName || ""} ${o.lastName || ""}`.trim() || o.username || "เจ้าของหอพัก")}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "12.5px",
                              fontWeight: 600,
                              color: "#2e7d32",
                              backgroundColor: "#e8f5e9",
                              border: "1px solid #c8e6c9",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              textDecoration: "none"
                            }}
                          >
                            <i className="fa-solid fa-comments"></i>
                            <span>แชทกับเจ้าของหอ</span>
                          </Link>
                        </div>
                      </div>

                      {/* Card Footer: Role Change Dropdown & Delete Button */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px",
                          paddingTop: "6px"
                        }}
                      >
                        {/* Custom Role Dropdown */}
                        <div
                          className="owner-role-dropdown"
                          style={{
                            position: "relative",
                            flex: 1,
                            zIndex: isRoleOpen ? 9999 : 1
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenRoleId(isRoleOpen ? null : `mobile-${o.id}`)}
                            style={{
                              width: "100%",
                              height: "40px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0 12px",
                              borderRadius: "8px",
                              border: "1.5px solid",
                              borderColor: isRoleOpen ? "#5b8e66" : "#cbd5e1",
                              backgroundColor: "#ffffff",
                              fontSize: "13.5px",
                              fontWeight: 600,
                              color: "#1e293b",
                              cursor: "pointer",
                              boxSizing: "border-box",
                              boxShadow: isRoleOpen ? "0 0 0 2px rgba(91, 142, 102, 0.15)" : "none",
                              transition: "all 0.15s ease"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span
                                style={{
                                  width: "9px",
                                  height: "9px",
                                  borderRadius: "50%",
                                  backgroundColor: roleBadge.circleColor,
                                  flexShrink: 0
                                }}
                              ></span>
                              <span>{o.role === "admin" ? "แอดมิน" : o.role === "user" ? "ผู้เช่า" : "เจ้าของหอ"}</span>
                            </div>
                            <i
                              className="fa-solid fa-chevron-down"
                              style={{
                                fontSize: "11px",
                                color: "#94a3b8",
                                transition: "transform 0.2s ease",
                                transform: isRoleOpen ? "rotate(180deg)" : "none"
                              }}
                            ></i>
                          </button>

                          {isRoleOpen && (
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
                              {roleChangeOptions.map((opt) => {
                                const isSelected = (o.role || "owner") === opt.value;
                                return (
                                  <div
                                    key={opt.value}
                                    onClick={() => {
                                      setOpenRoleId(null);
                                      if (!isSelected) {
                                        handleRoleChange(o.id, opt.value);
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

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(o.id)}
                          title="ลบเจ้าของหอพัก"
                          style={{
                            height: "40px",
                            padding: "0 14px",
                            borderRadius: "8px",
                            border: "1px solid #fecaca",
                            backgroundColor: "#fef2f2",
                            color: "#dc2626",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            fontSize: "13px",
                            fontWeight: 600,
                            flexShrink: 0
                          }}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                          <span>ลบ</span>
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
    </div>
  );
}
