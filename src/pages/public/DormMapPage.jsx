import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicMobileHeader from "../../components/common/PublicMobileHeader";
import SearchableSelect from "../../components/common/SearchableSelect";
import DormMap from "../../components/map/DormMap";
import { getApprovedDormitories } from "../../services/dormitoryService";
import { getLocations } from "../../services/locationService";

export default function DormMapPage() {
  const navigate = useNavigate();
  const [dorms, setDorms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDormId, setSelectedDormId] = useState(null);
  const [locationOptions, setLocationOptions] = useState(["เมืองเลย", "เชียงคาน", "ภูเรือ", "นาอาน", "กุดป่อง"]);
  const [mobileView, setMobileView] = useState("map"); // "map" | "list"

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [dormsData, locsData] = await Promise.all([
          getApprovedDormitories({ all: "true" }),
          getLocations()
        ]);

        setDorms(dormsData || []);

        if (locsData && locsData.length > 0) {
          const names = Array.from(new Set(locsData.map((l) => l.name))).filter(Boolean);
          setLocationOptions(names);
        }
      } catch (err) {
        console.error("Failed to load dorms for map:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const districtOptions = ["ทั้งหมดใน จ.เลย", ...locationOptions.filter((l) => l !== "ทั้งหมด" && l !== "ทั้งหมดใน จ.เลย")];

  // Filter dorms by search and district
  const filteredDorms = dorms.filter((dorm) => {
    const matchSearch = !searchQuery.trim() ||
      dorm.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dorm.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dorm.district?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDistrict = !selectedDistrict || selectedDistrict === "ทั้งหมด" || selectedDistrict === "ทั้งหมดใน จ.เลย" ||
      dorm.district === selectedDistrict ||
      dorm.address?.includes(selectedDistrict);

    return matchSearch && matchDistrict;
  });

  const dormsWithCoords = filteredDorms.filter((d) => {
    const lat = Number(d.latitude);
    const lng = Number(d.longitude);
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  });

  return (
    <div className="dorm-map-wrapper" style={{ background: "#f8faf8", minHeight: "calc(100vh - 65px)", padding: "16px 20px 40px", fontFamily: '"Noto Sans Thai", sans-serif' }}>
      <PublicMobileHeader
        title="แผนที่หอพัก"
      />
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        
        {/* Breadcrumb & Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <div className="dorm-map-desktop-breadcrumb" style={{ fontSize: "13px", color: "#718096", marginBottom: "4px", display: "flex", gap: "6px" }}>
              <Link to="/" style={{ color: "#718096", textDecoration: "none" }}>หน้าแรก</Link>
              <span>/</span>
              <span style={{ color: "#2d3748", fontWeight: 600 }}>แผนที่หอพัก</span>
            </div>
            <h1 className="dorm-map-page-title" style={{ fontSize: "22px", fontWeight: 700, color: "#1a202c", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="fa-solid fa-map-location-dot" style={{ color: "#5b8e66" }}></i>
              แผนที่หอพักในจังหวัดเลย
            </h1>
          </div>

          {/* Mobile Tab Toggle */}
          <div className="dorm-map-mobile-toggle" style={{ display: "none" }}>
            <div style={{ display: "flex", background: "#e2e8f0", padding: "3px", borderRadius: "8px" }}>
              <button
                type="button"
                onClick={() => setMobileView("map")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: mobileView === "map" ? "#ffffff" : "transparent",
                  color: mobileView === "map" ? "#5b8e66" : "#4a5568",
                  boxShadow: mobileView === "map" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                <i className="fa-solid fa-map" style={{ marginRight: "4px" }}></i> แผนที่
              </button>
              <button
                type="button"
                onClick={() => setMobileView("list")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: mobileView === "list" ? "#ffffff" : "transparent",
                  color: mobileView === "list" ? "#5b8e66" : "#4a5568",
                  boxShadow: mobileView === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                <i className="fa-solid fa-list" style={{ marginRight: "4px" }}></i> รายการ ({filteredDorms.length})
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e8eee8", marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", position: "relative", zIndex: 1100 }}>
          {/* Search Input */}
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#a0aec0", fontSize: "14px" }}></i>
            <input
              type="text"
              placeholder="ค้นหาชื่อหอพัก หรือที่อยู่..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "40px",
                padding: "0 12px 0 36px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13.5px",
                color: "#2d3748",
                outline: "none"
              }}
            />
          </div>

          {/* District selector */}
          <div style={{ flex: "0 0 240px", position: "relative" }} className="dorm-map-district-select">
            <SearchableSelect
              value={selectedDistrict === "ทั้งหมด" || selectedDistrict === "ทั้งหมดใน จ.เลย" ? "" : selectedDistrict}
              onChange={(val) => {
                if (!val || val === "ทั้งหมดใน จ.เลย" || val === "ทั้งหมด") {
                  setSelectedDistrict("");
                } else {
                  setSelectedDistrict(val);
                }
              }}
              options={districtOptions}
              placeholder="พื้นที่: ทั้งหมดใน จ.เลย"
              icon="fa-chevron-down"
              style={{ height: "40px", fontSize: "13.5px" }}
            />
          </div>

          {/* Quick Counter */}
          <div style={{ fontSize: "13px", color: "#718096", marginLeft: "auto" }}>
            พบ <strong>{filteredDorms.length}</strong> แห่ง (แสดงบนแผนที่ <strong>{dormsWithCoords.length}</strong> แห่ง)
          </div>
        </div>

        {/* Main Content Layout: Left Sidebar List + Right Map */}
        <div className="dorm-map-layout" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "16px", alignItems: "start" }}>
          
          {/* Left Column: Dormitories Card List */}
          <div
            className={`dorm-map-sidebar ${mobileView === "map" ? "mobile-hide" : ""}`}
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #e8eee8",
              padding: "16px",
              maxHeight: "calc(100vh - 200px)",
              overflowY: "auto"
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#2d3748", marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
              <span>รายการหอพัก</span>
              <span style={{ fontSize: "12px", color: "#5b8e66" }}>คลิกเพื่อดูพิกัด</span>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#5b8e66" }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "20px" }}></i>
                <p style={{ marginTop: "8px", fontSize: "13px" }}>กำลังโหลดข้อมูลหอพัก...</p>
              </div>
            ) : filteredDorms.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 10px", color: "#a0aec0" }}>
                <i className="fa-solid fa-hotel" style={{ fontSize: "32px", marginBottom: "8px" }}></i>
                <p style={{ margin: 0, fontSize: "14px" }}>ไม่พบหอพักตามเงื่อนไขที่ค้นหา</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredDorms.map((dorm) => {
                  const isSelected = selectedDormId === dorm.id;
                  const hasCoord = dorm.latitude && dorm.longitude && Number(dorm.latitude) !== 0;
                  const img = Array.isArray(dorm.images) && dorm.images.length > 0 ? dorm.images[0] : "/images/dorm-1.jpg";

                  return (
                    <div
                      key={dorm.id}
                      onClick={() => {
                        setSelectedDormId(dorm.id);
                        if (window.innerWidth <= 768) {
                          setMobileView("map");
                        }
                      }}
                      style={{
                        display: "flex",
                        gap: "10px",
                        padding: "10px",
                        borderRadius: "10px",
                        border: isSelected ? "2px solid #5b8e66" : "1px solid #e2e8f0",
                        background: isSelected ? "#f0f7f0" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <img
                        src={img}
                        alt={dorm.name}
                        style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                        onError={(e) => { e.target.src = "/images/banner.jpg"; }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: "0 0 2px", fontSize: "13.5px", fontWeight: 700, color: "#1a202c", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {dorm.name}
                        </h4>
                        <div style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 700, marginBottom: "4px" }}>
                          {dorm.priceMin ? `${Number(dorm.priceMin).toLocaleString()} ฿/เดือน` : "ติดต่อสอบถาม"}
                        </div>
                        <div style={{ fontSize: "11px", color: "#718096", display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                          <i className="fa-solid fa-location-dot" style={{ color: "#e53e3e" }}></i>
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dorm.district || "เมืองเลย"}</span>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dorms/${dorm.id}`);
                            }}
                            style={{
                              padding: "2px 8px",
                              fontSize: "11px",
                              background: "#5b8e66",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            ดูรายละเอียด
                          </button>
                          {hasCoord && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${dorm.latitude},${dorm.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                padding: "2px 8px",
                                fontSize: "11px",
                                background: "#f1f5f9",
                                color: "#334155",
                                textDecoration: "none",
                                borderRadius: "4px",
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px"
                              }}
                            >
                              <i className="fa-solid fa-compass me-1"></i> นำทาง
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Full Interactive Map */}
          <div className={`dorm-map-container ${mobileView === "list" ? "mobile-hide" : ""}`} style={{ position: "sticky", top: "80px" }}>
            <DormMap
              dorms={filteredDorms}
              selectedDormId={selectedDormId}
              onSelectDorm={(dorm) => setSelectedDormId(dorm.id)}
              height="calc(100vh - 200px)"
            />
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .dorm-map-layout {
            grid-template-columns: 1fr !important;
          }
          .dorm-map-mobile-toggle {
            display: block !important;
          }
          .dorm-map-sidebar.mobile-hide,
          .dorm-map-container.mobile-hide {
            display: none !important;
          }
          .dorm-map-container {
            position: static !important;
          }
          .dorm-map-district-select {
            flex: 1 1 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
