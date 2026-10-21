import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserFavorites, removeFavorite } from "../../services/favoriteService";
import { showConfirm, showAlert } from "../../context/ModalContext";

export default function UserFavorites() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const districtDropdownRef = useRef(null);

  const loadFavorites = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userId = currentUser.id || currentUser.uid;
      const favDorms = await getUserFavorites(userId);
      setFavorites(favDorms);
    } catch (err) {
      console.error("Error loading favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [currentUser]);

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

  const handleRemove = async (dormId) => {
    const isConfirmed = await showConfirm({
      title: "นำออกจากรายการที่บันทึก",
      heading: "ต้องการนำหอพักนี้ออกจากรายการที่บันทึกไว้ใช่หรือไม่?",
      message: "คุณสามารถกลับมาค้นหาและบันทึกหอพักนี้ใหม่ได้ตลอดเวลา",
      confirmText: "นำออก",
      cancelText: "ยกเลิก",
      type: "danger"
    });
    if (!isConfirmed) return;

    try {
      const userId = currentUser.id || currentUser.uid;
      await removeFavorite(userId, dormId);
      setFavorites((prev) => prev.filter((d) => d.id !== dormId && d.dormitoryId !== dormId));
      await showAlert({
        title: "สำเร็จ",
        heading: "นำออกจากรายการบันทึกแล้ว",
        type: "success"
      });
    } catch (err) {
      console.error("Remove favorite error:", err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถลบรายการได้",
        message: err.message || "",
        type: "danger"
      });
    }
  };

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

  // Extract distinct districts for filter
  const districts = Array.from(
    new Set(
      favorites
        .map((d) => d.district?.trim())
        .filter(Boolean)
    )
  );

  const filteredFavorites = favorites.filter((dorm) => {
    if (selectedDistrict === "all") return true;
    return dorm.district?.trim() === selectedDistrict;
  });

  return (
    <div className="bookings-page-container">
      {/* Header Bar */}
      <div className="booking-header-bar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "22px", color: "#1e293b", fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>
              หอพักที่บันทึกไว้
            </h1>
            {!loading && favorites.length > 0 && (
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
                {favorites.length} รายการ
              </span>
            )}
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
            รายการหอพักที่คุณถูกใจและบันทึกไว้ดูย้อนหลัง
          </p>
        </div>
      </div>

      {/* District Filter Dropdown */}
      {!loading && favorites.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
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
                borderColor: districtDropdownOpen ? "#5b8e66" : "#cbd5e1",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                color: "#1e293b",
                boxShadow: districtDropdownOpen ? "0 0 0 3px rgba(91, 142, 102, 0.15)" : "none",
                transition: "all 0.15s ease",
                gap: "10px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, overflow: "hidden" }}>
                <i className="fa-solid fa-location-dot" style={{ color: "#5b8e66", flexShrink: 0, fontSize: "12px" }}></i>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {selectedDistrict === "all"
                    ? `ทั้งหมด (${favorites.length})`
                    : `อำเภอ${selectedDistrict} (${favorites.filter((d) => d.district?.trim() === selectedDistrict).length})`}
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
                    <i className="fa-solid fa-location-dot" style={{ color: "#5b8e66", fontSize: "12px", flexShrink: 0 }}></i>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      ทั้งหมด ({favorites.length})
                    </span>
                  </div>
                  {selectedDistrict === "all" && (
                    <i className="fa-solid fa-check" style={{ color: "#166534", fontSize: "12px", flexShrink: 0 }}></i>
                  )}
                </div>

                {districts.map((dist) => {
                  const count = favorites.filter((d) => d.district?.trim() === dist).length;
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
                        <i className="fa-solid fa-location-dot" style={{ color: "#5b8e66", fontSize: "12px", flexShrink: 0 }}></i>
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          อำเภอ{dist} ({count})
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
          กำลังโหลดข้อมูลหอพักที่บันทึกไว้...
        </div>
      ) : favorites.length === 0 ? (
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
              background: "#fef2f2",
              color: "#ef4444",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              marginBottom: "16px"
            }}
          >
            <i className="fa-regular fa-heart"></i>
          </div>
          <h3 style={{ color: "#1e293b", margin: "0 0 6px 0", fontSize: "18px", fontWeight: 700 }}>
            ยังไม่มีหอพักที่บันทึกไว้
          </h3>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: 0, marginBottom: "20px" }}>
            กดรูปหัวใจที่หอพักที่คุณสนใจ เพื่อบันทึกเก็บไว้ดูย้อนหลังได้เลยครับ
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
      ) : filteredFavorites.length === 0 ? (
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
            ลองเลือกตัวกรองอื่น หรือดูรายการทั้งหมด
          </p>
          <button
            type="button"
            onClick={() => setSelectedDistrict("all")}
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
        /* CARD VIEW - Matching UserBookings & ViewHistoryPage aesthetic */
        <div className="booking-cards-grid">
          {filteredFavorites.map((dorm) => {
            const targetId = dorm.id || dorm.dormitoryId;
            const heroImg = Array.isArray(dorm.images) && dorm.images.length > 0
              ? dorm.images[0]
              : "/images/dorm-hero.jpg";

            const priceText = dorm.priceMin && dorm.priceMax && dorm.priceMin !== dorm.priceMax
              ? `฿${Number(dorm.priceMin).toLocaleString()} - ${Number(dorm.priceMax).toLocaleString()}`
              : `฿${Number(dorm.priceMin || 0).toLocaleString()}`;

            return (
              <div key={targetId} className="booking-clean-card">
                {/* Card Header: Dorm avatar + Dorm Name + Price pill */}
                <div className="booking-card-header">
                  <div className="booking-card-dorm-info">
                    <div
                      className="booking-dorm-avatar"
                      style={{ overflow: "hidden", padding: 0 }}
                    >
                      <img
                        src={heroImg}
                        alt={dorm.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "/images/dorm-hero.jpg"; }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <Link
                        to={`/dorms/${targetId}`}
                        className="booking-dorm-name"
                        title={dorm.name}
                      >
                        {dorm.name}
                      </Link>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        อำเภอ{dorm.district || "เมืองเลย"}
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
                      <strong>{dorm.address || (dorm.district ? `อำเภอ${dorm.district}` : "เมืองเลย")}</strong>
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

                  {dorm.favoritedAt && (
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
                      <span>บันทึกเมื่อ {formatDateTime(dorm.favoritedAt)}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: View Dorm + Remove button */}
                <div className="booking-card-footer">
                  <Link
                    to={`/dorms/${targetId}`}
                    className="booking-view-dorm-link"
                  >
                    <i className="fa-solid fa-eye"></i>
                    <span>ดูข้อมูลหอพัก</span>
                  </Link>

                  <button
                    type="button"
                    className="booking-cancel-action-btn"
                    onClick={() => handleRemove(targetId)}
                    title="นำออกจากรายการที่บันทึก"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    <span>นำออก</span>
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
