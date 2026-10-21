import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getViewHistory, removeViewHistory, clearAllViewHistory } from "../../services/historyService";
import { showConfirm, showAlert } from "../../context/ModalContext";
import "../../styles/dashboard.css";

export default function ViewHistoryPage() {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const districtDropdownRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(e.target)) {
        setDistrictDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  async function fetchHistory() {
    setLoading(true);
    try {
      const items = await getViewHistory();
      setHistoryItems(items);
    } catch (err) {
      console.error("Failed to load view history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveItem(dormitoryId) {
    const isConfirmed = await showConfirm({
      title: "ลบประวัติการดู",
      heading: "ต้องการลบหอพักนี้ออกจากประวัติใช่หรือไม่?",
      confirmText: "ลบ",
      cancelText: "ยกเลิก",
      type: "danger"
    });
    if (!isConfirmed) return;

    try {
      await removeViewHistory(dormitoryId);
      setHistoryItems((prev) => prev.filter((item) => item.dormitory?.id !== dormitoryId));
      await showAlert({
        title: "สำเร็จ",
        heading: "ลบรายการออกจากประวัติแล้ว",
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

  async function handleClearAll() {
    const isConfirmed = await showConfirm({
      title: "ล้างประวัติการเข้าชม",
      heading: "ต้องการล้างประวัติการเข้าชมทั้งหมดหรือไม่?",
      message: "ประวัติการดูหอพักทั้งหมดของคุณจะถูกลบออกจากระบบ",
      confirmText: "ล้างประวัติ",
      cancelText: "ยกเลิก",
      type: "danger"
    });
    if (!isConfirmed) return;

    setClearing(true);
    try {
      await clearAllViewHistory();
      setHistoryItems([]);
      await showAlert({
        title: "ล้างประวัติสำเร็จ",
        heading: "ล้างประวัติทั้งหมดเรียบร้อยแล้ว!",
        type: "success"
      });
    } catch (err) {
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถล้างประวัติได้",
        message: err.message || "",
        type: "danger"
      });
    } finally {
      setClearing(false);
    }
  }

  function formatDateTime(isoString) {
    if (!isoString) return "ไม่ระบุ";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "ไม่ระบุ";
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  // Extract distinct districts for filter chips
  const districts = Array.from(
    new Set(
      historyItems
        .map((item) => item.dormitory?.district?.trim())
        .filter(Boolean)
    )
  );

  const filteredItems = historyItems.filter((item) => {
    if (!item.dormitory) return false;
    if (selectedDistrict !== "all" && item.dormitory?.district?.trim() !== selectedDistrict) {
      return false;
    }
    return true;
  });

  return (
    <div className="bookings-page-container">
      {/* Header Bar */}
      <div className="booking-header-bar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "22px", color: "#1e293b", fontWeight: 800, margin: 0, letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ color: "#7da27c", fontSize: "20px" }}></i>
              <span>ประวัติการดูหอพัก</span>
            </h1>
            {!loading && historyItems.length > 0 && (
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
                {historyItems.length} รายการ
              </span>
            )}
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
            รายการหอพักที่คุณเคยเปิดเข้าชมย้อนหลัง
          </p>
        </div>

      </div>

      {/* District Filter Dropdown */}
      {!loading && historyItems.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          {/* District Dropdown Selector */}
          <div ref={districtDropdownRef} style={{ position: "relative", width: "240px", maxWidth: "100%" }}>
            <button
              type="button"
              onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
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
                borderColor: districtDropdownOpen ? "#7da27c" : "#cbd5e1",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                color: "#1e293b",
                boxShadow: districtDropdownOpen ? "0 0 0 3px rgba(125, 162, 124, 0.15)" : "none",
                transition: "all 0.15s ease",
                gap: "10px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, overflow: "hidden" }}>
                <i className="fa-solid fa-location-dot" style={{ color: "#7da27c", flexShrink: 0 }}></i>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {selectedDistrict === "all"
                    ? `ทั้งหมด (${historyItems.length})`
                    : `อำเภอ${selectedDistrict} (${historyItems.filter((i) => i.dormitory?.district?.trim() === selectedDistrict).length})`}
                </span>
              </div>
              <i
                className="fa-solid fa-chevron-down"
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  flexShrink: 0,
                  transform: districtDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease"
                }}
              ></i>
            </button>

            {districtDropdownOpen && (
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
                <div
                  onClick={() => {
                    setSelectedDistrict("all");
                    setDistrictDropdownOpen(false);
                  }}
                  style={{
                    padding: "9px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    background: selectedDistrict === "all" ? "#f0fdf4" : "transparent",
                    color: selectedDistrict === "all" ? "#166534" : "#1e293b",
                    fontSize: "13px",
                    fontWeight: selectedDistrict === "all" ? 700 : 500,
                    transition: "background 0.15s ease"
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDistrict !== "all") e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDistrict !== "all") e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, overflow: "hidden" }}>
                    <i className="fa-solid fa-layer-group" style={{ color: "#7da27c", fontSize: "12px", flexShrink: 0 }}></i>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>ทั้งหมด ({historyItems.length})</span>
                  </div>
                  {selectedDistrict === "all" && <i className="fa-solid fa-check" style={{ color: "#166534", fontSize: "12px", flexShrink: 0 }}></i>}
                </div>

                {districts.map((dist) => {
                  const count = historyItems.filter((i) => i.dormitory?.district?.trim() === dist).length;
                  const isSelected = selectedDistrict === dist;
                  return (
                    <div
                      key={dist}
                      onClick={() => {
                        setSelectedDistrict(dist);
                        setDistrictDropdownOpen(false);
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
                        <i className="fa-solid fa-location-dot" style={{ color: "#7da27c", fontSize: "12px", flexShrink: 0 }}></i>
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>อำเภอ{dist} ({count})</span>
                      </div>
                      {isSelected && <i className="fa-solid fa-check" style={{ color: "#166534", fontSize: "12px", flexShrink: 0 }}></i>}
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
          กำลังโหลดประวัติการดูหอพัก...
        </div>
      ) : historyItems.length === 0 ? (
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
              fontSize: "30px",
              marginBottom: "16px"
            }}
          >
            <i className="fa-solid fa-clock-rotate-left"></i>
          </div>
          <h3 style={{ color: "#1e293b", margin: "0 0 6px 0", fontSize: "18px", fontWeight: 700 }}>
            ยังไม่มีประวัติการดูหอพัก
          </h3>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: 0, marginBottom: "20px" }}>
            เมื่อคุณเปิดดูรายละเอียดหอพัก รายการจะถูกบันทึกไว้ที่นี่โดยอัตโนมัติ
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
      ) : filteredItems.length === 0 ? (
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
            ไม่พบรายการที่ตรงกับ "{searchTerm}"
          </h4>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 16px 0" }}>
            ลองเลือกตัวกรองอื่น หรือเคลียร์คำค้นหา
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedDistrict("all");
            }}
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
        /* CARD VIEW - Matching UserFavorites & UserBookings standard */
        <div className="booking-cards-grid">
          {filteredItems.map(({ historyId, viewedAt, dormitory }) => {
            if (!dormitory) return null;
            const targetId = dormitory.id;
            const heroImg = Array.isArray(dormitory.images) && dormitory.images.length > 0
              ? dormitory.images[0]
              : "/images/dorm-hero.jpg";

            const priceText = dormitory.priceMin && dormitory.priceMax && dormitory.priceMin !== dormitory.priceMax
              ? `฿${Number(dormitory.priceMin).toLocaleString()} - ${Number(dormitory.priceMax).toLocaleString()}`
              : `฿${Number(dormitory.priceMin || dormitory.price || 0).toLocaleString()}`;

            return (
              <div key={historyId || targetId} className="booking-clean-card">
                {/* Card Header: Dorm Image + Dorm Name + Price Badge */}
                <div className="booking-card-header">
                  <div className="booking-card-dorm-info">
                    <div
                      className="booking-dorm-avatar"
                      style={{ overflow: "hidden", padding: 0 }}
                    >
                      <img
                        src={heroImg}
                        alt={dormitory.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "/images/dorm-hero.jpg"; }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <Link
                        to={`/dorms/${targetId}`}
                        className="booking-dorm-name"
                        title={dormitory.name}
                      >
                        {dormitory.name}
                      </Link>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        อำเภอ{dormitory.district || "เมืองเลย"}
                      </span>
                    </div>
                  </div>

                  <span
                    className="booking-status-pill approved"
                    style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #dcfce7" }}
                  >
                    <i className="fa-solid fa-tag"></i>
                    <span>{priceText}</span>
                  </span>
                </div>

                {/* Card Body: Details */}
                <div className="booking-card-body">
                  <div className="booking-detail-row">
                    <i className="fa-solid fa-location-dot"></i>
                    <div>
                      <span>ทำเลที่ตั้ง: </span>
                      <strong>{dormitory.address || (dormitory.district ? `อำเภอ${dormitory.district}` : "เมืองเลย")}</strong>
                    </div>
                  </div>

                  <div className="booking-detail-row">
                    <i className="fa-solid fa-baht-sign"></i>
                    <div>
                      <span>ราคาค่าเช่า: </span>
                      <strong style={{ color: "#15803d" }}>{priceText}</strong>
                      <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "4px" }}>/เดือน</span>
                    </div>
                  </div>

                  {viewedAt && (
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "11.5px",
                        marginTop: "2px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                    >
                      <i className="fa-regular fa-clock" style={{ fontSize: "11px" }}></i>
                      <span>เข้าชมล่าสุดเมื่อ {formatDateTime(viewedAt)}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: View Dorm + Remove button */}
                <div className="booking-card-footer">
                  <Link
                    to={`/dorms/${targetId}`}
                    className="booking-view-dorm-link"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    <span>ดูรายละเอียดหอพัก</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(dormitory.id)}
                    className="booking-action-btn-danger"
                    style={{
                      background: "#fef2f2",
                      color: "#ef4444",
                      border: "1px solid #fee2e2",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      fontWeight: 600,
                      transition: "all 0.15s ease"
                    }}
                    title="ลบออกจากประวัติ"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    <span>ลบ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
