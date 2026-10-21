import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SearchableSelect from "../../components/common/SearchableSelect";
import { getApprovedDormitories } from "../../services/dormitoryService";
import { getLocations } from "../../services/locationService";
import { getLatestReviews } from "../../services/reviewService";
import HomeAnnouncementBanner from "../../components/common/HomeAnnouncementBanner";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const DEFAULT_HERO_SLIDES = [
  {
    id: "default-slide-1",
    imageUrl: "/images/banner.jpg",
    title: "ค้นหาหอพักที่ใช่",
    title2: "ในจังหวัดเลย",
    desc: "ค้นหา เปรียบเทียบ และเลือกหอพักได้ง่าย\nครบทุกข้อมูลในเว็บไซต์เดียว",
    linkUrl: "/dorms",
    buttonText: "ค้นหาหอพัก"
  },
  {
    id: "default-slide-2",
    imageUrl: "/images/hero.jpg",
    title: "หอพักคุณภาพ ใกล้มหาวิทยาลัย",
    title2: "พร้อมเข้าอยู่ทันที",
    desc: "รวมหอพักนักศึกษาและคนทำงาน ราคาประหยัด สะดวก ปลอดภัย",
    linkUrl: "/dorms?filter=ใกล้มหาวิทยาลัย",
    buttonText: "ดูหอพักทั้งหมด"
  },
  {
    id: "default-slide-3",
    imageUrl: "/images/dorm-1.jpg",
    title: "ลงประกาศหอพักฟรี",
    title2: "เข้าถึงผู้เช่าได้มากกว่า",
    desc: "เจ้าของหอพักสามารถลงทะเบียนและจัดการห้องพักได้ง่ายๆ ตลอด 24 ชม.",
    linkUrl: "/register",
    buttonText: "ลงประกาศหอพัก"
  }
];

const FALLBACK_DORMS = [
  {
    id: "sample-1",
    name: "หอพัก อเธน่า",
    district: "เมืองเลย",
    address: "1.2 km จากราชภัฏเลย",
    priceMin: 3500,
    priceMax: 3500,
    rating: 5,
    images: ["/images/dorm-1.jpg"],
    isNew: true
  },
  {
    id: "sample-2",
    name: "หอพัก ภูผาอินทร์",
    district: "เมืองเลย",
    address: "1.2 km จากราชภัฏเลย",
    priceMin: 3500,
    priceMax: 3500,
    rating: 5,
    images: ["/images/dorm-1.jpg"],
    isNew: true
  },
  {
    id: "sample-3",
    name: "บ้านพักสบาย เชียงคาน",
    district: "เชียงคาน",
    address: "1.2 km จากราชภัฏเลย",
    priceMin: 3500,
    priceMax: 3500,
    rating: 5,
    images: ["/images/dorm-1.jpg"],
    isNew: true
  },
  {
    id: "sample-4",
    name: "หอพัก อานนท์",
    district: "เมืองเลย",
    address: "1.2 km จากราชภัฏเลย",
    priceMin: 3500,
    priceMax: 3500,
    rating: 5,
    images: ["/images/dorm-1.jpg"],
    isNew: true
  },
  {
    id: "sample-5",
    name: "หอพัก สุขอนันต์",
    district: "เมืองเลย",
    address: "1.2 km จากราชภัฏเลย",
    priceMin: 3500,
    priceMax: 3500,
    rating: 5,
    images: ["/images/dorm-1.jpg"],
    isNew: true
  },
  {
    id: "sample-6",
    name: "หอพัก เมืองเลยปาร์ค",
    district: "เมืองเลย",
    address: "1.2 km จากราชภัฏเลย",
    priceMin: 3500,
    priceMax: 3500,
    rating: 5,
    images: ["/images/dorm-1.jpg"],
    isNew: true
  }
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

const FALLBACK_REVIEWS = [
  {
    id: "rev-1",
    dormitoryId: "sample-1",
    rating: 5,
    comment: "ห้องสะอาด บรรยากาศดี",
    subtext: "ใกล้มหาวิทยาลัย เดินทางสะดวก",
    userName: "นายซีเอล",
    userPhoto: "/images/default-avatar.jpg",
    timeAgo: "เมื่อวาน"
  },
  {
    id: "rev-2",
    dormitoryId: "sample-2",
    rating: 5,
    comment: "เจ้าของดูแลดีมาก",
    subtext: "มีสิ่งอำนวยความสะดวก",
    userName: "นายดื้อ",
    userPhoto: "/images/default-avatar.jpg",
    timeAgo: "2 วันที่แล้ว"
  },
  {
    id: "rev-3",
    dormitoryId: "sample-1",
    rating: 5,
    comment: "ห้องสะอาด บรรยากาศดี",
    subtext: "บรรยากาศ น่านอนมาก",
    userName: "นางสาว หมางอน",
    userPhoto: "/images/default-avatar.jpg",
    timeAgo: "3 วันที่แล้ว"
  },
  {
    id: "rev-4",
    dormitoryId: "sample-3",
    rating: 5,
    comment: "ประหยัด สบายกระเป๋า",
    subtext: "ปลอดภัย ไม่ไกลจากที่ทำงาน",
    userName: "นายเมสซี่",
    userPhoto: "/images/default-avatar.jpg",
    timeAgo: "4 วันที่แล้ว"
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const { settings } = useSiteSettings();
  const [dorms, setDorms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationOptions, setLocationOptions] = useState(DEFAULT_LOCATIONS);
  const [reviewsList, setReviewsList] = useState([]);

  const [searchName, setSearchName] = useState("");
  const [district, setDistrict] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [roomType, setRoomType] = useState("");
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

  // Hero Banner Slider States
  const heroSlides = settings?.heroBanners && settings.heroBanners.length > 0 ? settings.heroBanners : DEFAULT_HERO_SLIDES;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // เฉพาะเวอร์ชันมือถือเท่านั้นที่เลื่อนสไลด์อัตโนมัติ สำหรับเดสก์ท็อปให้ค้างไว้ที่หน้าหลักตามคำขอ ("เฉพาะ เวอร์ชั่นของ desttop ทำให้ค้างแต่หน้านี้")
    if (!isMobile || heroSlides.length <= 1 || isSliderHovered) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isMobile, heroSlides.length, isSliderHovered]);

  useEffect(() => {
    if (currentSlideIndex >= heroSlides.length) {
      setCurrentSlideIndex(0);
    }
  }, [heroSlides.length, currentSlideIndex]);

  // บนเดสก์ท็อปให้ค้างที่สไลด์หน้าหลัก (index 0) เสมอ บนมือถือใช้ currentSlideIndex
  const activeSlideIndex = isMobile ? currentSlideIndex : 0;

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) {
      handleNextSlide();
    } else if (distance < -45) {
      handlePrevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  useEffect(() => {
    getApprovedDormitories()
      .then((data) => {
        if (data && data.length > 0) setDorms(data);
        else setDorms(FALLBACK_DORMS);
      })
      .catch(() => setDorms(FALLBACK_DORMS))
      .finally(() => setLoading(false));

    async function loadLocations() {
      try {
        const locs = await getLocations();
        if (locs && locs.length > 0) {
          setLocationOptions(locs.map((l) => l.name));
        }
      } catch (err) {
        console.error("Failed to load locations in HomePage:", err);
      }
    }

    async function loadReviews() {
      try {
        const revs = await getLatestReviews();
        if (revs && revs.length > 0) {
          setReviewsList(revs.slice(0, 4));
        } else {
          setReviewsList(FALLBACK_REVIEWS);
        }
      } catch (err) {
        setReviewsList(FALLBACK_REVIEWS);
      }
    }

    loadLocations();
    loadReviews();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchName.trim()) query.set("name", searchName.trim());
    if (district && !district.startsWith("เลือก")) query.set("district", district.trim());
    if (priceRange && !priceRange.startsWith("เลือก")) query.set("priceRange", priceRange.trim());
    if (roomType && !roomType.startsWith("เลือก")) query.set("roomType", roomType.trim());
    if (activeCategory && activeCategory !== "ทั้งหมด") {
      const catVal = activeCategory === "ใกล้ธรรมชาติ" ? "ธรรมชาติ" : activeCategory;
      query.set("filter", catVal);
    }
    navigate(`/dorms?${query.toString()}`);
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat.label);
    const query = new URLSearchParams();
    if (searchName.trim()) query.set("name", searchName.trim());
    if (district && !district.startsWith("เลือก")) query.set("district", district.trim());
    if (priceRange && !priceRange.startsWith("เลือก")) query.set("priceRange", priceRange.trim());
    if (roomType && !roomType.startsWith("เลือก")) query.set("roomType", roomType.trim());
    if (cat.label !== "ทั้งหมด") {
      const catVal = cat.label === "ใกล้ธรรมชาติ" ? "ธรรมชาติ" : cat.label;
      query.set("filter", catVal);
    }
    const qStr = query.toString();
    navigate(qStr ? `/dorms?${qStr}` : "/dorms");
  };

  const dormNameOptions = Array.from(new Set(dorms.map((d) => d.name).filter(Boolean)));
  const displayRecommendedDorms = dorms.length >= 6 ? dorms.slice(0, 6) : [...dorms, ...FALLBACK_DORMS].slice(0, 6);
  const displayLatestDorms = dorms.length >= 6 ? [...dorms].reverse().slice(0, 6) : [...FALLBACK_DORMS].slice(0, 6);

  return (
    <div>
      {/* ===============================
              HERO BANNER SLIDER SECTION
      ================================ */}
      <section
        className="home-hero-container"
        onMouseEnter={() => setIsSliderHovered(true)}
        onMouseLeave={() => setIsSliderHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "500px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingBottom: "60px",
          overflow: "visible"
        }}
      >
        {/* Background Slides with Cross-Fade */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
            zIndex: 0
          }}
        >
          {heroSlides.map((slide, index) => {
            const isActive = index === activeSlideIndex;
            return (
              <div
                key={slide.id || index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 0.6s ease-in-out, transform 0.6s ease-in-out",
                  transform: isActive ? "scale(1)" : "scale(1.02)",
                  pointerEvents: isActive ? "auto" : "none",
                  background: `url('${slide.imageUrl || "/images/banner.jpg"}') center / cover no-repeat`
                }}
              />
            );
          })}
          {/* Desktop Left Mint Gradient Overlay (Matches media_1792437252231.png) */}
          <div className="home-hero-desktop-overlay" />
        </div>

        {/* Content of Current Slide */}
        <div
          className="home-hero-content-wrapper"
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1120px",
            width: "100%",
            margin: "0 auto"
          }}
        >
          {heroSlides[activeSlideIndex]?.title ? (
            <div style={{ maxWidth: "600px" }}>
              <h1
                className="home-hero-title-1"
                style={{
                  fontWeight: "800",
                  color: "#1e293b",
                  lineHeight: "1.15"
                }}
              >
                {heroSlides[activeSlideIndex].title}
              </h1>
              {heroSlides[activeSlideIndex].title2 && (
                <h1
                  className="home-hero-title-2"
                  style={{
                    fontWeight: "800",
                    color: "#5b8e66",
                    lineHeight: "1.15"
                  }}
                >
                  {heroSlides[activeSlideIndex].title2}
                </h1>
              )}

              {heroSlides[activeSlideIndex].desc && (
                <p
                  className="home-hero-desc"
                  style={{ color: "#475569", whiteSpace: "pre-line" }}
                >
                  {heroSlides[activeSlideIndex].desc}
                </p>
              )}

              <div className="home-hero-buttons" style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <Link to={heroSlides[activeSlideIndex].linkUrl || "/dorms"} style={{ textDecoration: "none" }}>
                  <button
                    style={{
                      backgroundColor: "#688d67",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 26px",
                      fontSize: "15px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(104, 141, 103, 0.3)"
                    }}
                  >
                    <i className="fa-solid fa-magnifying-glass"></i>
                    {heroSlides[activeSlideIndex].buttonText || "ค้นหาหอพัก"}
                  </button>
                </Link>

                {userRole === "owner" ? (
                  <Link to="/owner/dormitories" style={{ textDecoration: "none" }}>
                    <button
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "12px 24px",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <i className="fa-solid fa-building"></i>
                      ดูหอพักของฉัน
                    </button>
                  </Link>
                ) : userRole === "admin" ? (
                  <Link to="/admin/dashboard" style={{ textDecoration: "none" }}>
                    <button
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "12px 24px",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <i className="fa-solid fa-chart-column"></i>
                      ระบบจัดการ (แอดมิน)
                    </button>
                  </Link>
                ) : userRole === "user" ? (
                  <Link to="/user/favorites" style={{ textDecoration: "none" }}>
                    <button
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "12px 24px",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <i className="fa-solid fa-heart" style={{ color: "#ffffff", WebkitTextStroke: "1.5px #334155", fontSize: "16px" }}></i>
                      หอพักที่บันทึกไว้
                    </button>
                  </Link>
                ) : (
                  <Link to="/register" style={{ textDecoration: "none" }}>
                    <button
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "12px 24px",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <i className="fa-regular fa-building"></i>
                      ลงประกาศหอพัก
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            heroSlides[activeSlideIndex]?.linkUrl && (
              <Link
                to={heroSlides[activeSlideIndex].linkUrl}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "block",
                  zIndex: 2
                }}
                aria-label="Banner link"
              />
            )
          )}
        </div>

        {/* Previous & Next Arrow Controls (Hidden as requested: "ไม่เอา <> ซ่อนให้หหน่อย") */}

        {/* Pagination Indicator Dots (Mobile Only as requested: "เฉพาะ เวอร์ชั่นของ desttop ทำให้ค้างแต่หน้านี้") */}
        {isMobile && heroSlides.length > 1 && (
          <div className="home-hero-dots-container">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrentSlideIndex(idx); }}
                className={`home-hero-dot ${idx === currentSlideIndex ? "active" : ""}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Floating Overlapping Search Box (Matching media_1789711583517.png) */}
        <div
          className="home-floating-search-card"
          style={{
            position: "absolute",
            bottom: "-70px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 40px)",
            maxWidth: "1120px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "20px 24px 18px 24px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
            border: "1px solid #f1f5f9",
            zIndex: 10
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{
              display: "grid",
              gridTemplateColumns: "1.35fr 1fr 1fr 1fr auto",
              gap: "14px",
              alignItems: "end"
            }}
          >
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "700", fontSize: "13px", color: "#1e293b" }}>
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

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "700", fontSize: "13px", color: "#1e293b" }}>
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

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "700", fontSize: "13px", color: "#1e293b" }}>
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

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "700", fontSize: "13px", color: "#1e293b" }}>
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
              style={{
                backgroundColor: "#5b835a",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                height: "44px",
                padding: "0 26px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s"
              }}
            >
              ค้นหา
            </button>
          </form>

          {/* Divider line between form and category pills */}
          <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "16px 0 14px 0" }} />

          {/* Quick Category Filter Pills (Matching media_1789711583517.png) */}
          <div
            className="home-category-pills-row"
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              alignItems: "center"
            }}
          >
            {[
              { label: "ทั้งหมด", icon: "fa-table-cells-large" },
              { label: "ใกล้มหาวิทยาลัย", icon: "fa-building-columns" },
              { label: "ใกล้โรงพยาบาล", icon: "fa-square-h" },
              { label: "ใกล้ห้าง", icon: "fa-bag-shopping" },
              { label: "ใกล้ธรรมชาติ", icon: "fa-tree" },
              { label: "ราคาประหยัด", icon: "fa-hand-holding-dollar" }
            ].map((cat) => {
              const isActive = activeCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  type="button"
                  className={`home-pill-filter-btn ${isActive ? "active" : ""}`}
                  onClick={() => handleCategoryClick(cat)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "6px 16px",
                    borderRadius: "9999px",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    backgroundColor: isActive ? "#5b835a" : "#ffffff",
                    color: isActive ? "#ffffff" : "#334155",
                    border: isActive ? "1.5px solid #5b835a" : "1.5px solid #e2e8f0"
                  }}
                >
                  <i
                    className={`fa-solid ${cat.icon}`}
                    style={{
                      fontSize: "12.5px",
                      color: isActive ? "#ffffff" : "#475569"
                    }}
                  ></i>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
              SECTION 1: หอพักแนะนำ (Recommended Dormitories)
      ===================================================== */}
      <section className="home-section-recommended" style={{ backgroundColor: "#ffffff" }}>
        <div className="home-section-container" style={{ maxWidth: "1120px", margin: "0 auto" }}>
          {/* ข่าวประกาศหน้าแรก (ซ่อนอัตโนมัติหากไม่มีประกาศ หรือถูกปิดด้วย [x]) */}
          <HomeAnnouncementBanner />

          <div className="section-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="section-title-text" style={{ fontWeight: "800", color: "#1e293b", margin: 0 }}>
              หอพักแนะนำ
            </h2>
            <Link
              to="/dorms"
              className="btn-view-more-pill"
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

          <div className="home-dorm-grid" style={{ display: "grid" }}>
            {displayRecommendedDorms.map((dorm, idx) => (
              <div
                key={dorm.id || idx}
                className="dorm-card-recommended"
              >
                <div>
                  <div className="dorm-card-img-container" style={{ position: "relative" }}>
                    <img
                      src={dorm.images && dorm.images[0] ? dorm.images[0] : "/images/banner.jpg"}
                      alt={dorm.name}
                      onError={(e) => { e.target.src = "/images/banner.jpg"; }}
                    />
                    {dorm.isRecommended ? (
                      <span
                        style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                          color: "#ffffff",
                          fontSize: "10.5px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <i className="fa-solid fa-star" style={{ fontSize: "9px" }}></i>
                        แนะนำ
                      </span>
                    ) : null}
                  </div>
                  <div className="dorm-card-body">
                    <h4 className="dorm-card-title">
                      {dorm.name || "หอพัก อเธน่า"}
                    </h4>
                    <div className="dorm-card-stars">
                      {Array.from({ length: dorm.rating || 5 }).map((_, i) => (
                        <i key={i} className="fa-solid fa-star"></i>
                      ))}
                    </div>
                    <div className="dorm-card-price">
                      {Number(dorm.priceMin || 1000).toLocaleString()} บาท/เดือน
                    </div>
                    {/* Location Pin Icon + Address */}
                    <div className="dorm-card-location">
                      <i className="fa-solid fa-location-dot"></i>
                      <span>
                        {dorm.address || (dorm.district ? `อำเภอ${dorm.district}` : "ราชภัฏเลย")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="dorm-card-btn-container">
                  <Link
                    to={`/dorms/${dorm.id || "sample-1"}`}
                    className="btn-dorm-detail-outline"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
              SECTION 2: หอพักล่าสุด (Latest Dormitories)
      ===================================================== */}
      <section className="home-section-recommended" style={{ backgroundColor: "#ffffff" }}>
        <div className="home-section-container" style={{ maxWidth: "1120px", margin: "0 auto" }}>
          <div className="section-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="section-title-text" style={{ fontWeight: "800", color: "#1e293b", margin: 0 }}>
              หอพักล่าสุด
            </h2>
            <Link
              to="/dorms?sort=newest"
              className="btn-view-more-pill"
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

          <div className="home-dorm-grid" style={{ display: "grid" }}>
            {displayLatestDorms.map((dorm, idx) => (
              <div
                key={dorm.id || idx}
                className="dorm-card-recommended"
              >
                <div>
                  <div className="dorm-card-img-container">
                    <img
                      src={dorm.images && dorm.images[0] ? dorm.images[0] : "/images/banner.jpg"}
                      alt={dorm.name}
                      onError={(e) => { e.target.src = "/images/banner.jpg"; }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        backgroundColor: "#5b8e66",
                        color: "#ffffff",
                        fontSize: "10.5px",
                        fontWeight: "700",
                        padding: "2px 7px",
                        borderRadius: "4px"
                      }}
                    >
                      ใหม่
                    </span>
                  </div>
                  <div className="dorm-card-body">
                    <h4 className="dorm-card-title">
                      {dorm.name || "หอพัก อเธน่า"}
                    </h4>
                    <div className="dorm-card-stars">
                      {Array.from({ length: dorm.rating || 5 }).map((_, i) => (
                        <i key={i} className="fa-solid fa-star"></i>
                      ))}
                    </div>
                    <div className="dorm-card-price">
                      {Number(dorm.priceMin || 1000).toLocaleString()} บาท/เดือน
                    </div>
                    {/* Location Pin Icon + Address */}
                    <div className="dorm-card-location">
                      <i className="fa-solid fa-location-dot"></i>
                      <span>
                        {dorm.address || (dorm.district ? `อำเภอ${dorm.district}` : "ราชภัฏเลย")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="dorm-card-btn-container">
                  <Link
                    to={`/dorms/${dorm.id || "sample-1"}`}
                    className="btn-dorm-detail-outline"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
              SECTION 3: รีวิวล่าสุดจากผู้เข้าพัก (Tenant Reviews)
      ===================================================== */}
      {/* =====================================================
              SECTION 3: รีวิวล่าสุดจากผู้เข้าพัก (Tenant Reviews)
      ===================================================== */}
      <section className="home-section latest-reviews-section" style={{ backgroundColor: "#ffffff" }}>
        <div className="home-section-container" style={{ maxWidth: "1120px", margin: "0 auto" }}>
          <h2 className="reviews-section-title" style={{ fontWeight: "800", color: "#1e293b", textAlign: "left" }}>
            รีวิวล่าสุดจากผู้เข้าพัก
          </h2>

          <div className="reviews-scroll-container">
            {(reviewsList && reviewsList.length > 0 ? reviewsList : FALLBACK_REVIEWS).map((rev, idx) => {
              const targetDormId = rev.dormitoryId || rev.dormitory_id || rev.dormId || (dorms[idx % dorms.length]?.id) || "sample-1";
              return (
                <div
                  key={rev.id || idx}
                  onClick={() => navigate(`/dorms/${targetDormId}`)}
                  className="review-card-item"
                  title="กดเพื่อดูรายละเอียดหอพักนี้"
                >
                  <div>
                    {/* Stars */}
                    <div className="review-card-stars">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <i key={i} className="fa-solid fa-star"></i>
                      ))}
                    </div>

                    {/* Comment */}
                    <h4 className="review-card-comment">
                      "{rev.comment}"
                    </h4>
                    <p className="review-card-subtext">
                      {rev.subtext || rev.dormitoryName || "ใกล้มหาวิทยาลัย เดินทางสะดวก"}
                    </p>
                  </div>

                  <div>
                    {/* Link Indicator */}
                    <div className="review-card-dorm-link">
                      <i className="fa-solid fa-house"></i>
                      <span>{rev.dormitoryName || "ดูหอพักนี้"}</span>
                      <i className="fa-solid fa-angle-right" style={{ marginLeft: "auto" }}></i>
                    </div>

                    {/* User Info */}
                    <div className="review-card-user">
                      <img
                        src={rev.userPhoto || "/images/default-avatar.jpg"}
                        alt="Avatar"
                        className="review-card-avatar"
                        onError={(e) => { e.target.src = "/images/default-avatar.jpg"; }}
                      />
                      <div>
                        <div className="review-card-username">
                          {rev.userName}
                        </div>
                        <div className="review-card-time">
                          {rev.timeAgo || "เมื่อเร็วๆ นี้"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
              SECTION 4: ทำไมต้องเลือก อยู่เลยเฮาส์ (Why Choose Us)
      ===================================================== */}
      <section className="home-section why-choose-section" style={{ backgroundColor: "#fafdfa" }}>
        <div className="home-section-container" style={{ maxWidth: "1120px", margin: "0 auto" }}>
          <h2 className="why-choose-heading" style={{ fontWeight: "800", color: "#1e293b", textAlign: "center" }}>
            ทำไมต้องเลือก <span style={{ color: "#5b8e66" }}>อยู่เลยเฮาส์</span>
          </h2>

          <div className="why-choose-scroll-container">
            {[
              {
                icon: "fa-magnifying-glass",
                title: "ค้นหาได้ง่าย",
                desc: "ค้นหาหอพักได้รวดเร็ว ครบทุกอำเภอในจังหวัดเลย"
              },
              {
                icon: "fa-map-location-dot",
                title: "ดูตำแหน่งบนแผนที่",
                desc: "ดูตำแหน่งหอพักบน Google Map ได้ทันที"
              },
              {
                icon: "fa-star",
                title: "รีวิวจากผู้ใช้งานจริง",
                desc: "รีวิวและคะแนนจากผู้เข้าพักจริงช่วยในการตัดสินใจ"
              },
              {
                icon: "fa-comments",
                title: "ติดต่อเจ้าของง่าย",
                desc: "ติดต่อเจ้าของหอพักได้โดยตรงผ่านระบบแชท"
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="why-choose-card-item"
              >
                <div className="why-choose-icon-box">
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <div>
                  <h4 className="why-choose-title">
                    {item.title}
                  </h4>
                  <p className="why-choose-desc">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
              SECTION 5: วิธีใช้งานเว็บไซต์ (How to Use)
      ===================================================== */}
      <section className="home-section how-to-use-section" style={{ backgroundColor: "#ffffff" }}>
        <div className="home-section-container" style={{ maxWidth: "1120px", margin: "0 auto" }}>
          <h2 className="how-to-use-heading" style={{ fontWeight: "800", color: "#1e293b", textAlign: "center" }}>
            วิธีใช้งานเว็บไซต์
          </h2>

          <div className="how-to-use-scroll-container">
            {/* Step 1 */}
            <div className="how-to-use-card-item">
              <div className="step-badge-num">1</div>
              <i className="fa-solid fa-magnifying-glass step-main-icon"></i>
              <div className="step-text-box">
                <h4 className="step-text-title step-title-dark">
                  ค้นหาหอพัก
                </h4>
                <p className="step-text-desc">
                  ค้นหาหอพักที่ต้องการ ราคา/ทำเลที่ใช่
                </p>
              </div>
            </div>

            {/* Arrow 1 */}
            <div className="step-arrow-divider">
              <i className="fa-solid fa-arrow-right"></i>
            </div>

            {/* Step 2 */}
            <div className="how-to-use-card-item">
              <div className="step-badge-num">2</div>
              <i className="fa-solid fa-scale-balanced step-main-icon"></i>
              <div className="step-text-box">
                <h4 className="step-text-title step-title-green">
                  เปรียบเทียบ
                </h4>
                <p className="step-text-desc">
                  เปรียบเทียบราคา สิ่งอำนวยความสะดวก และรีวิว เพื่อประกอบการตัดสินใจ
                </p>
              </div>
            </div>

            {/* Arrow 2 */}
            <div className="step-arrow-divider">
              <i className="fa-solid fa-arrow-right"></i>
            </div>

            {/* Step 3 */}
            <div className="how-to-use-card-item">
              <div className="step-badge-num">3</div>
              <i className="fa-solid fa-calendar-days step-main-icon"></i>
              <div className="step-text-box">
                <h4 className="step-text-title step-title-green">
                  จองห้อง
                </h4>
                <p className="step-text-desc">
                  ติดต่อเจ้าของหอพัก และจองห้องได้ง่าย
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
