import { useState, useEffect } from "react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { api } from "../../services/apiClient";
import { showConfirm, showAlert } from "../../context/ModalContext";
import CustomSelect from "../../components/common/CustomSelect";

export default function AdminSettings() {
  const { settings, updateSettings, loading: settingsLoading } = useSiteSettings();

  const [siteName, setSiteName] = useState("");
  const [siteNameEn, setSiteNameEn] = useState("");
  const [siteLogo, setSiteLogo] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [autoApproveDorms, setAutoApproveDorms] = useState("manual");

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertStatus, setAlertStatus] = useState({ type: "", text: "" });

  const [heroBanners, setHeroBanners] = useState([]);
  const [uploadingBannerIndex, setUploadingBannerIndex] = useState(null);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || "อยู่เลย เฮาส์");
      setSiteNameEn(settings.siteNameEn || "YOOLOEI HOUSE");
      setSiteLogo(settings.siteLogo || "/images/logo.png");
      setAdminEmail(settings.adminEmail || "admin@yooloei.com");
      setContactPhone(settings.contactPhone || "042-123-456");
      setAutoApproveDorms(settings.autoApproveDorms || "manual");
      setHeroBanners(
        settings.heroBanners && settings.heroBanners.length > 0
          ? settings.heroBanners
          : [
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
            ]
      );
    }
  }, [settings]);

  // Handle Banner Slide Actions
  const handleAddSlide = () => {
    const newSlide = {
      id: `banner-${Date.now()}`,
      imageUrl: "/images/banner.jpg",
      title: "หอพักใหม่น่าอยู่",
      title2: "โปรโมชั่นพิเศษ",
      desc: "ค้นหาและจองห้องพักราคาพิเศษได้ก่อนใคร",
      linkUrl: "/dorms",
      buttonText: "ดูรายละเอียด"
    };
    setHeroBanners((prev) => [...prev, newSlide]);
  };

  const handleRemoveSlide = async (index) => {
    if (heroBanners.length <= 1) {
      await showAlert({
        title: "แจ้งเตือน",
        heading: "ไม่สามารถลบได้",
        message: "ระบบจำเป็นต้องมีสไลด์แบนเนอร์อย่างน้อย 1 สไลด์ครับ",
        type: "warning"
      });
      return;
    }
    const isConfirmed = await showConfirm({
      title: "ลบสไลด์แบนเนอร์",
      heading: `ยืนยันการลบสไลด์ที่ ${index + 1} ใช่หรือไม่?`,
      confirmText: "ลบสไลด์",
      cancelText: "ยกเลิก",
      type: "danger"
    });
    if (!isConfirmed) return;
    setHeroBanners((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveSlide = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= heroBanners.length) return;
    const updated = [...heroBanners];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setHeroBanners(updated);
  };

  const handleUpdateSlideField = (index, field, value) => {
    setHeroBanners((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleUploadBannerImage = async (index, file) => {
    if (!file) return;
    setUploadingBannerIndex(index);
    try {
      const data = await api.upload(file);
      if (data.url) {
        handleUpdateSlideField(index, "imageUrl", data.url);
      }
    } catch (err) {
      console.error("Banner upload error:", err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถอัปโหลดรูปภาพได้",
        message: err.message || "",
        type: "danger"
      });
    } finally {
      setUploadingBannerIndex(null);
    }
  };

  // Handle Logo Upload File
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    setAlertStatus({ type: "", text: "" });

    try {
      const data = await api.upload(file);
      if (data.url) {
        setSiteLogo(data.url);
        setAlertStatus({ type: "success", text: "อัปโหลดรูปโลโก้ใหม่สำเร็จแล้ว" });
      }
    } catch (err) {
      console.error("Logo upload error:", err);
      setAlertStatus({ type: "error", text: "อัปโหลดรูปโลโก้ไม่สำเร็จ: " + (err.message || "") });
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle Save All Settings
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isConfirmed = await showConfirm({
      title: "บันทึกการตั้งค่าระบบ",
      heading: "ยืนยันการบันทึกการตั้งค่าระบบใช่หรือไม่?",
      message: "การเปลี่ยนแปลงจะมีผลต่อการแสดงผลทั่วทั้งเว็บไซต์ทันที",
      confirmText: "บันทึกการตั้งค่า",
      cancelText: "ยกเลิก",
      type: "warning"
    });
    if (!isConfirmed) return;

    setSaving(true);
    setAlertStatus({ type: "", text: "" });

    try {
      await updateSettings({
        siteName,
        siteNameEn,
        siteLogo,
        adminEmail,
        contactPhone,
        autoApproveDorms,
        heroBanners
      });
      setAlertStatus({ type: "success", text: "บันทึกการตั้งค่าระบบเรียบร้อยแล้ว!" });
      await showAlert({
        title: "สำเร็จ",
        heading: "บันทึกการตั้งค่าระบบเรียบร้อยแล้ว!",
        type: "success"
      });
    } catch (err) {
      console.error("Save settings error:", err);
      setAlertStatus({ type: "error", text: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า: " + (err.message || "") });
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถบันทึกการตั้งค่าได้",
        message: err.message || "",
        type: "danger"
      });
    } finally {
      setSaving(false);
    }
  };

  if (settingsLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "24px", marginBottom: "10px" }}></i>
        <p>กำลังโหลดข้อมูลการตั้งค่าระบบ...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", color: "#1e293b", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
          <i className="fa-solid fa-sliders" style={{ color: "#7da27c" }}></i> ตั้งค่าระบบ
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
          จัดการชื่อเว็บไซต์ รูปโลโก้ ข้อมูลติดต่อ และนโยบายระบบ (แอดมินสามารถเปลี่ยนได้ตลอดเวลา)
        </p>
      </div>

      {/* Real-time Live Preview Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          padding: "24px",
          marginBottom: "28px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          border: "2px dashed #7da27c"
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "14px" }}>
          <i className="fa-solid fa-eye" style={{ marginRight: "6px" }}></i> ตัวอย่างการแสดงผลจริง (Live Preview)
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 24px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
            gap: "14px"
          }}
        >
          <img
            src={siteLogo || "/images/logo.png"}
            alt="Live Logo Preview"
            style={{ width: "50px", height: "50px", objectFit: "contain", borderRadius: "8px" }}
            onError={(e) => { e.target.src = "/images/logo.png"; }}
          />
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
              {siteName || "อยู่เลย เฮาส์"}
            </h3>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>
              {siteNameEn || "YOOLOEI HOUSE"}
            </span>
          </div>
        </div>
      </div>

      {/* Alert Status Notification */}
      {alertStatus.text && (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: "10px",
            marginBottom: "24px",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: alertStatus.type === "success" ? "#d1fae5" : "#fee2e2",
            color: alertStatus.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${alertStatus.type === "success" ? "#a7f3d0" : "#fca5a5"}`
          }}
        >
          <i className={alertStatus.type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-triangle-exclamation"}></i>
          {alertStatus.text}
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit}>
        {/* Section 1: ชื่อและโลโก้เว็บไซต์ */}
        <div style={{ background: "#ffffff", borderRadius: "14px", padding: "28px", marginBottom: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="fa-solid fa-pen-nib" style={{ color: "#7da27c" }}></i> 1. ชื่อและโลโก้เว็บไซต์ (Branding & Logo)
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                ชื่อเว็บไซต์ (ภาษาไทย)
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="เช่น อยู่เลย เฮาส์"
                required
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                ชื่อเว็บไซต์ (ภาษาอังกฤษ / สโลแกน)
              </label>
              <input
                type="text"
                value={siteNameEn}
                onChange={(e) => setSiteNameEn(e.target.value)}
                placeholder="เช่น YOOLOEI HOUSE"
                required
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              />
            </div>
          </div>

          {/* Logo Customization */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
              โลโก้เว็บไซต์ (Website Logo Image)
            </label>

            <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "12px",
                  border: "2px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8fafc",
                  overflow: "hidden"
                }}
              >
                <img
                  src={siteLogo || "/images/logo.png"}
                  alt="Logo"
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }}
                  onError={(e) => { e.target.src = "/images/logo.png"; }}
                />
              </div>

              <div style={{ flex: 1, minWidth: "240px" }}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "center" }}>
                  <label
                    style={{
                      backgroundColor: "#7da27c",
                      color: "#fff",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: uploadingLogo ? "wait" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    {uploadingLogo ? "กำลังอัปโหลด..." : "อัปโหลดรูปโลโก้ใหม่"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      style={{ display: "none" }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setSiteLogo("/images/logo.png")}
                    style={{
                      background: "none",
                      border: "1px solid #cbd5e1",
                      color: "#64748b",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    <i className="fa-solid fa-rotate-left"></i> ใช้โลโก้เดิม
                  </button>
                </div>

                <input
                  type="text"
                  value={siteLogo}
                  onChange={(e) => setSiteLogo(e.target.value)}
                  placeholder="หรือวางลิงก์รูปภาพ URL (e.g. /images/logo.png)"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: ข้อมูลติดต่อ & การอนุมัติหอพัก */}
        <div style={{ background: "#ffffff", borderRadius: "14px", padding: "28px", marginBottom: "28px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="fa-solid fa-gears" style={{ color: "#7da27c" }}></i> 2. การติดต่อและเงื่อนไขระบบ
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                อีเมลติดต่อส่วนกลาง (แอดมิน)
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@yooloei.com"
                required
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                เบอร์โทรศัพท์ติดต่อส่วนกลาง
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="042-123-456"
                required
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                เงื่อนไขการอนุมัติหอพักใหม่ที่ถูกเพิ่มโดยเจ้าของหอ
              </label>
              <CustomSelect
                value={autoApproveDorms}
                onChange={setAutoApproveDorms}
                options={[
                  {
                    value: "manual",
                    label: "ตรวจสอบโดยแอดมินก่อนทุกครั้ง (แนะนำ - ปลอดภัยและถูกต้อง)",
                    icon: "fa-solid fa-user-shield"
                  },
                  {
                    value: "auto",
                    label: "อนุมัติทันทีอัตโนมัติ (Auto Approve)",
                    icon: "fa-solid fa-bolt"
                  }
                ]}
                placeholder="เลือกเงื่อนไขการอนุมัติ..."
              />
            </div>
          </div>
        </div>

        {/* Section 3: จัดการสไลด์แบนเนอร์หน้าแรก (Hero Banner Slider) */}
        <div style={{ background: "#ffffff", borderRadius: "14px", padding: "28px", marginBottom: "28px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-solid fa-images" style={{ color: "#7da27c" }}></i> 3. จัดการสไลด์แบนเนอร์หน้าแรก (Hero Banner Slider)
              </h3>
              <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>
                เพิ่ม แก้ไข หรืออัปโหลดรูปภาพสไลด์แบนเนอร์ที่จะแสดงผลด้านบนสุดของหน้าแรก (มีระบบสลับภาพอัตโนมัติ)
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddSlide}
              style={{
                backgroundColor: "#f0fdf4",
                color: "#166534",
                border: "1.5px solid #bbf7d0",
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.15s ease"
              }}
            >
              <i className="fa-solid fa-plus"></i> เพิ่มสไลด์ใหม่
            </button>
          </div>

          {/* List of Banner Slides */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {heroBanners.map((slide, idx) => (
              <div
                key={slide.id || idx}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "18px",
                  backgroundColor: "#f8fafc",
                  position: "relative"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ backgroundColor: "#5b8e66", color: "#ffffff", fontSize: "12px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px" }}>
                      สไลด์ที่ {idx + 1}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>
                      {slide.title || "สไลด์รูปภาพแบนเนอร์"}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(idx, -1)}
                      disabled={idx === 0}
                      title="เลื่อนขึ้น"
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        background: idx === 0 ? "#f1f5f9" : "#ffffff",
                        color: idx === 0 ? "#94a3b8" : "#334155",
                        cursor: idx === 0 ? "not-allowed" : "pointer",
                        fontSize: "12px"
                      }}
                    >
                      <i className="fa-solid fa-arrow-up"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(idx, 1)}
                      disabled={idx === heroBanners.length - 1}
                      title="เลื่อนลง"
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        background: idx === heroBanners.length - 1 ? "#f1f5f9" : "#ffffff",
                        color: idx === heroBanners.length - 1 ? "#94a3b8" : "#334155",
                        cursor: idx === heroBanners.length - 1 ? "not-allowed" : "pointer",
                        fontSize: "12px"
                      }}
                    >
                      <i className="fa-solid fa-arrow-down"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(idx)}
                      title="ลบสไลด์นี้"
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        border: "1px solid #fecaca",
                        background: "#fef2f2",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}
                    >
                      <i className="fa-solid fa-trash-can"></i> ลบ
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                  {/* Left: Image Preview & Upload */}
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                      รูปภาพแบนเนอร์:
                    </label>
                    <div
                      style={{
                        width: "100%",
                        height: "120px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#e2e8f0",
                        position: "relative",
                        marginBottom: "8px"
                      }}
                    >
                      <img
                        src={slide.imageUrl || "/images/banner.jpg"}
                        alt={`Slide ${idx + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.src = "/images/banner.jpg"; }}
                      />
                      {uploadingBannerIndex === idx && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            fontSize: "13px",
                            fontWeight: "600"
                          }}
                        >
                          <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "8px" }}></i> กำลังอัปโหลด...
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <label
                        style={{
                          flex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          padding: "7px 12px",
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "12.5px",
                          fontWeight: "600",
                          color: "#334155",
                          cursor: "pointer"
                        }}
                      >
                        <i className="fa-solid fa-upload" style={{ color: "#5b8e66" }}></i> อัปโหลดรูปใหม่
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleUploadBannerImage(idx, e.target.files[0])}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={slide.imageUrl || ""}
                      onChange={(e) => handleUpdateSlideField(idx, "imageUrl", e.target.value)}
                      placeholder="หรือระบุ URL รูปภาพ (e.g. /images/banner.jpg)"
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "12px",
                        marginTop: "6px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  {/* Right: Text Fields */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: 0, width: "100%" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", width: "100%" }}>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                          หัวข้อหลัก
                        </label>
                        <input
                          type="text"
                          value={slide.title || ""}
                          onChange={(e) => handleUpdateSlideField(idx, "title", e.target.value)}
                          placeholder="เช่น ค้นหาหอพักที่ใช่"
                          style={{ width: "100%", height: "40px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box", minWidth: 0 }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                          หัวข้อเน้นสีเขียว
                        </label>
                        <input
                          type="text"
                          value={slide.title2 || ""}
                          onChange={(e) => handleUpdateSlideField(idx, "title2", e.target.value)}
                          placeholder="เช่น ในจังหวัดเลย"
                          style={{ width: "100%", height: "40px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box", minWidth: 0 }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                      <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                        คำอธิบายสั้น
                      </label>
                      <input
                        type="text"
                        value={slide.desc || ""}
                        onChange={(e) => handleUpdateSlideField(idx, "desc", e.target.value)}
                        placeholder="เช่น ค้นหา เปรียบเทียบ และเลือกหอพักได้ง่าย..."
                        style={{ width: "100%", height: "40px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box", minWidth: 0 }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", width: "100%" }}>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                          ข้อความบนปุ่ม
                        </label>
                        <input
                          type="text"
                          value={slide.buttonText || ""}
                          onChange={(e) => handleUpdateSlideField(idx, "buttonText", e.target.value)}
                          placeholder="เช่น ค้นหาหอพัก"
                          style={{ width: "100%", height: "40px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box", minWidth: 0 }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                          ลิงก์ปลายทาง (เมื่อคลิก)
                        </label>
                        <input
                          type="text"
                          value={slide.linkUrl || ""}
                          onChange={(e) => handleUpdateSlideField(idx, "linkUrl", e.target.value)}
                          placeholder="เช่น /dorms"
                          style={{ width: "100%", height: "40px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box", minWidth: 0 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Action Button */}
        <div style={{ width: "100%", marginTop: "20px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%",
              backgroundColor: "#7da27c",
              color: "#ffffff",
              border: "none",
              padding: "14px 24px",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: saving ? "wait" : "pointer",
              boxShadow: "0 2px 8px rgba(125, 162, 124, 0.25)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              opacity: saving ? 0.7 : 1,
              transition: "all 0.15s ease",
              boxSizing: "border-box"
            }}
          >
            {saving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> กำลังบันทึกการตั้งค่า...
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk"></i> บันทึกการตั้งค่าทั้งหมด
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
