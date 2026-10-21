import { useState, useEffect, useRef } from "react";
import { api } from "../../services/apiClient";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/logs");
      setLogs(res.logs || []);
    } catch (err) {
      console.error("Error loading logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getActionMeta = (log) => {
    const act = (log.action || "").toUpperCase();
    const type = (log.type || "").toLowerCase();

    // 1. สมาชิกใหม่
    if (type === "new_user" || act.includes("ผู้ใช้งานใหม่") || act.includes("REGISTER") || act.includes("NEW_USER")) {
      return {
        category: "new_user",
        title: "สมาชิกใหม่ลงทะเบียน",
        icon: "fa-solid fa-user-plus",
        circleColor: "#0284c7",
        bg: "#f0f9ff",
        color: "#0369a1",
        border: "#bae6fd"
      };
    }

    // 2. ข่าวประกาศ
    if (act.includes("ANNOUNCEMENT")) {
      if (act.includes("CREATE") || act.includes("ADD")) {
        return {
          category: "announcement",
          title: "สร้างประกาศข่าวสารใหม่",
          icon: "fa-solid fa-bullhorn",
          circleColor: "#16a34a",
          bg: "#f0fdf4",
          color: "#15803d",
          border: "#bbf7d0"
        };
      }
      if (act.includes("DELETE")) {
        return {
          category: "announcement",
          title: "ลบประกาศข่าวสาร",
          icon: "fa-solid fa-trash-can",
          circleColor: "#dc2626",
          bg: "#fef2f2",
          color: "#b91c1c",
          border: "#fecaca"
        };
      }
      return {
        category: "announcement",
        title: "แก้ไขประกาศข่าวสาร",
        icon: "fa-solid fa-pen-to-square",
        circleColor: "#eab308",
        bg: "#fefce8",
        color: "#a16207",
        border: "#fef08a"
      };
    }

    // 3. ตั้งค่าระบบ
    if (act.includes("SETTINGS")) {
      return {
        category: "settings",
        title: "ปรับแต่งการตั้งค่าระบบ",
        icon: "fa-solid fa-sliders",
        circleColor: "#8b5cf6",
        bg: "#f5f3ff",
        color: "#6d28d9",
        border: "#ddd6fe"
      };
    }

    // 4. จัดการพื้นที่ / ประเภทห้อง
    if (act.includes("LOCATION") || act.includes("ROOM_TYPE")) {
      const isDelete = act.includes("DELETE");
      return {
        category: "settings",
        title: isDelete ? "ลบข้อมูลพื้นที่/ประเภทห้อง" : "เพิ่มข้อมูลพื้นที่/ประเภทห้อง",
        icon: isDelete ? "fa-solid fa-trash-can" : "fa-solid fa-folder-plus",
        circleColor: isDelete ? "#dc2626" : "#16a34a",
        bg: isDelete ? "#fef2f2" : "#f0fdf4",
        color: isDelete ? "#b91c1c" : "#15803d",
        border: isDelete ? "#fecaca" : "#bbf7d0"
      };
    }

    // 5. ติดต่อสอบถาม
    if (type === "contact" || act.includes("ติดต่อ")) {
      return {
        category: "contact",
        title: "ข้อความติดต่อถึงแอดมิน",
        icon: "fa-solid fa-envelope",
        circleColor: "#0284c7",
        bg: "#f0f9ff",
        color: "#0369a1",
        border: "#bae6fd"
      };
    }

    // 6. ระบบ
    if (act.includes("ระบบ") || act.includes("SYSTEM") || act.includes("START")) {
      return {
        category: "system",
        title: "ระบบทำงานปกติ",
        icon: "fa-solid fa-server",
        circleColor: "#64748b",
        bg: "#f8fafc",
        color: "#334155",
        border: "#cbd5e1"
      };
    }

    // ค่าเริ่มต้น
    return {
      category: "other",
      title: log.action || "กิจกรรมในระบบ",
      icon: "fa-solid fa-clock-rotate-left",
      circleColor: "#5b8e66",
      bg: "#f0fdf4",
      color: "#166534",
      border: "#bbf7d0"
    };
  };

  const filterOptions = [
    { key: "all", label: "ทั้งหมด", circleColor: "#5b8e66", count: logs.length },
    { key: "new_user", label: "สมาชิกใหม่", circleColor: "#0284c7", count: logs.filter((l) => getActionMeta(l).category === "new_user").length },
    { key: "announcement", label: "ประกาศข่าวสาร", circleColor: "#eab308", count: logs.filter((l) => getActionMeta(l).category === "announcement").length },
    { key: "settings", label: "ตั้งค่าระบบ", circleColor: "#8b5cf6", count: logs.filter((l) => getActionMeta(l).category === "settings").length },
    { key: "other", label: "อื่นๆ / ระบบ", circleColor: "#64748b", count: logs.filter((l) => ["system", "contact", "other"].includes(getActionMeta(l).category)).length }
  ];
  const currentFilterOption = filterOptions.find((o) => o.key === filterType) || filterOptions[0];

  const filteredLogs = logs.filter((log) => {
    const meta = getActionMeta(log);

    if (filterType !== "all") {
      if (filterType === "other") {
        if (!["system", "contact", "other"].includes(meta.category)) return false;
      } else if (meta.category !== filterType) {
        return false;
      }
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const actionMatch = (log.action || "").toLowerCase().includes(q);
      const titleMatch = (meta.title || "").toLowerCase().includes(q);
      const detailsMatch = (log.details || "").toLowerCase().includes(q);
      const byMatch = (log.performed_by || "").toLowerCase().includes(q);
      return actionMatch || titleMatch || detailsMatch || byMatch;
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
              บันทึกกิจกรรมในระบบ (Activity Logs)
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
                <i className="fa-solid fa-list-check" style={{ fontSize: "11px" }}></i>
                {logs.length} กิจกรรม
              </span>
            )}
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            ติดตามการสมัครสมาชิกของผู้ใช้งานใหม่ และกิจกรรมสำคัญในระบบเพื่อความปลอดภัย
          </p>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          style={{
            height: "38px",
            padding: "0 16px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
            color: "#334155",
            fontSize: "13.5px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            transition: "all 0.15s ease"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
        >
          <i className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`} style={{ color: "#5b8e66" }}></i>
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="content-card" style={{ marginBottom: "20px", padding: "16px 20px", overflow: "visible", position: "relative", zIndex: 50 }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          {/* Search Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 280px", minWidth: 0, width: "100%" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>
              ค้นหากิจกรรม:
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px" }}
              ></i>
              <input
                type="text"
                placeholder="ค้นหากิจกรรม, รายละเอียด หรือผู้ดำเนินการ..."
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

          {/* Category Filter Dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 220px", minWidth: 0, width: "100%", position: "relative" }} ref={filterDropdownRef}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>
              หมวดหมู่กิจกรรม:
            </label>
            <button
              type="button"
              onClick={() => setFilterDropdownOpen((prev) => !prev)}
              style={{
                height: "42px",
                width: "100%",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: filterDropdownOpen ? "#5b8e66" : "#cbd5e1",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#334155",
                cursor: "pointer",
                boxShadow: filterDropdownOpen ? "0 0 0 2px rgba(91, 142, 102, 0.15)" : "none",
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
                    backgroundColor: currentFilterOption.circleColor,
                    flexShrink: 0
                  }}
                ></span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {currentFilterOption.label}
                  <span style={{ color: "#94a3b8", marginLeft: "4px", fontSize: "12px" }}>({currentFilterOption.count})</span>
                </span>
              </div>
              <i
                className="fa-solid fa-chevron-down"
                style={{
                  fontSize: "11px",
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
              กำลังโหลดบันทึกกิจกรรม...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#888" }}>
              <i className="fa-regular fa-clipboard" style={{ fontSize: "48px", color: "#cbd5e1", marginBottom: "16px", display: "block" }}></i>
              <h3 style={{ color: "#475569", fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0" }}>ไม่พบบันทึกกิจกรรม</h3>
              <p style={{ color: "#94a3b8", fontSize: "13.5px", margin: 0 }}>
                {searchTerm || filterType !== "all" ? "ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่ใหม่อีกครั้ง" : "ยังไม่มีประวัติกิจกรรมในระบบ"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Minimalist & Balanced (Strict Column Widths) */}
              <div className="table-responsive desktop-table-view" style={{ overflowX: "auto", minHeight: "260px" }}>
                <table className="custom-table" style={{ width: "100%", tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "42%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "16%" }} />
                  </colgroup>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>
                        ประเภทกิจกรรม
                      </th>
                      <th style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>
                        รายละเอียด
                      </th>
                      <th style={{ padding: "12px 12px", fontSize: "13px", fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>
                        ดำเนินการโดย
                      </th>
                      <th style={{ padding: "12px 14px", fontSize: "13px", fontWeight: 700, color: "#64748b", whiteSpace: "nowrap" }}>
                        เวลาที่เกิดขึ้น
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => {
                      const meta = getActionMeta(log);

                      return (
                        <tr
                          key={log.id}
                          style={{
                            borderBottom: "1px solid #f1f5f9"
                          }}
                        >
                          {/* 1. ประเภทกิจกรรม */}
                          <td style={{ verticalAlign: "middle", padding: "12px 14px", overflow: "hidden" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                              <div
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  backgroundColor: meta.bg,
                                  color: meta.color,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "14px",
                                  flexShrink: 0,
                                  border: `1px solid ${meta.border}`
                                }}
                              >
                                <i className={meta.icon}></i>
                              </div>
                              <div style={{ overflow: "hidden", minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span
                                    style={{
                                      width: "7px",
                                      height: "7px",
                                      borderRadius: "50%",
                                      backgroundColor: meta.circleColor,
                                      flexShrink: 0
                                    }}
                                  ></span>
                                  <strong style={{ color: "#1e293b", fontSize: "13.5px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {meta.title}
                                  </strong>
                                </div>
                                <span
                                  style={{
                                    color: "#94a3b8",
                                    fontSize: "11px",
                                    fontFamily: "monospace",
                                    display: "block",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                  }}
                                  title={log.action}
                                >
                                  {log.action}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 2. รายละเอียด */}
                          <td style={{ verticalAlign: "middle", padding: "12px 16px", overflow: "hidden" }}>
                            <div
                              style={{
                                color: "#334155",
                                fontSize: "13px",
                                lineHeight: "1.6",
                                whiteSpace: "normal",
                                wordBreak: "normal",
                                overflowWrap: "anywhere"
                              }}
                            >
                              {log.details || "-"}
                            </div>
                          </td>

                          {/* 3. ดำเนินการโดย */}
                          <td style={{ verticalAlign: "middle", padding: "12px 12px", overflow: "hidden" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                              <i className="fa-solid fa-user-circle" style={{ color: "#94a3b8", fontSize: "14px", flexShrink: 0 }}></i>
                              <span
                                style={{
                                  color: "#1e293b",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis"
                                }}
                                title={log.performed_by || "ระบบ"}
                              >
                                {log.performed_by || "ระบบ"}
                              </span>
                            </div>
                          </td>

                          {/* 4. เวลาที่เกิดขึ้น */}
                          <td style={{ verticalAlign: "middle", padding: "12px 14px", whiteSpace: "nowrap", overflow: "hidden" }}>
                            <span style={{ color: "#64748b", fontSize: "12.5px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <i className="fa-regular fa-clock" style={{ color: "#94a3b8", fontSize: "12px", flexShrink: 0 }}></i>
                              <span>{formatTime(log.created_at)}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View - Clean & Readable on Mobile Screens */}
              <div className="mobile-cards-view" style={{ padding: "14px" }}>
                {filteredLogs.map((log) => {
                  const meta = getActionMeta(log);

                  return (
                    <div
                      key={log.id}
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "14px",
                        padding: "16px",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        marginBottom: "12px"
                      }}
                    >
                      {/* Top: Icon + Action Title + Timestamp */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: meta.bg,
                              color: meta.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                              flexShrink: 0,
                              border: `1px solid ${meta.border}`
                            }}
                          >
                            <i className={meta.icon}></i>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <h3 style={{ margin: 0, fontSize: "14.5px", fontWeight: 700, color: "#1e293b", wordBreak: "break-word" }}>
                              {meta.title}
                            </h3>
                            <span style={{ color: "#94a3b8", fontSize: "11px", fontFamily: "monospace", display: "block" }}>
                              {log.action}
                            </span>
                          </div>
                        </div>

                        {/* Category Indicator Dot */}
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: meta.circleColor,
                            flexShrink: 0,
                            marginTop: "6px"
                          }}
                        ></span>
                      </div>

                      {/* Middle: Details Box */}
                      {log.details && (
                        <div
                          style={{
                            backgroundColor: "#f8fafc",
                            border: "1px solid #f1f5f9",
                            borderRadius: "8px",
                            padding: "10px 12px",
                            fontSize: "13px",
                            color: "#334155",
                            lineHeight: "1.5",
                            wordBreak: "break-word"
                          }}
                        >
                          {log.details}
                        </div>
                      )}

                      {/* Bottom: Performer & Time */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", paddingTop: "4px", borderTop: "1px solid #f8fafc" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}>
                          <i className="fa-solid fa-user-circle" style={{ color: "#94a3b8" }}></i>
                          <span>{log.performed_by || "ระบบ"}</span>
                        </div>

                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#94a3b8" }}>
                          <i className="fa-regular fa-clock" style={{ fontSize: "11px" }}></i>
                          <span>{formatTime(log.created_at)}</span>
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
