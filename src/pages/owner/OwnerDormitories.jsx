import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDormitoriesByOwner, deleteDormitory } from "../../services/dormitoryService";
import { showConfirm, showAlert } from "../../context/ModalContext";

export default function OwnerDormitories() {
  const { currentUser } = useAuth();
  const [dorms, setDorms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadDorms = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const ownerId = currentUser.id || currentUser.uid;
      const data = await getDormitoriesByOwner(ownerId);
      setDorms(data || []);
    } catch (err) {
      console.error("Error loading owner dorms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDorms();
  }, [currentUser]);

  const handleDelete = async (dormId, dormName) => {
    const isConfirmed = await showConfirm({
      title: "ลบหอพัก",
      heading: `ต้องการลบหอพัก "${dormName || 'นี้'}" ใช่ไหมครับ?`,
      message: "หากลบแล้ว ข้อมูลหอพัก รูปภาพ และห้องพักทั้งหมดจะไม่สามารถกู้คืนได้",
      confirmText: "ลบหอพัก",
      cancelText: "ยกเลิก",
      type: "danger"
    });

    if (isConfirmed) {
      try {
        await deleteDormitory(dormId);
        setDorms((prev) => prev.filter((d) => d.id !== dormId));
        await showAlert({
          title: "ลบหอพักสำเร็จ",
          heading: "ลบหอพักเรียบร้อยแล้ว!",
          message: "ข้อมูลหอพักถูกลบออกจากระบบแล้ว",
          type: "success"
        });
      } catch (err) {
        console.error("Delete dorm error:", err);
        await showAlert({
          title: "เกิดข้อผิดพลาด",
          heading: "ไม่สามารถลบหอพักได้",
          message: err.message || "",
          type: "danger"
        });
      }
    }
  };

  // Stats calculation
  const totalDorms = dorms.length;
  const approvedDorms = dorms.filter((d) => d.status === "approved").length;
  const pendingDorms = dorms.filter((d) => d.status === "pending" || !d.status).length;
  const actionDorms = dorms.filter((d) => d.status === "rejected" || d.status === "action_needed").length;
  const totalViews = dorms.reduce((acc, d) => acc + (Number(d.viewCount) || 0), 0);

  // Filtered dorms
  const filteredDorms = dorms.filter((dorm) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "approved"
        ? dorm.status === "approved"
        : statusFilter === "pending"
        ? dorm.status === "pending" || !dorm.status
        : dorm.status === "rejected" || dorm.status === "action_needed";

    const name = (dorm.name || "").toLowerCase();
    const district = (dorm.district || "").toLowerCase();
    const address = (dorm.address || "").toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      !query || name.includes(query) || district.includes(query) || address.includes(query);

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    if (status === "approved") {
      return {
        label: "อนุมัติแล้ว",
        icon: "fa-circle-check",
        bg: "#f0fdf4",
        color: "#166534",
        border: "#bbf7d0"
      };
    }
    if (status === "action_needed" || status === "rejected") {
      return {
        label: status === "action_needed" ? "ต้องแก้ไขพิกัด" : "ไม่อนุมัติ",
        icon: "fa-triangle-exclamation",
        bg: "#fef2f2",
        color: "#991b1b",
        border: "#fecaca"
      };
    }
    return {
      label: "รอตรวจสอบ",
      icon: "fa-clock",
      bg: "#fffbe6",
      color: "#b45309",
      border: "#fef08a"
    };
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px"
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
            <i className="fa-solid fa-building-user" style={{ color: "#7da27c" }}></i>
            หอพักของฉัน (My Dormitories)
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px", margin: "4px 0 0 0" }}>
            จัดการข้อมูล ประกาศ และตรวจสอบสถานะหอพักทั้งหมดของคุณ
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

      {/* Summary Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          marginBottom: "24px"
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "18px 20px",
            border: "1px solid #eef2ed",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
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
            <i className="fa-solid fa-building"></i>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>หอพักทั้งหมด</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#1e293b", marginTop: "2px" }}>
              {totalDorms} <span style={{ fontSize: "13px", fontWeight: 400, color: "#94a3b8" }}>แห่ง</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "18px 20px",
            border: "1px solid #eef2ed",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
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
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>อนุมัติแล้ว</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#2563eb", marginTop: "2px" }}>
              {approvedDorms} <span style={{ fontSize: "13px", fontWeight: 400, color: "#94a3b8" }}>แห่ง</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "18px 20px",
            border: "1px solid #eef2ed",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
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
            <i className="fa-solid fa-clock"></i>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>รอการตรวจสอบ</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#d97706", marginTop: "2px" }}>
              {pendingDorms} <span style={{ fontSize: "13px", fontWeight: 400, color: "#94a3b8" }}>แห่ง</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "18px 20px",
            border: "1px solid #eef2ed",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
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
            <i className="fa-solid fa-eye"></i>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>ยอดเข้าชมรวม</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#9333ea", marginTop: "2px" }}>
              {totalViews.toLocaleString()}{" "}
              <span style={{ fontSize: "13px", fontWeight: 400, color: "#94a3b8" }}>ครั้ง</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px"
        }}
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { key: "all", label: "ทั้งหมด", count: totalDorms },
            { key: "approved", label: "อนุมัติแล้ว", count: approvedDorms },
            { key: "pending", label: "รอตรวจสอบ", count: pendingDorms },
            { key: "action", label: "ต้องแก้ไข/ไม่อนุมัติ", count: actionDorms }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: "7px 16px",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: statusFilter === tab.key ? "#7da27c" : "#d8dfd7",
                background: statusFilter === tab.key ? "#7da27c" : "#ffffff",
                color: statusFilter === tab.key ? "#ffffff" : "#475569",
                fontWeight: statusFilter === tab.key ? 700 : 500,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#ffffff",
            border: "1px solid #d8dfd7",
            borderRadius: "20px",
            padding: "6px 14px",
            gap: "8px",
            flex: 1,
            maxWidth: "320px",
            minWidth: "200px"
          }}
        >
          <i className="fa-solid fa-magnifying-glass" style={{ color: "#94a3b8", fontSize: "13px" }}></i>
          <input
            type="text"
            placeholder="ค้นหาชื่อหอพัก, อำเภอ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: "13px",
              fontFamily: "inherit"
            }}
          />
          {searchTerm && (
            <i
              className="fa-solid fa-xmark"
              onClick={() => setSearchTerm("")}
              style={{ color: "#94a3b8", cursor: "pointer", fontSize: "13px" }}
            ></i>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="content-card">
        <div className="content-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#7da27c" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "10px", fontSize: "20px" }}></i>
              <span>กำลังโหลดข้อมูลหอพัก...</span>
            </div>
          ) : filteredDorms.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <i className="fa-solid fa-building" style={{ fontSize: "48px", color: "#cbd5e1", marginBottom: "16px" }}></i>
              <h3 style={{ color: "#334155", fontWeight: 700, fontSize: "18px" }}>
                {dorms.length === 0 ? "คุณยังไม่มีหอพักที่ลงประกาศ" : "ไม่พบหอพักที่ตรงกับเงื่อนไข"}
              </h3>
              <p style={{ color: "#64748b", marginTop: "8px", marginBottom: "20px", fontSize: "14px" }}>
                {dorms.length === 0
                  ? "เริ่มต้นลงประกาศหอพัก เพื่อให้ผู้เช่าในจังหวัดเลย ค้นหาและติดต่อจองห้องได้ทันที"
                  : "ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองสถานะใหม่อีกครั้ง"}
              </p>
              {dorms.length === 0 && (
                <Link
                  to="/owner/dormitories/create"
                  className="btn-primary-action"
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <i className="fa-solid fa-plus"></i> ลงประกาศหอพักแรก
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="desktop-table-view table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: "90px" }}>รูปปก</th>
                      <th>ชื่อหอพัก / ทำเล</th>
                      <th>ช่วงราคา</th>
                      <th>สถานะประกาศ</th>
                      <th style={{ textAlign: "center" }}>เข้าชม</th>
                      <th style={{ textAlign: "center" }}>จัดการห้อง</th>
                      <th style={{ textAlign: "center" }}>การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDorms.map((dorm) => {
                      const badge = getStatusBadge(dorm.status);
                      const coverImg = (dorm.images && dorm.images[0]) || "/images/dorm-1.jpg";

                      return (
                        <tr key={dorm.id}>
                          <td>
                            <img
                              src={coverImg}
                              alt={dorm.name}
                              style={{
                                width: "70px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0"
                              }}
                              onError={(e) => {
                                e.target.src = "/images/banner.jpg";
                              }}
                            />
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "15px" }}>
                              {dorm.name}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#64748b",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                marginTop: "3px"
                              }}
                            >
                              <i className="fa-solid fa-location-dot" style={{ color: "#ef4444" }}></i>
                              <span>{dorm.district || "อำเภอเมืองเลย"}</span>
                              {dorm.address && (
                                <span style={{ color: "#94a3b8" }}>• {dorm.address}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: "#166534" }}>
                              ฿{Number(dorm.priceMin || 0).toLocaleString()} - ฿
                              {Number(dorm.priceMax || 0).toLocaleString()}
                            </div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>บาท / เดือน</div>
                          </td>
                          <td>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "12px",
                                fontWeight: 600,
                                padding: "3px 10px",
                                borderRadius: "12px",
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`
                              }}
                            >
                              <i className={`fa-solid ${badge.icon}`}></i> {badge.label}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#475569",
                                background: "#f8fafc",
                                padding: "4px 10px",
                                borderRadius: "10px",
                                border: "1px solid #e2e8f0"
                              }}
                            >
                              <i className="fa-solid fa-eye me-1"></i> {Number(dorm.viewCount || 0).toLocaleString()}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <Link
                              to={`/owner/rooms?dormId=${dorm.id}`}
                              style={{
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                background: "#f0fdf4",
                                color: "#166534",
                                border: "1px solid #bbf7d0",
                                fontSize: "13px",
                                fontWeight: 600,
                                transition: "all 0.15s ease"
                              }}
                              title="จัดการห้องพักในหอพักนี้"
                            >
                              <i className="fa-solid fa-door-open"></i> จัดการห้อง
                            </Link>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                              <Link
                                to={`/owner/dormitories/${dorm.id}/edit`}
                                className="btn-icon"
                                title="แก้ไขข้อมูลหอพัก"
                                style={{
                                  background: "#f1f5f9",
                                  color: "#334155",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "6px",
                                  padding: "6px 10px",
                                  textDecoration: "none"
                                }}
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </Link>
                              <Link
                                to={`/dorms/${dorm.id}`}
                                className="btn-icon"
                                title="ดูหน้าประกาศสาธารณะ"
                                style={{
                                  background: "#eff6ff",
                                  color: "#2563eb",
                                  border: "1px solid #bfdbfe",
                                  borderRadius: "6px",
                                  padding: "6px 10px",
                                  textDecoration: "none"
                                }}
                              >
                                <i className="fa-solid fa-eye"></i>
                              </Link>
                              <button
                                type="button"
                                className="btn-icon delete"
                                onClick={() => handleDelete(dorm.id, dorm.name)}
                                title="ลบหอพักนี้"
                                style={{
                                  background: "#fef2f2",
                                  color: "#dc2626",
                                  border: "1px solid #fecaca",
                                  borderRadius: "6px",
                                  padding: "6px 10px",
                                  cursor: "pointer"
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
              <div className="mobile-cards-view" style={{ padding: "12px" }}>
                {filteredDorms.map((dorm) => {
                  const badge = getStatusBadge(dorm.status);
                  const coverImg = (dorm.images && dorm.images[0]) || "/images/dorm-1.jpg";

                  return (
                    <div
                      key={dorm.id}
                      className="mobile-item-card"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #eef2ed",
                        borderRadius: "14px",
                        padding: "14px",
                        marginBottom: "12px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
                      }}
                    >
                      {/* Top Bar: Image & Info */}
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <img
                          src={coverImg}
                          alt={dorm.name}
                          style={{
                            width: "72px",
                            height: "72px",
                            borderRadius: "10px",
                            objectFit: "cover",
                            border: "1px solid #e2e8f0",
                            flexShrink: 0
                          }}
                          onError={(e) => {
                            e.target.src = "/images/banner.jpg";
                          }}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "15px",
                              fontWeight: 800,
                              color: "#1e293b",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                          >
                            {dorm.name}
                          </div>

                          <div
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginTop: "2px"
                            }}
                          >
                            <i className="fa-solid fa-location-dot" style={{ color: "#ef4444" }}></i>
                            <span>{dorm.district || "อำเภอเมืองเลย"}</span>
                          </div>

                          <div style={{ marginTop: "6px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "2px 8px",
                                borderRadius: "10px",
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`
                              }}
                            >
                              <i className={`fa-solid ${badge.icon}`}></i> {badge.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price & Stats Row */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          marginTop: "12px",
                          fontSize: "13px"
                        }}
                      >
                        <div>
                          <span style={{ color: "#64748b" }}>ช่วงราคา: </span>
                          <strong style={{ color: "#166534" }}>
                            ฿{Number(dorm.priceMin || 0).toLocaleString()} - ฿
                            {Number(dorm.priceMax || 0).toLocaleString()}
                          </strong>
                        </div>
                        <div style={{ color: "#64748b", fontSize: "12px" }}>
                          <i className="fa-solid fa-eye me-1"></i> {Number(dorm.viewCount || 0).toLocaleString()} ครั้ง
                        </div>
                      </div>

                      {/* 2-Column Action Buttons Grid */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "8px",
                          marginTop: "12px"
                        }}
                      >
                        <Link
                          to={`/owner/rooms?dormId=${dorm.id}`}
                          style={{
                            textDecoration: "none",
                            background: "#f0fdf4",
                            color: "#166534",
                            border: "1px solid #bbf7d0",
                            borderRadius: "8px",
                            padding: "8px",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            whiteSpace: "nowrap"
                          }}
                        >
                          <i className="fa-solid fa-door-open"></i> จัดการห้อง
                        </Link>

                        <Link
                          to={`/owner/dormitories/${dorm.id}/edit`}
                          style={{
                            textDecoration: "none",
                            background: "#f1f5f9",
                            color: "#334155",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            padding: "8px",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            whiteSpace: "nowrap"
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> แก้ไขหอพัก
                        </Link>

                        <Link
                          to={`/dorms/${dorm.id}`}
                          style={{
                            textDecoration: "none",
                            background: "#eff6ff",
                            color: "#2563eb",
                            border: "1px solid #bfdbfe",
                            borderRadius: "8px",
                            padding: "8px",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            whiteSpace: "nowrap"
                          }}
                        >
                          <i className="fa-solid fa-eye"></i> ดูหน้าเว็บ
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(dorm.id, dorm.name)}
                          style={{
                            background: "#fef2f2",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                            borderRadius: "8px",
                            padding: "8px",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            cursor: "pointer",
                            whiteSpace: "nowrap"
                          }}
                        >
                          <i className="fa-solid fa-trash-can"></i> ลบหอพัก
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
