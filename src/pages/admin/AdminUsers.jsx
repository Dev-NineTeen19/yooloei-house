import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAllUsersAdmin, updateUserRole, deleteUserDoc } from "../../services/userService";
import { showConfirm, showAlert } from "../../context/ModalContext";

export default function AdminUsers() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Active role change dropdown in table / mobile cards
  const [openRoleId, setOpenRoleId] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
      if (!event.target.closest(".user-role-dropdown")) {
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

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsersAdmin();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (uid, newRole, userName) => {
    const roleText = newRole === "owner" ? "เจ้าของหอ (owner)" : newRole === "admin" ? "แอดมิน (admin)" : "ผู้เช่า (user)";
    const isConfirmed = await showConfirm({
      title: "เปลี่ยนบทบาทผู้ใช้",
      heading: `เปลี่ยนบทบาทของ "${userName || 'ผู้ใช้งาน'}" เป็น "${roleText}"?`,
      message: "สิทธิ์การเข้าถึงระบบของผู้ใช้งานจะเปลี่ยนตามบทบาทใหม่ทันที",
      confirmText: "เปลี่ยนบทบาท",
      cancelText: "ยกเลิก",
      type: "warning"
    });
    if (!isConfirmed) return;

    setActionLoadingId(uid);
    try {
      await updateUserRole(uid, newRole);
      await showAlert({
        title: "สำเร็จ",
        heading: "เปลี่ยนบทบาทเรียบร้อยแล้ว!",
        type: "success"
      });
      await loadUsers();
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถเปลี่ยนสิทธิ์ได้",
        message: err.data?.error || err.message || "",
        type: "danger"
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (uid, userName) => {
    const currentId = currentUser?.id || currentUser?.uid;
    if (uid === currentId) {
      await showAlert({
        title: "แจ้งเตือน",
        heading: "ไม่สามารถลบบัญชีนี้ได้",
        message: "ไม่สามารถลบบัญชีผู้ดูแลระบบที่กำลังใช้งานอยู่ได้ครับ",
        type: "warning"
      });
      return;
    }

    const isConfirmed = await showConfirm({
      title: "ลบผู้ใช้งาน",
      heading: `ลบข้อมูลผู้ใช้งาน "${userName || 'นี้'}"?`,
      message: "คำเตือน: ข้อมูลที่เกี่ยวข้องทั้งหมดจะถูกลบออกจากระบบอย่างถาวรและไม่สามารถกู้คืนได้",
      confirmText: "ลบผู้ใช้",
      cancelText: "ยกเลิก",
      type: "danger"
    });

    if (!isConfirmed) return;

    setActionLoadingId(uid);
    try {
      await deleteUserDoc(uid);
      await showAlert({
        title: "สำเร็จ",
        heading: "ลบผู้ใช้งานเรียบร้อยแล้ว!",
        type: "success"
      });
      await loadUsers();
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถลบผู้ใช้งานได้",
        message: err.data?.error || err.message || "",
        type: "danger"
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const getRoleInfo = (role) => {
    if (role === "admin") {
      return {
        label: "ผู้ดูแลระบบ",
        circleColor: "#7c3aed",
        bg: "#f5f3ff",
        color: "#6d28d9",
        border: "#ddd6fe"
      };
    }
    if (role === "owner") {
      return {
        label: "เจ้าของหอพัก",
        circleColor: "#16a34a",
        bg: "#f0fdf4",
        color: "#15803d",
        border: "#bbf7d0"
      };
    }
    return {
      label: "ผู้เช่าทั่วไป",
      circleColor: "#0284c7",
      bg: "#f0f9ff",
      color: "#0369a1",
      border: "#bae6fd"
    };
  };

  const roleChangeOptions = [
    { value: "user", label: "ผู้เช่าทั่วไป", circleColor: "#0284c7" },
    { value: "owner", label: "เจ้าของหอพัก", circleColor: "#16a34a" },
    { value: "admin", label: "ผู้ดูแลระบบ", circleColor: "#7c3aed" }
  ];

  const roleOptions = [
    { key: "all", label: "ทั้งหมด", count: users.length, circleColor: "#5b8e66" },
    { key: "user", label: "ผู้เช่า (User)", count: users.filter((u) => u.role === "user").length, circleColor: "#0284c7" },
    { key: "owner", label: "เจ้าของหอ (Owner)", count: users.filter((u) => u.role === "owner").length, circleColor: "#16a34a" },
    { key: "admin", label: "แอดมิน (Admin)", count: users.filter((u) => u.role === "admin").length, circleColor: "#7c3aed" },
  ];
  const currentRoleOption = roleOptions.find((o) => o.key === roleFilter) || roleOptions[0];

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
    const name = (u.displayName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const phone = (u.phone || "").toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch = !query || name.includes(query) || email.includes(query) || phone.includes(query);
    return matchesRole && matchesSearch;
  });

  const currentId = currentUser?.id || currentUser?.uid;

  return (
    <div>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "24px", color: "#1e293b", fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>
              จัดการผู้ใช้งาน (Users Management)
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
                <i className="fa-solid fa-users" style={{ fontSize: "11px" }}></i>
                {users.length} บัญชี
              </span>
            )}
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            จัดการรายชื่อสมาชิก, เปลี่ยนแปลงบทบาท และลบบัญชีผู้ใช้งานในระบบ
          </p>
        </div>
      </div>

      {/* Controls: Role Filter Dropdown and Search Bar */}
      <div className="content-card" style={{ marginBottom: "20px", padding: "16px 20px", overflow: "visible", position: "relative", zIndex: 50 }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          {/* Search Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 280px", minWidth: 0, width: "100%" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>
              ค้นหาผู้ใช้งาน:
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

          {/* Role Filter Dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 200px", minWidth: 0, width: "100%", position: "relative" }} ref={roleDropdownRef}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>
              บทบาทผู้ใช้งาน:
            </label>
            <button
              type="button"
              onClick={() => setRoleDropdownOpen((prev) => !prev)}
              style={{
                height: "42px",
                width: "100%",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: roleDropdownOpen ? "#5b8e66" : "#cbd5e1",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#334155",
                cursor: "pointer",
                boxShadow: roleDropdownOpen ? "0 0 0 2px rgba(91, 142, 102, 0.15)" : "none",
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
                    backgroundColor: currentRoleOption.circleColor,
                    flexShrink: 0
                  }}
                ></span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {currentRoleOption.label}
                  <span style={{ color: "#94a3b8", marginLeft: "4px", fontSize: "12px" }}>({currentRoleOption.count})</span>
                </span>
              </div>
              <i
                className="fa-solid fa-chevron-down"
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  flexShrink: 0,
                  transition: "transform 0.2s ease",
                  transform: roleDropdownOpen ? "rotate(180deg)" : "none"
                }}
              ></i>
            </button>

            {roleDropdownOpen && (
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
                {roleOptions.map((opt) => {
                  const isSelected = roleFilter === opt.key;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => {
                        setRoleFilter(opt.key);
                        setRoleDropdownOpen(false);
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
              กำลังโหลดข้อมูลผู้ใช้งาน...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#888" }}>
              <i className="fa-regular fa-user" style={{ fontSize: "48px", color: "#cbd5e1", marginBottom: "16px", display: "block" }}></i>
              <h3 style={{ color: "#475569", fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0" }}>ไม่พบข้อมูลผู้ใช้งาน</h3>
              <p style={{ color: "#94a3b8", fontSize: "13.5px", margin: 0 }}>
                {searchTerm || roleFilter !== "all" ? "ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองบทบาทใหม่อีกครั้ง" : "ยังไม่มีข้อมูลผู้ใช้งานในระบบ"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Minimalist, Perfectly Balanced & No Overflow */}
              <div className="table-responsive desktop-table-view" style={{ overflowX: "auto", minHeight: "260px" }}>
                <table className="custom-table" style={{ width: "100%", tableLayout: "auto" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ width: "25%", whiteSpace: "nowrap", padding: "12px 14px", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        ผู้ใช้งาน
                      </th>
                      <th style={{ width: "16%", whiteSpace: "nowrap", padding: "12px 10px", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        เบอร์โทรศัพท์
                      </th>
                      <th style={{ width: "15%", whiteSpace: "nowrap", padding: "12px 10px", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        วันที่สมัคร
                      </th>
                      <th style={{ width: "16%", whiteSpace: "nowrap", padding: "12px 10px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        บทบาทในระบบ
                      </th>
                      <th style={{ width: "16%", whiteSpace: "nowrap", padding: "12px 10px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        เปลี่ยนบทบาท
                      </th>
                      <th style={{ width: "12%", whiteSpace: "nowrap", padding: "12px 14px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#64748b" }}>
                        การดำเนินการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, index) => {
                      const isSelf = u.id === currentId;
                      const isBusy = actionLoadingId === u.id;
                      const displayName = u.displayName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "-";
                      const roleInfo = getRoleInfo(u.role);
                      const isRoleOpen = openRoleId === `desktop-${u.id}`;
                      const isLastRow = index >= filteredUsers.length - 2 && filteredUsers.length > 2;

                      return (
                        <tr
                          key={u.id}
                          style={{
                            position: "relative",
                            zIndex: isRoleOpen ? 9999 : 1,
                            opacity: isBusy ? 0.6 : 1,
                            borderBottom: "1px solid #f1f5f9"
                          }}
                        >
                          {/* 1. ผู้ใช้งาน */}
                          <td style={{ verticalAlign: "middle", padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
                              {u.avatarUrl ? (
                                <img
                                  src={u.avatarUrl}
                                  alt={displayName}
                                  style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid #e2e8f0" }}
                                  onError={(e) => { e.target.style.display = "none"; }}
                                />
                              ) : (
                                <div style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  background: u.role === "admin" ? "#f5f3ff" : u.role === "owner" ? "#eef6ee" : "#f0f9ff",
                                  color: u.role === "admin" ? "#7c3aed" : u.role === "owner" ? "#2e7d32" : "#0284c7",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "13.5px",
                                  fontWeight: 700,
                                  flexShrink: 0,
                                  border: `1px solid ${roleInfo.border}`
                                }}>
                                  {displayName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div style={{ overflow: "hidden", minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <strong style={{ color: "#1e293b", fontSize: "13.5px", display: "block" }}>
                                    {displayName}
                                  </strong>
                                  {isSelf && (
                                    <span style={{
                                      fontSize: "10.5px",
                                      background: "#f1f5f9",
                                      color: "#475569",
                                      padding: "1px 5px",
                                      borderRadius: "4px",
                                      fontWeight: 600
                                    }}>
                                      (คุณ)
                                    </span>
                                  )}
                                </div>
                                <span style={{ color: "#94a3b8", fontSize: "12px", display: "block" }}>
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 2. เบอร์โทรศัพท์ */}
                          <td style={{ verticalAlign: "middle", padding: "12px 10px", whiteSpace: "nowrap" }}>
                            {u.phone ? (
                              <a
                                href={`tel:${u.phone}`}
                                style={{ color: "#2563eb", textDecoration: "none", fontSize: "13px", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "6px" }}
                              >
                                <i className="fa-solid fa-phone" style={{ fontSize: "11px", color: "#64748b" }}></i>
                                {u.phone}
                              </a>
                            ) : (
                              <span style={{ color: "#94a3b8", fontSize: "13px" }}>-</span>
                            )}
                          </td>

                          {/* 3. วันที่สมัคร */}
                          <td style={{ verticalAlign: "middle", padding: "12px 10px", whiteSpace: "nowrap" }}>
                            <span style={{ color: "#475569", fontSize: "12.5px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <i className="fa-regular fa-calendar" style={{ color: "#94a3b8", fontSize: "11px" }}></i>
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString("th-TH") : "-"}
                            </span>
                          </td>

                          {/* 4. บทบาทในระบบ */}
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
                                backgroundColor: roleInfo.bg,
                                color: roleInfo.color,
                                border: `1px solid ${roleInfo.border}`,
                                boxSizing: "border-box"
                              }}
                            >
                              <span
                                style={{
                                  width: "7px",
                                  height: "7px",
                                  borderRadius: "50%",
                                  backgroundColor: roleInfo.circleColor,
                                  flexShrink: 0
                                }}
                              ></span>
                              <span>{roleInfo.label}</span>
                            </div>
                          </td>

                          {/* 5. เปลี่ยนบทบาท */}
                          <td style={{ verticalAlign: "middle", padding: "12px 10px", textAlign: "center", whiteSpace: "nowrap" }}>
                            <div
                              className="user-role-dropdown"
                              style={{
                                position: "relative",
                                display: "inline-block",
                                width: "132px",
                                margin: "0 auto"
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isSelf && !isBusy) {
                                    setOpenRoleId(isRoleOpen ? null : `desktop-${u.id}`);
                                  }
                                }}
                                disabled={isBusy || isSelf}
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
                                  color: isSelf ? "#94a3b8" : "#334155",
                                  cursor: isSelf ? "not-allowed" : "pointer",
                                  boxSizing: "border-box",
                                  boxShadow: isRoleOpen ? "0 0 0 2px rgba(91, 142, 102, 0.15)" : "none",
                                  transition: "all 0.15s ease",
                                  opacity: isSelf ? 0.6 : 1
                                }}
                                title={isSelf ? "ไม่สามารถเปลี่ยนบทบาทของตัวเองได้" : "เลือกบทบาทใหม่"}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, overflow: "hidden" }}>
                                  <span
                                    style={{
                                      width: "7px",
                                      height: "7px",
                                      borderRadius: "50%",
                                      backgroundColor: roleInfo.circleColor,
                                      flexShrink: 0
                                    }}
                                  ></span>
                                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
                                    {u.role === "admin" ? "ผู้ดูแลระบบ" : u.role === "owner" ? "เจ้าของหอพัก" : "ผู้เช่าทั่วไป"}
                                  </span>
                                </div>
                                {!isSelf && (
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
                                )}
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
                                    const isSelected = (u.role || "user") === opt.value;
                                    return (
                                      <div
                                        key={opt.value}
                                        onClick={() => {
                                          setOpenRoleId(null);
                                          if (!isSelected) {
                                            handleRoleChange(u.id, opt.value, displayName);
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

                          {/* 6. การดำเนินการ */}
                          <td style={{ verticalAlign: "middle", padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                              {!isSelf && (
                                <Link
                                  to={`/admin/messages?ownerId=${u.id}&ownerName=${encodeURIComponent(displayName)}`}
                                  title="ทักแชทหาผู้ใช้งานนี้"
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
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#c8e6c9"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#e8f5e9"; }}
                                  >
                                    <i className="fa-solid fa-comments"></i>
                                  </button>
                                
                                </Link>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDelete(u.id, displayName)}
                                disabled={isBusy || isSelf}
                                title={isSelf ? "ไม่สามารถลบบัญชีของตนเองได้" : "ลบข้อมูลผู้ใช้งาน"}
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "8px",
                                  border: "1px solid #fecaca",
                                  backgroundColor: "#fef2f2",
                                  color: "#dc2626",
                                  cursor: isSelf ? "not-allowed" : "pointer",
                                  opacity: isSelf ? 0.35 : 1,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "13px",
                                  transition: "all 0.15s ease"
                                }}
                                onMouseEnter={(e) => { if (!isSelf) e.currentTarget.style.backgroundColor = "#fee2e2"; }}
                                onMouseLeave={(e) => { if (!isSelf) e.currentTarget.style.backgroundColor = "#fef2f2"; }}
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
                {filteredUsers.map((u, index) => {
                  const isSelf = u.id === currentId;
                  const isBusy = actionLoadingId === u.id;
                  const displayName = u.displayName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "-";
                  const roleInfo = getRoleInfo(u.role);
                  const isRoleOpen = openRoleId === `mobile-${u.id}`;
                  const isLastItem = index >= filteredUsers.length - 1 && filteredUsers.length > 1;

                  return (
                    <div
                      key={u.id}
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
                        zIndex: isRoleOpen ? 50 : 1,
                        opacity: isBusy ? 0.6 : 1
                      }}
                    >
                      {/* Card Header: User Info & Role Badge */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt={displayName}
                              style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid #e2e8f0" }}
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "50%",
                              background: u.role === "admin" ? "#f5f3ff" : u.role === "owner" ? "#eef6ee" : "#f0f9ff",
                              color: u.role === "admin" ? "#7c3aed" : u.role === "owner" ? "#2e7d32" : "#0284c7",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                              fontWeight: 700,
                              flexShrink: 0,
                              border: `1px solid ${roleInfo.border}`
                            }}>
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <h3 style={{ margin: "0", fontSize: "15px", fontWeight: 700, color: "#1e293b", wordBreak: "break-word" }}>
                                {displayName}
                              </h3>
                              {isSelf && (
                                <span style={{
                                  fontSize: "10.5px",
                                  background: "#f1f5f9",
                                  color: "#475569",
                                  padding: "1px 5px",
                                  borderRadius: "4px",
                                  fontWeight: 600
                                }}>
                                  (คุณ)
                                </span>
                              )}
                            </div>
                            <span style={{ color: "#64748b", fontSize: "12.5px", display: "block", wordBreak: "break-word" }}>
                              {u.email}
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
                            backgroundColor: roleInfo.bg,
                            color: roleInfo.color,
                            border: `1px solid ${roleInfo.border}`,
                            flexShrink: 0
                          }}
                        >
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: roleInfo.circleColor,
                              flexShrink: 0
                            }}
                          ></span>
                          <span>{roleInfo.label}</span>
                        </span>
                      </div>

                      {/* Card Body: Phone & Date & Chat */}
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
                          {u.phone ? (
                            <a href={`tel:${u.phone}`} style={{ fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                              {u.phone}
                            </a>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>-</span>
                          )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="fa-regular fa-calendar" style={{ color: "#7da27c" }}></i> วันที่สมัคร:
                          </span>
                          <span style={{ fontWeight: 600, color: "#334155" }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString("th-TH") : "-"}
                          </span>
                        </div>

                        {!isSelf && (
                          <div style={{ marginTop: "4px", paddingTop: "8px", borderTop: "1px dashed #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
                            <Link
                              to={`/admin/messages?ownerId=${u.id}&ownerName=${encodeURIComponent(displayName)}`}
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
                              <span>แชทกับผู้ใช้งาน</span>
                            </Link>
                          </div>
                        )}
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
                          className="user-role-dropdown"
                          style={{
                            position: "relative",
                            flex: 1,
                            zIndex: isRoleOpen ? 9999 : 1
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (!isSelf && !isBusy) {
                                setOpenRoleId(isRoleOpen ? null : `mobile-${u.id}`);
                              }
                            }}
                            disabled={isBusy || isSelf}
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
                              color: isSelf ? "#94a3b8" : "#1e293b",
                              cursor: isSelf ? "not-allowed" : "pointer",
                              boxSizing: "border-box",
                              boxShadow: isRoleOpen ? "0 0 0 2px rgba(91, 142, 102, 0.15)" : "none",
                              transition: "all 0.15s ease",
                              opacity: isSelf ? 0.6 : 1
                            }}
                            title={isSelf ? "ไม่สามารถเปลี่ยนบทบาทของตัวเองได้" : "เลือกบทบาทใหม่"}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span
                                style={{
                                  width: "9px",
                                  height: "9px",
                                  borderRadius: "50%",
                                  backgroundColor: roleInfo.circleColor,
                                  flexShrink: 0
                                }}
                              ></span>
                              <span>{u.role === "admin" ? "แอดมิน" : u.role === "owner" ? "เจ้าของหอ" : "ผู้เช่า"}</span>
                            </div>
                            {!isSelf && (
                              <i
                                className="fa-solid fa-chevron-down"
                                style={{
                                  fontSize: "11px",
                                  color: "#94a3b8",
                                  transition: "transform 0.2s ease",
                                  transform: isRoleOpen ? "rotate(180deg)" : "none"
                                }}
                              ></i>
                            )}
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
                                const isSelected = (u.role || "user") === opt.value;
                                return (
                                  <div
                                    key={opt.value}
                                    onClick={() => {
                                      setOpenRoleId(null);
                                      if (!isSelected) {
                                        handleRoleChange(u.id, opt.value, displayName);
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
                          onClick={() => handleDelete(u.id, displayName)}
                          disabled={isBusy || isSelf}
                          title={isSelf ? "ไม่สามารถลบบัญชีของตนเองได้" : "ลบผู้ใช้"}
                          style={{
                            height: "40px",
                            padding: "0 14px",
                            borderRadius: "8px",
                            border: "1px solid #fecaca",
                            backgroundColor: "#fef2f2",
                            color: "#dc2626",
                            cursor: isSelf ? "not-allowed" : "pointer",
                            opacity: isSelf ? 0.35 : 1,
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
                          <span>{isSelf ? "บัญชีคุณ" : "ลบ"}</span>
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
