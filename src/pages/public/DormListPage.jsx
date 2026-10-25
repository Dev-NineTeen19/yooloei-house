import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import DormCard from "../../components/dorm/DormCard";
import SearchableSelect from "../../components/common/SearchableSelect";
import { getApprovedDormitories } from "../../services/dormitoryService";
import { getLocations } from "../../services/locationService";
import "../../styles/dorm-list.css";

const DEFAULT_DORMS = [
  { id: "sample-1", name: "หอพัก อเธน่า", district: "เมืองเลย", address: "อ.เมืองเลย จ.เลย", bedroomCount: 1, priceMin: 3500, priceMax: 3500, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องแอร์", "ฟรี WiFi", "ที่จอดรถ"] },
  { id: "sample-2", name: "หอพัก ภูผาอินทร์", district: "เมืองเลย", address: "อ.เมืองเลย จ.เลย", bedroomCount: 1, priceMin: 3500, priceMax: 3500, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องแอร์", "ฟรี WiFi", "ที่จอดรถ"] },
  { id: "sample-3", name: "บ้านพักสบาย เชียงคาน", district: "เชียงคาน", address: "อ.เชียงคาน จ.เลย", bedroomCount: 1, priceMin: 4000, priceMax: 4000, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องแอร์", "ฟรี WiFi", "เครื่องทำน้ำอุ่น"] },
  { id: "sample-4", name: "หอพัก อานนท์", district: "เมืองเลย", address: "อ.เมืองเลย จ.เลย", bedroomCount: 1, priceMin: 3500, priceMax: 3500, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องพัดลม", "ฟรี WiFi", "ที่จอดรถ"] },
  { id: "sample-5", name: "หอพัก สุขอนันต์", district: "เมืองเลย", address: "อ.เมืองเลย จ.เลย", bedroomCount: 1, priceMin: 2800, priceMax: 2800, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องแอร์", "ฟรี WiFi", "ที่จอดรถ"] },
  { id: "sample-6", name: "หอพัก เมืองเลยปาร์ค", district: "เมืองเลย", address: "อ.เมืองเลย จ.เลย", bedroomCount: 1, priceMin: 3200, priceMax: 3200, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องแอร์", "ฟรี WiFi", "กล้องวงจรปิด"] },
  { id: "sample-7", name: "หอพัก เจริญเมือง", district: "เมืองเลย", address: "อ.เมืองเลย จ.เลย", bedroomCount: 1, priceMin: 3000, priceMax: 3000, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องแอร์", "ฟรี WiFi", "ที่จอดรถ"] },
  { id: "sample-8", name: "หอพัก ศรีสองรัก", district: "เมืองเลย", address: "อ.เมืองเลย จ.เลย", bedroomCount: 1, priceMin: 2500, priceMax: 2500, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องพัดลม", "ฟรี WiFi", "ที่จอดรถ"] },
  { id: "sample-9", name: "หอพัก กุดป่องวิว", district: "เมืองเลย", address: "อ.เมืองเลย จ.เลย", bedroomCount: 1, priceMin: 3500, priceMax: 3500, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องแอร์", "ฟรี WiFi", "ระเบียง"] },
  { id: "sample-10", name: "หอพัก นาอานการ์เด้น", district: "เมืองเลย", address: "อ.เมืองเลย จ.เลย", bedroomCount: 1, priceMin: 3800, priceMax: 3800, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องแอร์", "ฟรี WiFi", "ที่จอดรถ"] },
  { id: "sample-11", name: "หอพัก กำเนิดเพชรเรสซิเดนซ์", district: "เมืองเลย", address: "อ.เมืองเลย จ.เลย", bedroomCount: 1, priceMin: 4200, priceMax: 4200, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องแอร์", "ฟรี WiFi", "ระบบคีย์การ์ด"] },
  { id: "sample-12", name: "หอพัก เลยพิทเฮาส์", district: "เมืองเลย", address: "อ.เมืองเลย จ.เลย", bedroomCount: 1, priceMin: 3200, priceMax: 3200, rating: 5, images: ["/images/dorm-1.jpg"], amenities: ["ห้องพัดลม", "ฟรี WiFi", "ที่จอดรถ"] }
];

const DEFAULT_LOCATIONS = [
  "กำเนิดเพชร",
  "เชียงคาน",
  "ราชภัฏเลย",
  "โรงพยาบาลเลย",
  "โรงเรียนเลยพิท",
  "เมืองเลย",
  "นาอาน",
  "กุดป่อง"
];

const PRICE_OPTIONS = [
  "ต่ำกว่า 2,000 บาท",
  "2,000 - 3,000 บาท",
  "3,000 - 5,000 บาท",
  "มากกว่า 5,000 บาท"
];

const ROOM_TYPE_OPTIONS = [
  "ห้องพัดลม",
  "ห้องแอร์",
  "ห้องสตูดิโอ"
];

export default function DormListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [dorms, setDorms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationOptions, setLocationOptions] = useState(DEFAULT_LOCATIONS);

  // Form State
  const [searchName, setSearchName] = useState(searchParams.get("name") || "");
  const [district, setDistrict] = useState(searchParams.get("district") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("priceRange") || "");
  const [roomType, setRoomType] = useState(searchParams.get("roomType") || "");
  const [activeFilter, setActiveFilter] = useState("ทั้งหมด");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    async function loadLocations() {
      try {
        const locs = await getLocations();
        if (locs && locs.length > 0) {
          setLocationOptions(locs.map((l) => l.name));
        }
      } catch (err) {
        console.error("Failed to fetch locations in DormListPage:", err);
      }
    }
    loadLocations();
  }, []);

  const fetchDorms = async () => {
    setLoading(true);
    try {
      const filters = {
        name: searchName.trim(),
        district,
        priceRange,
        roomType,
        amenity: activeFilter !== "ทั้งหมด" ? activeFilter : null
      };

      const result = await getApprovedDormitories(filters);
      setDorms(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Error fetching dorms:", error);
      setDorms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDorms();
  }, [activeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDorms();
  };

  const dormNameOptions = Array.from(new Set(dorms.map((d) => d.name).filter(Boolean)));
  
  // 1-3 Days Latest Mode Logic
  const isLatestMode = searchParams.get("sort") === "latest" || searchParams.get("filter") === "latest";

  const isWithin3Days = (dateStr) => {
    if (!dateStr) return false;
    const time = new Date(dateStr).getTime();
    if (isNaN(time)) return false;
    return (Date.now() - time) <= (3 * 24 * 60 * 60 * 1000);
  };

  const baseList = dorms.length > 0 ? dorms : DEFAULT_DORMS;
  let fullList = [...baseList];
  while (fullList.length < 40) {
    fullList = [...fullList, ...DEFAULT_DORMS.map((d, idx) => ({ ...d, id: `${d.id}-dup-${fullList.length + idx}` }))];
  }
  const allDormsPadded = fullList.slice(0, 40);

  const recentDorms = baseList.filter((d) => isWithin3Days(d.createdAt) || isWithin3Days(d.updatedAt));
  const hasRecentUpdates = recentDorms.length > 0;

  let activeList = [];
  if (isLatestMode) {
    if (hasRecentUpdates) {
      activeList = [...recentDorms].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    } else {
      activeList = [...allDormsPadded].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    }
  } else {
    // ค้นหาหอพัก -> โชว์หอพักทั้งหมด เหมือนเดิม
    activeList = allDormsPadded;
  }

  // Pagination calculation (8 items per page)
  const totalPages = Math.max(1, Math.ceil(activeList.length / itemsPerPage));
  const displayedDorms = activeList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dorm-list-wrapper" style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* Mobile Top App Bar (Design Mockup: < ค้นหาหอพัก ) */}
      <div className="dorm-list-mobile-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mobile-header-back-btn"
          aria-label="ย้อนกลับ"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2 className="mobile-header-title">ค้นหาหอพัก</h2>
      </div>

      {/* =====================================================
                          HERO BANNER SECTION
      ===================================================== */}
      <section className="dorm-list-hero-section">
        {/* Light Green Gradient Overlay */}
        <div className="dorm-list-hero-overlay"></div>

        <div className="dorm-list-hero-content">
          <h1 style={{ fontSize: "48px", fontWeight: "800", margin: "0 0 12px 0", lineHeight: "1.15" }}>
            <span style={{ color: "#1e293b", display: "block" }}>
              {isLatestMode ? "หอพักล่าสุด" : "ค้นหาหอพัก"}
            </span>
            <span style={{ color: "#5b8e66", display: "block" }}>ในจังหวัดเลย</span>
          </h1>
          <p style={{ fontSize: "18px", color: "#475569", lineHeight: "1.6", margin: 0 }}>
            {isLatestMode ? (
              hasRecentUpdates
                ? "แสดงรายการหอพักที่มีการอัปเดต หรือเพิ่มห้องว่างใหม่ใน 1-3 วันนี้"
                : "ยังไม่มีการอัปเดตใหม่ใน 1-3 วันนี้ — แสดงรายการหอพักทั้งหมดอัปเดตล่าสุด"
            ) : (
              "รวมหอพักคุณภาพดี ที่ได้รับความนิยมจากผู้ใช้งาน คัดสรรมาเพื่อคุณโดยเฉพาะ"
            )}
          </p>
        </div>

        {/* Floating Overlapping Search Box */}
        <div className="dorm-list-search-card">
          {/* Breadcrumb for Mobile (Design: หน้าแรก / ค้นหาหอพัก) */}
          <div className="dorm-search-breadcrumb">
            <Link to="/" className="breadcrumb-link">หน้าแรก</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">ค้นหาหอพัก</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="dorm-search-form">
            <div className="dorm-form-group" style={{ position: "relative", zIndex: 30 }}>
              <label className="dorm-form-label">
                ชื่อหอ
              </label>
              <SearchableSelect
                value={searchName}
                onChange={(val) => setSearchName(val)}
                options={dormNameOptions}
                placeholder="ค้นหาชื่อหอพัก"
                icon="fa-magnifying-glass"
              />
            </div>

            <div className="dorm-form-group" style={{ position: "relative", zIndex: 30 }}>
              <label className="dorm-form-label">
                พื้นที่
              </label>
              <SearchableSelect
                value={district}
                onChange={(val) => setDistrict(val)}
                options={locationOptions}
                placeholder="เลือกพื้นที่"
                icon="fa-chevron-down"
              />
            </div>

            <div className="dorm-form-group" style={{ position: "relative", zIndex: 20 }}>
              <label className="dorm-form-label">
                ช่วงราคา
              </label>
              <SearchableSelect
                value={priceRange}
                onChange={(val) => setPriceRange(val)}
                options={PRICE_OPTIONS}
                placeholder="เลือกช่วงราคา"
                icon="fa-chevron-down"
              />
            </div>

            <div className="dorm-form-group" style={{ position: "relative", zIndex: 20 }}>
              <label className="dorm-form-label">
                ประเภทห้อง
              </label>
              <SearchableSelect
                value={roomType}
                onChange={(val) => setRoomType(val)}
                options={ROOM_TYPE_OPTIONS}
                placeholder="เลือกประเภท"
                icon="fa-chevron-down"
              />
            </div>

            <button
              type="submit"
              className="dorm-search-submit-btn"
            >
              ค้นหา
            </button>
          </form>

          {/* Quick Category Filter Bar inside Card for Mobile, or standalone for Desktop */}
          <div className="dorm-category-scroll-container">
            {[
              { label: "ทั้งหมด", icon: "fa-table-cells-large" },
              { label: "ใกล้มหาวิทยาลัย", icon: "fa-building-columns" },
              { label: "ใกล้โรงพยาบาล", icon: "fa-square-h" },
              { label: "ใกล้ห้าง", icon: "fa-bag-shopping" },
              { label: "ใกล้ธรรมชาติ", icon: "fa-tree" },
              { label: "ราคาประหยัด", icon: "fa-hand-holding-dollar" }
            ].map((filter) => {
              const isActive = activeFilter === filter.label || (filter.label === "ใกล้ธรรมชาติ" && activeFilter === "ธรรมชาติ");
              return (
                <button
                  key={filter.label}
                  type="button"
                  className={`dorm-category-pill-btn ${isActive ? "active" : ""}`}
                  onClick={() => {
                    const val = filter.label === "ใกล้ธรรมชาติ" ? "ธรรมชาติ" : filter.label;
                    setActiveFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <i className={`fa-solid ${filter.icon}`}></i>
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
                          DORM GRID RESULTS (4 Columns x 3 Rows)
      ===================================================== */}
      <section className="dorm-list-results-section" style={{ padding: "80px 0 60px 0", maxWidth: "1120px", margin: "0 auto", paddingLeft: "30px", paddingRight: "30px" }}>
        {isLatestMode && !loading && (
          <div style={{
            marginBottom: "24px",
            padding: "14px 20px",
            background: hasRecentUpdates ? "#f0fdf4" : "#f8faf8",
            border: `1px solid ${hasRecentUpdates ? "#86efac" : "#e2e8f0"}`,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: hasRecentUpdates ? "#166534" : "#475569",
            fontWeight: 600,
            fontSize: "15px"
          }}>
            <i className={hasRecentUpdates ? "fa-solid fa-sparkles" : "fa-solid fa-layer-group"} style={{ fontSize: "20px", color: "#5b8e66" }}></i>
            <span>
              {hasRecentUpdates
                ? `พบหอพักที่มีการอัปเดต / เพิ่มห้องว่างใหม่ใน 1-3 วันนี้ ทั้งหมด ${activeList.length} แห่ง`
                : `ไม่มีหอพักอัปเดตใหม่ใน 1-3 วันนี้ — แสดงรายการหอพักที่มีอยู่เดิมทั้งหมดเรียงตามล่าสุด (${activeList.length} แห่ง)`}
            </span>
          </div>
        )}

        {/* Section Header Row for Dorm Results (Matches media_1789454940444.png) */}
        <div className="dorm-list-results-header">
          <h2 className="dorm-list-results-title">
            {isLatestMode ? "หอพักล่าสุด" : "ค้นหาหอพัก"}
          </h2>
          <Link
            to={isLatestMode ? "/dorms" : "/dorms?sort=latest"}
            className="dorm-list-view-more-pill"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid #222222",
              borderRadius: "9999px",
              padding: "3px 12px",
              fontSize: "12px",
              fontWeight: "600",
              color: "#222222",
              textDecoration: "none",
              backgroundColor: "#ffffff",
              lineHeight: "1.3",
              boxSizing: "border-box"
            }}
          >
            ดูเพิ่มเติม
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b", fontSize: "16px" }}>
            กำลังโหลดข้อมูลหอพัก...
          </div>
        ) : displayedDorms.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b", fontSize: "16px" }}>
            ไม่พบหอพักที่ตรงกับเงื่อนไขการค้นหา
          </div>
        ) : (
          <div
            className="dorm-grid-results"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px"
            }}
          >
            {displayedDorms.map((dorm) => (
              <DormCard key={dorm.id} dorm={dorm} />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              marginTop: "45px"
            }}
          >
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              style={{
                background: "none",
                border: "none",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                color: currentPage === 1 ? "#cbd5e1" : "#64748b",
                fontSize: "18px",
                padding: "4px 8px"
              }}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: isActive ? "#688d67" : "transparent",
                    color: isActive ? "#ffffff" : "#475569",
                    fontWeight: isActive ? "700" : "500",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              style={{
                background: "none",
                border: "none",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                color: currentPage === totalPages ? "#cbd5e1" : "#64748b",
                fontSize: "18px",
                padding: "4px 8px"
              }}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
