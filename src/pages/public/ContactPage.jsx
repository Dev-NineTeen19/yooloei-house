import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicMobileHeader from "../../components/common/PublicMobileHeader";
import { useAuth } from "../../context/AuthContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { api } from "../../services/apiClient";
import { showAlert } from "../../context/ModalContext";

export default function ContactPage() {
  const { currentUser, userData, userRole } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    if (userRole === "admin") {
      showAlert({
        title: "สำหรับผู้ดูแลระบบ",
        heading: "คุณกำลังเข้าสู่ระบบในฐานะแอดมิน",
        message: "ผู้ดูแลระบบสามารถเข้าดูและจัดการข้อความจากผู้ใช้งานผ่านเมนูแชทได้โดยตรงครับ",
        type: "info"
      }).then(() => {
        navigate("/admin/dashboard", { replace: true });
      });
    }
  }, [userRole, navigate]);

  useEffect(() => {
    if (userData || currentUser) {
      setName(
        userData?.fullName ||
        `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim() ||
        userData?.username ||
        ""
      );
      setEmail(userData?.email || currentUser?.email || "");
      setPhone(userData?.phone || "");
    }
  }, [userData, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userRole === "admin") {
      showAlert({
        title: "แจ้งเตือน",
        heading: "ไม่สามารถส่งข้อความได้",
        message: "ผู้ดูแลระบบไม่สามารถส่งข้อความติดต่อตนเองได้ครับ",
        type: "warning"
      });
      return;
    }
    if (!message.trim()) return;

    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      const data = await api.post("/contact", { name, email, phone, message });
      setSubmitted(true);
      setStatus({
        type: "success",
        text: data.message || "ส่งข้อความถึงผู้ดูแลระบบเรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุดครับ"
      });
      setMessage("");
    } catch (err) {
      console.error("Submit contact error:", err);
      setStatus({
        type: "error",
        text: err.data?.error || err.message || "เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้งครับ"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setStatus({ type: "", text: "" });
    setMessage("");
  };

  const contactPhone = settings?.contactPhone || "042-123-456";
  const contactEmail = settings?.adminEmail || "yooloeihouse@gmail.com";
  const rawPhone = contactPhone.replace(/[^0-9]/g, "");

  return (
    <div className="contact-page-wrapper">
      <PublicMobileHeader
        title="ติดต่อเรา"
      />
      {/* 1. Hero Section */}
      <section className="contact-hero-section">
        <h1 className="contact-hero-title">
          มีข้อสงสัย หรือต้องการ<span>คำแนะนำ?</span>
        </h1>
        <p className="contact-hero-subtitle">
          ทีมงาน {settings?.siteName || "อยู่เลย เฮาส์"} พร้อมดูแล ให้คำปรึกษาเรื่องหอพัก
          และรับฟังทุกข้อเสนอแนะเพื่อประสบการณ์การค้นหาที่ดียิ่งขึ้นสำหรับคุณ
        </p>
      </section>

      {/* 2. Interactive Channels Grid */}
      <div className="contact-channels-grid">
        {/* Phone */}
        <div className="contact-channel-card">
          <div className="contact-channel-icon-wrap phone">
            <i className="fa-solid fa-phone"></i>
          </div>
          <div className="contact-channel-label">โทรศัพท์สายตรง</div>
          <div className="contact-channel-value">{contactPhone}</div>
          <div className="contact-channel-desc">จันทร์ - เสาร์ (08:30 - 18:00 น.)</div>
          <a href={`tel:${rawPhone}`} className="contact-channel-btn">
            <span>โทรออกทันที</span>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "11px" }}></i>
          </a>
        </div>

        {/* Email */}
        <div className="contact-channel-card">
          <div className="contact-channel-icon-wrap email">
            <i className="fa-solid fa-envelope"></i>
          </div>
          <div className="contact-channel-label">อีเมลติดต่อ</div>
          <div className="contact-channel-value" style={{ fontSize: "14.5px" }}>{contactEmail}</div>
          <div className="contact-channel-desc">ตอบกลับข้อความภายใน 24 ชม.</div>
          <a href={`mailto:${contactEmail}`} className="contact-channel-btn">
            <span>ส่งอีเมลหาเรา</span>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "11px" }}></i>
          </a>
        </div>

        {/* LINE Official */}
        <div className="contact-channel-card">
          <div className="contact-channel-icon-wrap line">
            <i className="fa-brands fa-line" style={{ fontSize: "28px" }}></i>
          </div>
          <div className="contact-channel-label">LINE Official Account</div>
          <div className="contact-channel-value">@yooloei</div>
          <div className="contact-channel-desc">สอบถามด่วน แชทสะดวกกับทีมงาน</div>
          <a
            href="https://line.me"
            target="_blank"
            rel="noreferrer"
            className="contact-channel-btn"
          >
            <span>เพิ่มเพื่อน LINE</span>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "11px" }}></i>
          </a>
        </div>

        {/* Location */}
        <div className="contact-channel-card">
          <div className="contact-channel-icon-wrap location">
            <i className="fa-solid fa-location-dot"></i>
          </div>
          <div className="contact-channel-label">ที่ตั้งสำนักงาน</div>
          <div className="contact-channel-value" style={{ fontSize: "14px" }}>อ.เมือง จ.เลย 42000</div>
          <div className="contact-channel-desc">234 ม.11 ต.เมือง อ.เมือง จ.เลย</div>
          <a
            href="https://maps.google.com/?q=Loei+Thailand"
            target="_blank"
            rel="noreferrer"
            className="contact-channel-btn"
          >
            <span>ดูบน Google Maps</span>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "11px" }}></i>
          </a>
        </div>
      </div>

      {/* 3. Main Form & Side Info Section */}
      <div className="contact-main-grid">
        {/* Left Side Column: Extra Info & Banner */}
        <div className="contact-side-col">
          {/* Dorm Owner Special Banner */}
          <div className="contact-owner-banner">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span
                style={{
                  background: "#2e7d32",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "999px"
                }}
              >
                สำหรับเจ้าของหอพัก
              </span>
            </div>
            <h4>สนใจลงประกาศหอพักของคุณ?</h4>
            <p>
              เพิ่มโอกาสให้ผู้เช่า นักศึกษา และคนทำงานพบหอพักของคุณได้ง่ายขึ้น
              ลงประกาศฟรี ไม่มีค่าบริการเริ่มต้น!
            </p>
            <Link to="/register" className="contact-owner-btn">
              <span>สมัครเป็นเจ้าของหอพัก</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          {/* Service Hours & Security Card */}
          <div className="contact-info-card">
            <h3 className="contact-info-card-title">
              <i className="fa-regular fa-clock"></i>
              <span>เวลาทำการ & การให้บริการ</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px", color: "#475569" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <span>จันทร์ - ศุกร์:</span>
                <strong style={{ color: "#1e293b" }}>08:30 - 18:00 น.</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <span>วันเสาร์:</span>
                <strong style={{ color: "#1e293b" }}>09:00 - 17:00 น.</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>วันอาทิตย์และวันหยุดนักขัตฤกษ์:</span>
                <span style={{ color: "#5b8e66", fontWeight: 600 }}>ข้อความออนไลน์ตลอด 24 ชม.</span>
              </div>
            </div>
          </div>

          {/* Social Channels Card */}
          <div className="contact-info-card">
            <h3 className="contact-info-card-title">
              <i className="fa-solid fa-share-nodes"></i>
              <span>ติดตามเราบนโซเชียลมีเดีย</span>
            </h3>
            <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 14px 0" }}>
              ติดตามข่าวสาร หอพักใหม่ โปรโมชั่น และอัปเดตต่างๆ ได้ที่
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a
                href="#facebook"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  textDecoration: "none",
                  transition: "transform 0.15s ease"
                }}
                title="Facebook"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a
                href="#line"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "#f0fdf4",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  textDecoration: "none",
                  transition: "transform 0.15s ease"
                }}
                title="Line"
              >
                <i className="fa-brands fa-line"></i>
              </a>
              <a
                href="#instagram"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "#fdf2f8",
                  color: "#db2777",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  textDecoration: "none",
                  transition: "transform 0.15s ease"
                }}
                title="Instagram"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a
                href={`mailto:${contactEmail}`}
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  textDecoration: "none",
                  transition: "transform 0.15s ease"
                }}
                title="Email"
              >
                <i className="fa-solid fa-envelope"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Right Side Column: Modern Message Form */}
        <div className="contact-form-card">
          <div className="contact-form-header">
            <h2 className="contact-form-title">
              <i className="fa-solid fa-paper-plane"></i>
              <span>ส่งข้อความถึงทีมงาน</span>
            </h2>
            <p className="contact-form-subtitle">
              กรอกข้อมูลและข้อความของคุณด้านล่าง ทีมงานจะได้รับและติดต่อกลับอย่างรวดเร็วครับ
            </p>
          </div>

          {/* Form Status Messages */}
          {status.text && !submitted && (
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "12px",
                marginBottom: "20px",
                fontSize: "14px",
                backgroundColor: status.type === "success" ? "#d1fae5" : "#fee2e2",
                color: status.type === "success" ? "#065f46" : "#991b1b",
                border: `1px solid ${status.type === "success" ? "#a7f3d0" : "#fca5a5"}`,
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}
            >
              <i className={status.type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-triangle-exclamation"}></i>
              <span>{status.text}</span>
            </div>
          )}

          {submitted ? (
            /* Success State Inside Card */
            <div className="contact-success-state">
              <div className="contact-success-icon-wrap">
                <i className="fa-solid fa-check"></i>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px 0" }}>
                ส่งข้อความสำเร็จแล้ว!
              </h3>
              <p style={{ color: "#64748b", fontSize: "14.5px", margin: "0 0 24px 0", lineHeight: 1.6 }}>
                ขอบคุณที่ติดต่อ {settings?.siteName || "อยู่เลย เฮาส์"} ครับ<br />
                ทีมงานได้รับข้อความของคุณเรียบร้อยแล้ว และจะติดต่อกลับไปยังอีเมลหรือเบอร์โทรศัพท์โดยเร็วที่สุด
              </p>
              <button
                type="button"
                onClick={handleResetForm}
                style={{
                  background: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #e2e8f0",
                  padding: "10px 22px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <i className="fa-solid fa-rotate-left"></i>
                <span>ส่งข้อความอื่นเพิ่มเติม</span>
              </button>
            </div>
          ) : (
            /* Form Fields */
            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="contact-input-group">
                <label className="contact-input-label">
                  ชื่อ-นามสกุล / ผู้ติดต่อ <span className="req">*</span>
                </label>
                <div className="contact-input-wrapper">
                  <input
                    type="text"
                    placeholder="กรอกชื่อของคุณ"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="contact-input-field"
                  />
                  <i className="fa-solid fa-user contact-input-icon"></i>
                </div>
              </div>

              {/* Email */}
              <div className="contact-input-group">
                <label className="contact-input-label">
                  อีเมลติดต่อกลับ <span className="req">*</span>
                </label>
                <div className="contact-input-wrapper">
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="contact-input-field"
                  />
                  <i className="fa-solid fa-envelope contact-input-icon"></i>
                </div>
              </div>

              {/* Phone */}
              <div className="contact-input-group">
                <label className="contact-input-label">
                  เบอร์โทรศัพท์ (ถ้ามี)
                </label>
                <div className="contact-input-wrapper">
                  <input
                    type="tel"
                    placeholder="08X-XXX-XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="contact-input-field"
                  />
                  <i className="fa-solid fa-phone contact-input-icon"></i>
                </div>
              </div>

              {/* Message */}
              <div className="contact-input-group">
                <label className="contact-input-label">
                  ข้อความหรือคำถามที่ต้องการติดต่อ <span className="req">*</span>
                </label>
                <div className="contact-input-wrapper">
                  <textarea
                    rows={4}
                    placeholder="พิมพ์รายละเอียดที่ต้องการสอบถาม แจ้งปัญหา หรือข้อเสนอแนะ..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="contact-textarea-field"
                    style={{ resize: "none" }}
                  ></textarea>
                  <i className="fa-solid fa-comment-dots contact-input-icon" style={{ top: "14px" }}></i>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || userRole === "admin"}
                className="contact-submit-btn"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>กำลังส่งข้อความ...</span>
                  </>
                ) : userRole === "admin" ? (
                  <span>ผู้ดูแลระบบไม่สามารถส่งข้อความนี้ได้</span>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i>
                    <span>ส่งข้อความถึงทีมงาน</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 4. Frequently Asked Questions (FAQ) Section */}
      <section className="contact-faq-section">
        <div className="contact-faq-header">
          <span
            style={{
              background: "#eef6ee",
              color: "#2e7d32",
              fontSize: "12px",
              fontWeight: 700,
              padding: "3px 12px",
              borderRadius: "999px",
              display: "inline-block",
              marginBottom: "8px"
            }}
          >
            FAQ
          </span>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1e293b", margin: "0 0 6px 0" }}>
            คำถามที่พบบ่อยเกี่ยวกับการติดต่อ
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            คำตอบสำหรับข้อสงสัยเบื้องต้นที่คุณอาจต้องการทราบทันที
          </p>
        </div>

        <div className="contact-faq-grid">
          <div className="contact-faq-card">
            <h3 className="contact-faq-q">
              <i className="fa-solid fa-circle-question"></i>
              <span>ติดต่อเจ้าของหอพักได้โดยตรงอย่างไร?</span>
            </h3>
            <p className="contact-faq-a">
              ท่านสามารถกดเข้าไปที่หน้ารายละเอียดของหอพักแต่ละแห่ง จะมีเบอร์โทรศัพท์และช่องทางติดต่อของเจ้าของหอพักระบุไว้ชัดเจน หรือสามารถกดจองห้องพักผ่านระบบได้ทันทีครับ
            </p>
          </div>

          <div className="contact-faq-card">
            <h3 className="contact-faq-q">
              <i className="fa-solid fa-circle-question"></i>
              <span>เจ้าของหอพักลงทะเบียนมีค่าใช้จ่ายหรือไม่?</span>
            </h3>
            <p className="contact-faq-a">
              ไม่มีค่าใช้จ่าย! แพลตฟอร์มของเราเปิดให้เจ้าของหอพักในจังหวัดเลยสามารถลงทะเบียนและเพิ่มข้อมูลหอพักเพื่อโปรโมทได้ฟรี ไม่มีค่าบริการแรกเข้าครับ
            </p>
          </div>

          <div className="contact-faq-card">
            <h3 className="contact-faq-q">
              <i className="fa-solid fa-circle-question"></i>
              <span>ส่งข้อความแล้วจะได้รับการตอบกลับเมื่อใด?</span>
            </h3>
            <p className="contact-faq-a">
              ทีมงานผู้ดูแลระบบจะตรวจสอบข้อความและตอบกลับผ่านทางอีเมลหรือเบอร์โทรศัพท์ที่ท่านระบุไว้ภายใน 24 ชั่วโมงในวันทำการครับ
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
