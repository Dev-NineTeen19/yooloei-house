import { Link } from "react-router-dom";
import PublicMobileHeader from "../../components/common/PublicMobileHeader";
import { useAuth } from "../../context/AuthContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { showAlert } from "../../context/ModalContext";

export default function AboutPage() {
  const { userRole } = useAuth();
  const { settings } = useSiteSettings();

  const handleAdminContactClick = async () => {
    await showAlert({
      title: "สำหรับผู้ดูแลระบบ",
      heading: "คุณกำลังใช้งานในฐานะแอดมิน",
      message: "ผู้ดูแลระบบสามารถเข้าดูและจัดการข้อความจากผู้ใช้งานผ่านเมนูแชทได้โดยตรงครับ",
      type: "info"
    });
  };

  const siteName = settings?.siteName || "อยู่เลย เฮาส์";

  return (
    <div className="about-page-wrapper">
      <PublicMobileHeader
        title="เกี่ยวกับเรา"
      />
      
      {/* 1. Hero Section (Clean Centered Style Matching Contact Page) */}
      <section className="about-hero-section">
        <h1 className="about-hero-title">
          เกี่ยวกับ <span>{siteName}</span>
        </h1>
        <h2 className="about-hero-heading">
          ศูนย์รวมข้อมูลและบริการจองหอพักอันดับ 1 <span style={{ whiteSpace: "nowrap" }}>ในจังหวัดเลย</span>
        </h2>

        <p className="about-hero-subtitle">
          เรามุ่งมั่นเชื่อมโยงผู้เช่า นักศึกษา และคนทำงาน เข้ากับเจ้าของหอพักในจังหวัดเลย
          ด้วยข้อมูลที่โปร่งใส รูปภาพสถานที่จริง และระบบจองที่สะดวก ปลอดภัย เชื่อถือได้ในทุกขั้นตอน
        </p>

        <div className="about-hero-actions">
          <Link to="/dorms" className="about-btn-primary">
            <i className="fa-solid fa-magnifying-glass"></i>
            <span>ค้นหาหอพักเลย</span>
          </Link>

          {userRole !== "admin" ? (
            <Link to="/contact" className="about-btn-secondary">
              <i className="fa-regular fa-envelope"></i>
              <span>ติดต่อเรา</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAdminContactClick}
              className="about-btn-secondary"
              title="เข้าดูข้อความผ่านเมนูแชท"
            >
              <i className="fa-regular fa-envelope"></i>
              <span>ติดต่อเรา (แอดมิน)</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. Interactive Stats Grid */}
      <div className="about-stats-container">
        <div className="about-stats-card">
          <div className="about-stat-item">
            <div className="about-stat-icon-wrap green">
              <i className="fa-solid fa-hotel"></i>
            </div>
            <div>
              <div className="about-stat-num">100+</div>
              <div className="about-stat-label">หอพักพาร์ทเนอร์ในเลย</div>
            </div>
          </div>

          <div className="about-stat-item">
            <div className="about-stat-icon-wrap blue">
              <i className="fa-solid fa-door-open"></i>
            </div>
            <div>
              <div className="about-stat-num">500+</div>
              <div className="about-stat-label">ห้องพักพร้อมให้บริการ</div>
            </div>
          </div>

          <div className="about-stat-item">
            <div className="about-stat-icon-wrap purple">
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <div className="about-stat-num">1,000+</div>
              <div className="about-stat-label">ผู้ใช้งานที่ไว้วางใจ</div>
            </div>
          </div>

          <div className="about-stat-item">
            <div className="about-stat-icon-wrap amber">
              <i className="fa-solid fa-star"></i>
            </div>
            <div>
              <div className="about-stat-num" style={{ color: "#d97706" }}>4.8 ★</div>
              <div className="about-stat-label">คะแนนรีวิวเฉลี่ย</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mission & Vision Section */}
      <section className="about-section" style={{ padding: "32px 0 48px 0" }}>
        <div className="about-section-header">
          <span
            style={{
              background: "#eef6ee",
              color: "#2e7d32",
              fontSize: "12px",
              fontWeight: 700,
              padding: "4px 14px",
              borderRadius: "999px",
              display: "inline-block",
              marginBottom: "10px"
            }}
          >
            OUR PURPOSE
          </span>
          <h2 className="about-section-title">
            พันธกิจและ<span>วิสัยทัศน์</span>ของเรา
          </h2>
          <p className="about-section-subtitle">
            ความตั้งใจจริงในการยกระดับมาตรฐานการอยู่อาศัย และสนับสนุนชุมชนท้องถิ่นจังหวัดเลยให้เติบโตอย่างยั่งยืน
          </p>
        </div>

        <div className="about-mv-grid">
          {/* Mission */}
          <div className="about-mv-card">
            <div className="about-mv-card-header">
              <div className="about-mv-icon-box">
                <i className="fa-solid fa-bullseye"></i>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#5b8e66", fontWeight: 700, textTransform: "uppercase" }}>
                  Our Mission
                </span>
                <h3>พันธกิจของเรา</h3>
              </div>
            </div>
            <p>
              "อยู่เลย เฮาส์" ก่อตั้งขึ้นด้วยความตั้งใจที่จะพัฒนาระบบค้นหาและจองที่พักในจังหวัดเลยให้มีความสะดวก รวดเร็ว
              และเข้าถึงง่ายสำหรับทุกคน ทั้งนักศึกษา มรภ.เลย, คนทำงาน และบุคคลทั่วไป
              เพื่อลดขั้นตอนความยุ่งยากในการตระเวนหาหอพัก ให้ทุกคนได้ห้องพักที่ปลอดภัย ถูกใจ และคุ้มค่าที่สุด
            </p>
          </div>

          {/* Vision */}
          <div className="about-mv-card">
            <div className="about-mv-card-header">
              <div className="about-mv-icon-box">
                <i className="fa-solid fa-eye"></i>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#5b8e66", fontWeight: 700, textTransform: "uppercase" }}>
                  Our Vision
                </span>
                <h3>วิสัยทัศน์ของเรา</h3>
              </div>
            </div>
            <p>
              เรามุ่งมั่นที่จะเป็นศูนย์กลางข้อมูลและแพลตฟอร์มบริหารจัดการที่พักอาศัยอันดับหนึ่งในจังหวัดเลย
              ที่ช่วยขับเคลื่อนเศรษฐกิจท้องถิ่น และยกระดับคุณภาพชีวิตของผู้อยู่อาศัยและเจ้าของหอพัก
              ผ่านเทคโนโลยีที่ทันสมัย โปร่งใส และสร้างความไว้วางใจร่วมกันในระยะยาว
            </p>
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us Section */}
      <section style={{ backgroundColor: "#ffffff", padding: "32px 0 48px 0" }}>
        <div className="about-section-header">
          <span
            style={{
              background: "#eef6ee",
              color: "#2e7d32",
              fontSize: "12px",
              fontWeight: 700,
              padding: "4px 14px",
              borderRadius: "999px",
              display: "inline-block",
              marginBottom: "10px"
            }}
          >
            HIGHLIGHTS
          </span>
          <h2 className="about-section-title">
            ทำไมต้องเลือก <span>{siteName}</span>
          </h2>
          <p className="about-section-subtitle">
            จุดเด่นและบริการที่ออกแบบมาเพื่อตอบสนองการค้นหาที่พักของคุณได้อย่างสมบูรณ์แบบ
          </p>
        </div>

        <div className="about-features-grid">
          <div className="about-feature-card">
            <div className="about-feature-icon">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <h4 className="about-feature-title">ค้นหาง่าย ตรงใจ</h4>
            <p className="about-feature-desc">
              ระบบค้นหาพร้อมตัวกรองละเอียด ค้นหาตามทำเล โซน มรภ.เลย ราคา และสิ่งอำนวยความสะดวกได้ในคลิกเดียว
            </p>
          </div>

          <div className="about-feature-card">
            <div className="about-feature-icon">
              <i className="fa-solid fa-camera"></i>
            </div>
            <h4 className="about-feature-title">ภาพจริง ข้อมูลครบ</h4>
            <p className="about-feature-desc">
              รูปถ่ายสถานที่จริง ค่าน้ำ ค่าไฟ รายละเอียดห้องพัก และพิกัดแผนที่ชัดเจน หมดปัญหาข้อมูลไม่ตรงปก
            </p>
          </div>

          <div className="about-feature-card">
            <div className="about-feature-icon">
              <i className="fa-solid fa-star"></i>
            </div>
            <h4 className="about-feature-title">รีวิวจากผู้เช่าจริง</h4>
            <p className="about-feature-desc">
              ความคิดเห็นและคะแนนดาวจากผู้เข้าพักตัวจริง ช่วยเพิ่มความมั่นใจในการเลือกห้องพักที่เหมาะกับคุณ
            </p>
          </div>

          <div className="about-feature-card">
            <div className="about-feature-icon">
              <i className="fa-solid fa-comments"></i>
            </div>
            <h4 className="about-feature-title">ติดต่อ & จองสะดวกรวดเร็ว</h4>
            <p className="about-feature-desc">
              ส่งคำขอจองห้องพักและแชทสอบถามข้อมูลกับเจ้าของหอพักได้โดยตรงผ่านระบบที่สะดวกและปลอดภัย
            </p>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section className="about-section" style={{ padding: "32px 0 48px 0" }}>
        <div className="about-section-header">
          <span
            style={{
              background: "#eef6ee",
              color: "#2e7d32",
              fontSize: "12px",
              fontWeight: 700,
              padding: "4px 14px",
              borderRadius: "999px",
              display: "inline-block",
              marginBottom: "10px"
            }}
          >
            HOW IT WORKS
          </span>
          <h2 className="about-section-title">
            วิธีใช้งาน<span>ง่ายๆ ใน 3 ขั้นตอน</span>
          </h2>
          <p className="about-section-subtitle">
            เริ่มต้นค้นหาและได้ห้องพักที่ถูกใจได้ในเวลาเพียงไม่กี่นาที
          </p>
        </div>

        <div className="about-steps-grid">
          {/* Step 1 */}
          <div className="about-step-card">
            <div className="about-step-badge">01</div>
            <div className="about-step-icon">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <h4 className="about-step-title">ค้นหาหอพัก</h4>
            <p className="about-step-desc">
              ระบุทำเลที่ต้องการ ช่วงราคา และสิ่งอำนวยความสะดวกที่ต้องการ เพื่อค้นหาหอพักที่ตรงใจที่สุด
            </p>
          </div>

          {/* Step 2 */}
          <div className="about-step-card">
            <div className="about-step-badge">02</div>
            <div className="about-step-icon">
              <i className="fa-solid fa-scale-balanced"></i>
            </div>
            <h4 className="about-step-title">เปรียบเทียบ & ดูรีวิว</h4>
            <p className="about-step-desc">
              ดูรูปถ่ายห้องพัก สิ่งอำนวยความสะดวก เปรียบเทียบราคา และอ่านรีวิวจากผู้เช่าจริงเพื่อประกอบการตัดสินใจ
            </p>
          </div>

          {/* Step 3 */}
          <div className="about-step-card">
            <div className="about-step-badge">03</div>
            <div className="about-step-icon">
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <h4 className="about-step-title">ส่งคำขอจองห้องพัก</h4>
            <p className="about-step-desc">
              กดส่งคำขอจองห้องพัก ระบุวันที่ต้องการเข้าพัก และพูดคุยกับเจ้าของหอพักได้ทันทีผ่านระบบแชท
            </p>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="about-cta-section" style={{ marginTop: "16px" }}>
        <div className="about-cta-card">
          <div className="about-cta-content">
            <h2>พร้อมเริ่มต้นค้นหาที่พักในฝันของคุณแล้วหรือยัง?</h2>
            <p>
              เลือกดูหอพักคุณภาพในจังหวัดเลย หรือร่วมเป็นพาร์ทเนอร์ลงประกาศหอพักฟรีกับเราได้ทันที
            </p>
          </div>

          <div className="about-cta-buttons">
            <Link to="/dorms" className="about-cta-btn-white">
              <i className="fa-solid fa-magnifying-glass"></i>
              <span>ค้นหาหอพักเลย</span>
            </Link>

            <Link to="/register" className="about-cta-btn-ghost">
              <i className="fa-solid fa-building"></i>
              <span>ลงทะเบียนเจ้าของหอพัก</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

