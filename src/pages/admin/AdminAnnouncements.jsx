import { useState, useEffect, useMemo, useRef } from "react";
import {
  getAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  uploadAnnouncementImage
} from "../../services/announcementService";
import { showConfirm, showAlert } from "../../context/ModalContext";
import "../../styles/dashboard.css";

const PRESET_BADGES = [
  "ประชาสัมพันธ์",
  "ข่าวด่วน",
  "กิจกรรม",
  "โปรโมชั่น",
  "อัปเดตระบบ",
  "แจ้งเตือน"
];

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "scheduled" | "expired" | "inactive"
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);
  const [modalStatusOpen, setModalStatusOpen] = useState(false);
  const modalStatusRef = useRef(null);
  const [openInfoId, setOpenInfoId] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
      if (modalStatusRef.current && !modalStatusRef.current.contains(event.target)) {
        setModalStatusOpen(false);
      }
      if (!event.target.closest(".info-dropdown-container")) {
        setOpenInfoId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [badgeText, setBadgeText] = useState("ประชาสัมพันธ์");
  const [status, setStatus] = useState("active");
  const [layoutType, setLayoutType] = useState("auto"); // "auto" | "image" | "card"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formError, setFormError] = useState("");

  // Preview Modal
  const [previewItem, setPreviewItem] = useState(null);
  const [previewDevice, setPreviewDevice] = useState("desktop"); // "desktop" | "mobile"
  const [previewLayout, setPreviewLayout] = useState("image");

  // Fetch announcements
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getAdminAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error("Failed to load announcements:", err);
      showAlert("เกิดข้อผิดพลาดในการโหลดประกาศ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Compute item status: "active" | "scheduled" | "expired" | "inactive"
  const getItemStatus = (item) => {
    if (item.status === "inactive") return "inactive";
    const now = new Date();
    if (item.startDate && new Date(item.startDate) > now) return "scheduled";
    if (item.endDate && new Date(item.endDate) < now) return "expired";
    return "active";
  };

  const getStatusBadge = (item) => {
    const itemStatus = getItemStatus(item);
    switch (itemStatus) {
      case "active":
        return { label: "กำลังแสดงผล", bg: "#eef8ee", color: "#2e7d32", border: "#c8e6c9", icon: "fa-circle-check", statusClass: "approved" };
      case "scheduled":
        return { label: "รอเริ่มแสดง", bg: "#fff8e1", color: "#f57f17", border: "#ffe082", icon: "fa-clock", statusClass: "pending" };
      case "expired":
        return { label: "หมดอายุแล้ว", bg: "#ffebee", color: "#c62828", border: "#ffcdd2", icon: "fa-calendar-xmark", statusClass: "rejected" };
      case "inactive":
      default:
        return { label: "ปิดใช้งาน", bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1", icon: "fa-circle-xmark", statusClass: "inactive" };
    }
  };

  // Filtered List
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const matchesSearch =
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.badgeText && item.badgeText.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;
      const itemStatus = getItemStatus(item);
      return itemStatus === statusFilter;
    });
  }, [announcements, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    let active = 0;
    let scheduled = 0;
    let expired = 0;
    let inactive = 0;

    announcements.forEach((item) => {
      const s = getItemStatus(item);
      if (s === "active") active++;
      else if (s === "scheduled") scheduled++;
      else if (s === "expired") expired++;
      else if (s === "inactive") inactive++;
    });

    return { total: announcements.length, active, scheduled, expired, inactive };
  }, [announcements]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setImageUrl("");
    setLinkUrl("");
    setBadgeText("ประชาสัมพันธ์");
    setStatus("active");
    setLayoutType("auto");
    setStartDate("");
    setEndDate("");
    setFormError("");
    setModalStatusOpen(false);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setContent(item.content || "");
    setImageUrl(item.imageUrl || "");
    setLinkUrl(item.linkUrl || "");
    setBadgeText(item.badgeText || "ประชาสัมพันธ์");
    setStatus(item.status || "active");
    setLayoutType(item.layoutType || "auto");
    setStartDate(item.startDate ? item.startDate.slice(0, 16) : "");
    setEndDate(item.endDate ? item.endDate.slice(0, 16) : "");
    setFormError("");
    setModalStatusOpen(false);
    setShowModal(true);
  };

  const handleOpenPreview = (item) => {
    setPreviewItem(item);
    setPreviewLayout(item.layoutType === "card" ? "card" : "image");
    setPreviewDevice("desktop");
  };

  // Handle Image Upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("ขนาดไฟล์รูปภาพต้องไม่เกิน 5 MB");
      return;
    }

    setUploadingImage(true);
    setFormError("");
    try {
      const url = await uploadAnnouncementImage(file);
      setImageUrl(url);
    } catch (err) {
      console.error("Image upload failed:", err);
      setFormError("อัปโหลดรูปภาพล้มเหลว: " + err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim() && !content.trim() && !imageUrl.trim()) {
      setFormError("กรุณาระบุอย่างน้อย 1 รายการ: หัวข้อประกาศ, เนื้อหา, หรือรูปภาพ");
      return;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setFormError("วันเวลาเริ่มต้นต้องเกิดขึ้นก่อนวันเวลาสิ้นสุด");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl.trim(),
        badgeText: badgeText.trim() || "ประชาสัมพันธ์",
        status,
        layoutType,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null
      };

      if (editingId) {
        await updateAnnouncement(editingId, payload);
        await showAlert({
          title: "สำเร็จ",
          heading: "แก้ไขประกาศข่าวสารเรียบร้อยแล้ว",
          type: "success"
        });
      } else {
        await createAnnouncement(payload);
        await showAlert({
          title: "สำเร็จ",
          heading: "สร้างประกาศข่าวสารเรียบร้อยแล้ว",
          type: "success"
        });
      }

      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      console.error("Save announcement error:", err);
      setFormError("บันทึกไม่สำเร็จ: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle quick status
  const handleToggleStatus = async (item) => {
    const newStatus = item.status === "active" ? "inactive" : "active";
    const actionLabel = newStatus === "active" ? "เปิดใช้งานประกาศ" : "ปิดใช้งานประกาศ";
    const isConfirmed = await showConfirm({
      title: "เปลี่ยนสถานะประกาศ",
      heading: `คุณต้องการ "${actionLabel}" ใช่หรือไม่?`,
      confirmText: "ยืนยัน",
      cancelText: "ยกเลิก",
      type: newStatus === "active" ? "success" : "warning"
    });
    if (!isConfirmed) return;

    try {
      await updateAnnouncement(item.id, { status: newStatus });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, status: newStatus } : a))
      );
      await showAlert({
        title: "สำเร็จ",
        heading: `${actionLabel}เรียบร้อยแล้ว`,
        type: "success"
      });
    } catch (err) {
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถเปลี่ยนสถานะได้",
        message: err.message || "",
        type: "danger"
      });
    }
  };

  // Handle Delete
  const handleDelete = async (item) => {
    const isConfirmed = await showConfirm({
      title: "ลบประกาศข่าวสาร",
      heading: `คุณแน่ใจหรือไม่ว่าต้องการลบประกาศ "${item.title || "ประกาศรูปภาพ"}"?`,
      message: "ข้อมูลประกาศจะถูกลบออกจากระบบทันทีและจะไม่แสดงผลบนหน้าแรกอีกต่อไป",
      confirmText: "ลบประกาศ",
      cancelText: "ยกเลิก",
      type: "danger"
    });
    if (!isConfirmed) return;

    try {
      await deleteAnnouncement(item.id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== item.id));
      await showAlert({
        title: "สำเร็จ",
        heading: "ลบประกาศเรียบร้อยแล้ว",
        type: "success"
      });
    } catch (err) {
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถลบประกาศได้",
        message: err.message || "",
        type: "danger"
      });
    }
  };

  // Format date helper
  const formatDateTh = (dateStr) => {
    if (!dateStr) return "ไม่ระบุ";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  const statusOptions = [
    { key: "all", label: "ทั้งหมด", count: stats.total, icon: "fa-solid fa-bullhorn" },
    { key: "active", label: "กำลังแสดง", count: stats.active, icon: "fa-solid fa-circle-check" },
    { key: "scheduled", label: "รอเริ่ม", count: stats.scheduled, icon: "fa-solid fa-clock" },
    { key: "expired", label: "หมดอายุ", count: stats.expired, icon: "fa-solid fa-calendar-xmark" },
    { key: "inactive", label: "ปิดใช้งาน", count: stats.inactive, icon: "fa-solid fa-eye-slash" }
  ];
  const currentStatusOption = statusOptions.find((o) => o.key === statusFilter) || statusOptions[0];

  return (
    <div className="admin-announcements-page" style={{ paddingBottom: "40px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
            <i className="fa-solid fa-bullhorn" style={{ color: "#5b835a", marginRight: "10px" }}></i>
            ประกาศข่าวสารหน้าแรก (Homepage Announcements)
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
            โพสต์ข่าวประชาสัมพันธ์ โปรโมชั่น หรือป้ายประกาศหน้าแรก แสดงผลให้ผู้เช่า เจ้าของหอ และผู้เข้าชมทุกคนเห็น
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="btn-primary-action"
          style={{ padding: "9px 18px", fontSize: "14px" }}
        >
          <i className="fa-solid fa-plus"></i>
          <span>สร้างประกาศใหม่</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        <div
          onClick={() => setStatusFilter("all")}
          style={{
            backgroundColor: "#ffffff",
            padding: "16px 20px",
            borderRadius: "12px",
            border: statusFilter === "all" ? "2px solid #5b835a" : "1px solid #e2e8f0",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>ประกาศทั้งหมด</div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", marginTop: "4px" }}>
            {stats.total}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("active")}
          style={{
            backgroundColor: "#ffffff",
            padding: "16px 20px",
            borderRadius: "12px",
            border: statusFilter === "active" ? "2px solid #16a34a" : "1px solid #e2e8f0",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ fontSize: "13px", color: "#16a34a", fontWeight: "600" }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: "6px" }}></i>
            กำลังแสดงผล
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#166534", marginTop: "4px" }}>
            {stats.active}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("scheduled")}
          style={{
            backgroundColor: "#ffffff",
            padding: "16px 20px",
            borderRadius: "12px",
            border: statusFilter === "scheduled" ? "2px solid #ca8a04" : "1px solid #e2e8f0",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ fontSize: "13px", color: "#ca8a04", fontWeight: "600" }}>
            <i className="fa-solid fa-clock" style={{ marginRight: "6px" }}></i>
            รอเริ่มแสดง
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#854d0e", marginTop: "4px" }}>
            {stats.scheduled}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("expired")}
          style={{
            backgroundColor: "#ffffff",
            padding: "16px 20px",
            borderRadius: "12px",
            border: statusFilter === "expired" ? "2px solid #dc2626" : "1px solid #e2e8f0",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ fontSize: "13px", color: "#dc2626", fontWeight: "600" }}>
            <i className="fa-solid fa-calendar-xmark" style={{ marginRight: "6px" }}></i>
            หมดอายุแล้ว
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#991b1b", marginTop: "4px" }}>
            {stats.expired}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter("inactive")}
          style={{
            backgroundColor: "#ffffff",
            padding: "16px 20px",
            borderRadius: "12px",
            border: statusFilter === "inactive" ? "2px solid #64748b" : "1px solid #e2e8f0",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
            <i className="fa-solid fa-circle-xmark" style={{ marginRight: "6px" }}></i>
            ปิดใช้งาน
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#475569", marginTop: "4px" }}>
            {stats.inactive}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "7px 12px",
            gap: "8px",
            flex: 1,
            maxWidth: "340px",
            minWidth: "200px",
            boxSizing: "border-box"
          }}
        >
          <i className="fa-solid fa-magnifying-glass" style={{ color: "#94a3b8", fontSize: "12px" }}></i>
          <input
            type="text"
            placeholder="ค้นหาตามหัวข้อ, ข้อความ, ป้ายกำกับ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: "13px",
              fontFamily: "inherit",
              background: "transparent",
              color: "#334155"
            }}
          />
          {searchQuery && (
            <i
              className="fa-solid fa-xmark"
              onClick={() => setSearchQuery("")}
              style={{ color: "#94a3b8", cursor: "pointer", fontSize: "12px" }}
            ></i>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <div ref={statusDropdownRef} style={{ position: "relative", width: "190px" }}>
          <button
            type="button"
            onClick={() => setStatusDropdownOpen((prev) => !prev)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              padding: "7px 12px",
              background: "#ffffff",
              border: "1px solid",
              borderColor: statusDropdownOpen ? "#5b8e66" : "#e2e8f0",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#334155",
              cursor: "pointer",
              boxShadow: statusDropdownOpen ? "0 0 0 2px rgba(91, 142, 102, 0.15)" : "none",
              transition: "all 0.15s ease",
              boxSizing: "border-box"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, overflow: "hidden" }}>
              <i className={currentStatusOption.icon} style={{ color: "#5b8e66", fontSize: "13px", flexShrink: 0 }}></i>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentStatusOption.label}
                <span style={{ color: "#94a3b8", marginLeft: "4px", fontSize: "12px" }}>({currentStatusOption.count})</span>
              </span>
            </div>
            <i
              className="fa-solid fa-chevron-down"
              style={{
                fontSize: "10px",
                color: "#94a3b8",
                flexShrink: 0,
                transition: "transform 0.2s ease",
                transform: statusDropdownOpen ? "rotate(180deg)" : "none"
              }}
            ></i>
          </button>

          {statusDropdownOpen && (
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
              {statusOptions.map((opt) => {
                const isSelected = statusFilter === opt.key;
                return (
                  <div
                    key={opt.key}
                    onClick={() => {
                      setStatusFilter(opt.key);
                      setStatusDropdownOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? "#5b8e66" : "#334155",
                      background: isSelected ? "#f0f7f1" : "transparent",
                      cursor: "pointer",
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
                      <i className={opt.icon} style={{ color: isSelected ? "#5b8e66" : "#64748b", fontSize: "12px", width: "16px", textAlign: "center", flexShrink: 0 }}></i>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{opt.label}</span>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: isSelected ? "#5b8e66" : "#94a3b8",
                        fontWeight: 500,
                        marginLeft: "6px"
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

      {/* Main Content Card */}
      <div className="content-card" style={{ overflow: "visible" }}>
        <div className="content-card-body" style={{ padding: 0, overflow: "visible" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#7da27c" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "10px", fontSize: "20px" }}></i>
              <span>กำลังโหลดข้อมูลประกาศ...</span>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <i className="fa-solid fa-bullhorn" style={{ fontSize: "48px", color: "#cbd5e1", marginBottom: "16px" }}></i>
              <h3 style={{ color: "#334155", fontWeight: 700, fontSize: "18px" }}>
                {announcements.length === 0 ? "ยังไม่มีประกาศในระบบ" : "ไม่พบรายการประกาศที่ตรงกับเงื่อนไข"}
              </h3>
              <p style={{ color: "#64748b", marginTop: "8px", marginBottom: "20px", fontSize: "14px" }}>
                {announcements.length === 0
                  ? "เริ่มต้นสร้างประกาศข่าวสาร เพื่อให้ผู้เช่าและเจ้าของหอพักเห็นข่าวประชาสัมพันธ์ทันที"
                  : "ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองสถานะใหม่อีกครั้ง"}
              </p>
              {announcements.length === 0 && (
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="btn-primary-action"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <i className="fa-solid fa-plus"></i> สร้างประกาศแรกเลย
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="desktop-table-view table-responsive" style={{ overflow: "visible" }}>
                <table className="custom-table" style={{ width: "100%", minWidth: "880px" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "80px", whiteSpace: "nowrap" }}>รูปปก</th>
                      <th style={{ minWidth: "220px", whiteSpace: "nowrap" }}>ชื่อประกาศ / รายละเอียด</th>
                      <th style={{ width: "170px", textAlign: "center", whiteSpace: "nowrap" }}>ข้อมูลประกาศ</th>
                      <th style={{ width: "130px", whiteSpace: "nowrap" }}>สถานะ</th>
                      <th style={{ textAlign: "center", width: "310px", minWidth: "300px", whiteSpace: "nowrap" }}>การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAnnouncements.map((item, index) => {
                      const badge = getStatusBadge(item);
                      const isDropdownOpen = openInfoId === item.id;
                      const isLastRow = index >= filteredAnnouncements.length - 1 && filteredAnnouncements.length > 1;
                      return (
                        <tr
                          key={item.id}
                          style={{
                            position: "relative",
                            zIndex: isDropdownOpen ? 9999 : 1
                          }}
                        >
                          <td>
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title || "Announcement"}
                                style={{
                                  width: "70px",
                                  height: "50px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  border: "1px solid #e2e8f0"
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "70px",
                                  height: "50px",
                                  borderRadius: "8px",
                                  backgroundColor: "#f1f5f9",
                                  border: "1px solid #e2e8f0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#94a3b8"
                                }}
                              >
                                <i className="fa-solid fa-align-left" style={{ fontSize: "18px" }}></i>
                              </div>
                            )}
                          </td>
                          <td style={{ minWidth: "240px" }}>
                            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "14px", lineHeight: "1.4" }}>
                              {item.title || (
                                <span style={{ color: "#64748b", fontStyle: "italic" }}>
                                  (ประกาศแบบรูปภาพอย่างเดียว)
                                </span>
                              )}
                            </div>
                            {item.content && (
                              <div
                                style={{
                                  fontSize: "12.5px",
                                  color: "#64748b",
                                  marginTop: "4px",
                                  lineHeight: "1.4",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  maxWidth: "460px"
                                }}
                              >
                                {item.content}
                              </div>
                            )}
                            {item.linkUrl && (
                              <a
                                href={item.linkUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  fontSize: "12px",
                                  color: "#2e7d32",
                                  textDecoration: "none",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  marginTop: "4px"
                                }}
                              >
                                <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                <span>{item.linkUrl}</span>
                              </a>
                            )}
                          </td>
                          <td style={{ textAlign: "center", verticalAlign: "middle", position: "relative", zIndex: isDropdownOpen ? 10000 : "auto" }}>
                            <div className="info-dropdown-container" style={{ position: "relative", display: "inline-block", zIndex: isDropdownOpen ? 10001 : 1 }}>
                              <button
                                type="button"
                                onClick={() => setOpenInfoId(isDropdownOpen ? null : item.id)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "6px 12px",
                                  background: isDropdownOpen ? "#eef8ee" : "#ffffff",
                                  border: "1px solid",
                                  borderColor: isDropdownOpen ? "#7da27c" : "#cbd5e1",
                                  borderRadius: "10px",
                                  fontSize: "12.5px",
                                  fontWeight: 600,
                                  color: isDropdownOpen ? "#2e7d32" : "#1e293b",
                                  cursor: "pointer",
                                  boxShadow: isDropdownOpen ? "0 0 0 3px rgba(125, 162, 124, 0.15)" : "none",
                                  transition: "all 0.15s ease",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                <i className="fa-solid fa-layer-group" style={{ color: "#7da27c", fontSize: "12px" }}></i>
                                <span>{item.badgeText || "ข้อมูลประกาศ"}</span>
                                <i
                                  className="fa-solid fa-chevron-down"
                                  style={{
                                    fontSize: "10px",
                                    color: "#64748b",
                                    transform: isDropdownOpen ? "rotate(180deg)" : "none",
                                    transition: "transform 0.2s ease"
                                  }}
                                ></i>
                              </button>

                              {isDropdownOpen && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: isLastRow ? "auto" : "calc(100% + 6px)",
                                    bottom: isLastRow ? "calc(100% + 6px)" : "auto",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    width: "250px",
                                    background: "#ffffff",
                                    borderRadius: "12px",
                                    border: "1px solid #cbd5e1",
                                    boxShadow: "0 14px 35px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08)",
                                    zIndex: 99999,
                                    padding: "14px",
                                    textAlign: "left",
                                    boxSizing: "border-box"
                                  }}
                                >
                                  {/* 1. ป้ายกำกับ */}
                                  <div style={{ marginBottom: "10px" }}>
                                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "5px" }}>
                                      ป้ายกำกับ
                                    </div>
                                    <span
                                      style={{
                                        display: "inline-block",
                                        padding: "3px 10px",
                                        borderRadius: "999px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        backgroundColor: "#f1f5f9",
                                        color: "#334155",
                                        border: "1px solid #e2e8f0"
                                      }}
                                    >
                                      {item.badgeText || "ประชาสัมพันธ์"}
                                    </span>
                                  </div>

                                  {/* 2. รูปแบบ */}
                                  <div style={{ marginBottom: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "5px" }}>
                                      รูปแบบ
                                    </div>
                                    <span
                                      style={{
                                        fontSize: "12.5px",
                                        color: "#334155",
                                        fontWeight: 600,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px"
                                      }}
                                    >
                                      <i
                                        className={item.layout_type === "image_only" ? "fa-solid fa-image" : "fa-solid fa-newspaper"}
                                        style={{ color: item.layout_type === "image_only" ? "#8b5cf6" : "#2e7d32" }}
                                      ></i>
                                      {item.layout_type === "image_only" ? "สไตล์โปสเตอร์ (รูปเด่น)" : "การ์ดข่าว (มีข้อความ)"}
                                    </span>
                                  </div>

                                  {/* 3. ระยะเวลาแสดงผล */}
                                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "5px" }}>
                                      ระยะเวลาแสดงผล
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#475569" }}>
                                      {item.startDate || item.endDate ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                          <div>
                                            <span style={{ fontWeight: 600, color: "#334155" }}>เริ่ม: </span>
                                            {item.startDate ? formatDateTh(item.startDate) : "ทันที"}
                                          </div>
                                          <div>
                                            <span style={{ fontWeight: 600, color: "#334155" }}>สิ้นสุด: </span>
                                            {item.endDate ? formatDateTh(item.endDate) : "ไม่มีกำหนด"}
                                          </div>
                                        </div>
                                      ) : (
                                        <span style={{ color: "#64748b" }}>ตลอดเวลา (ไม่มีกำหนด)</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${badge.statusClass}`}
                              style={{
                                backgroundColor: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                            >
                              <i className={`fa-solid ${badge.icon}`}></i>
                              {badge.label}
                            </span>
                          </td>
                          <td style={{ textAlign: "center", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "5px",
                                flexWrap: "nowrap"
                              }}
                            >
                              {/* Preview Eye button */}
                              <button
                                type="button"
                                title="ดูตัวอย่างแบบ Pop-up"
                                onClick={() => handleOpenPreview(item)}
                                style={{
                                  backgroundColor: "#f8fafc",
                                  color: "#334155",
                                  border: "1px solid #cbd5e1",
                                  padding: "5px 8px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "4px",
                                  transition: "all 0.15s ease",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0
                                }}
                              >
                                <i className="fa-solid fa-eye"></i> ดูตัวอย่าง
                              </button>

                              {/* Toggle Active Switch */}
                              <button
                                type="button"
                                title={item.status === "active" ? "คลิกเพื่อปิดใช้งาน" : "คลิกเพื่อเปิดใช้งาน"}
                                onClick={() => handleToggleStatus(item)}
                                style={{
                                  backgroundColor: item.status === "active" ? "#fff8e1" : "#e8f5e9",
                                  color: item.status === "active" ? "#b45309" : "#2e7d32",
                                  border: item.status === "active" ? "1px solid #ffe082" : "1px solid #c8e6c9",
                                  padding: "5px 8px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "4px",
                                  transition: "all 0.15s ease",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0
                                }}
                              >
                                <i className="fa-solid fa-power-off"></i> {item.status === "active" ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                title="แก้ไขประกาศ"
                                onClick={() => handleOpenEditModal(item)}
                                style={{
                                  backgroundColor: "#eff6ff",
                                  color: "#2563eb",
                                  border: "1px solid #bfdbfe",
                                  padding: "5px 8px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "4px",
                                  transition: "all 0.15s ease",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0
                                }}
                              >
                                <i className="fa-solid fa-pen-to-square"></i> แก้ไข
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                title="ลบประกาศ"
                                onClick={() => handleDelete(item)}
                                style={{
                                  backgroundColor: "#fef2f2",
                                  color: "#dc2626",
                                  border: "1px solid #fecaca",
                                  padding: "5px 8px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "4px",
                                  transition: "all 0.15s ease",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0
                                }}
                              >
                                <i className="fa-solid fa-trash-can"></i> ลบ
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
                {filteredAnnouncements.map((item) => {
                  const badge = getStatusBadge(item);
                  return (
                    <div
                      key={item.id}
                      className="mobile-item-card"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #eef2ed",
                        borderRadius: "14px",
                        padding: "14px",
                        marginBottom: "12px",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)"
                      }}
                    >
                      {/* Top: Image & Header info */}
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title || "รูปภาพ"}
                            style={{
                              width: "72px",
                              height: "72px",
                              borderRadius: "10px",
                              objectFit: "cover",
                              border: "1px solid #e2e8f0",
                              flexShrink: 0
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "72px",
                              height: "72px",
                              borderRadius: "10px",
                              backgroundColor: "#f1f5f9",
                              border: "1px solid #e2e8f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#94a3b8",
                              flexShrink: 0
                            }}
                          >
                            <i className="fa-solid fa-align-left" style={{ fontSize: "24px" }}></i>
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "15px",
                              fontWeight: 700,
                              color: "#1e293b",
                              lineHeight: 1.3,
                              marginBottom: "4px"
                            }}
                          >
                            {item.title || <span style={{ color: "#64748b", fontStyle: "italic" }}>(ประกาศรูปภาพ)</span>}
                          </div>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                            <span
                              className={`status-badge ${badge.statusClass}`}
                              style={{
                                fontSize: "11px",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`
                              }}
                            >
                              <i className={`fa-solid ${badge.icon}`}></i> {badge.label}
                            </span>

                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#475569",
                                background: "#f1f5f9",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                border: "1px solid #e2e8f0"
                              }}
                            >
                              {item.badgeText || "ประชาสัมพันธ์"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content snippet */}
                      {item.content && (
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#64748b",
                            marginTop: "10px",
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {item.content}
                        </div>
                      )}

                      {/* Detail row */}
                      <div
                        style={{
                          background: "#f8fafc",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          marginTop: "10px",
                          fontSize: "12.5px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#64748b" }}>รูปแบบ:</span>
                          <span style={{ fontWeight: 600, color: "#334155" }}>
                            {item.layout_type === "image_only" ? "สไตล์โปสเตอร์ (รูปเด่น)" : "การ์ดข่าว (มีข้อความ)"}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#64748b" }}>ระยะเวลา:</span>
                          <span style={{ fontWeight: 600, color: "#334155", textAlign: "right" }}>
                            {item.startDate || item.endDate
                              ? `${item.startDate ? formatDateTh(item.startDate) : "ทันที"} - ${item.endDate ? formatDateTh(item.endDate) : "ไม่มีกำหนด"}`
                              : "ตลอดเวลา (ไม่มีกำหนด)"}
                          </span>
                        </div>
                        {item.linkUrl && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                            <span style={{ color: "#64748b", flexShrink: 0 }}>ลิงก์:</span>
                            <a
                              href={item.linkUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: "#2e7d32",
                                textDecoration: "none",
                                fontWeight: 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {item.linkUrl}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Mobile action buttons */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px",
                          marginTop: "12px",
                          borderTop: "1px solid #f1f5f9",
                          paddingTop: "10px"
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(item)}
                          style={{
                            backgroundColor: "#f8fafc",
                            color: "#334155",
                            border: "1px solid #cbd5e1",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px"
                          }}
                        >
                          <i className="fa-solid fa-eye"></i> ดูตัวอย่าง
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          style={{
                            backgroundColor: item.status === "active" ? "#fff8e1" : "#e8f5e9",
                            color: item.status === "active" ? "#b45309" : "#2e7d32",
                            border: item.status === "active" ? "1px solid #ffe082" : "1px solid #c8e6c9",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px"
                          }}
                        >
                          <i className="fa-solid fa-power-off"></i> {item.status === "active" ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          style={{
                            backgroundColor: "#eff6ff",
                            color: "#2563eb",
                            border: "1px solid #bfdbfe",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px"
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> แก้ไข
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          style={{
                            backgroundColor: "#fef2f2",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px"
                          }}
                        >
                          <i className="fa-solid fa-trash-can"></i> ลบ
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

      {/* ========================================================
               CREATE / EDIT ANNOUNCEMENT MODAL
      ======================================================== */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            boxSizing: "border-box"
          }}
          onClick={() => setShowModal(false)}
        >
          <style>{`
            .admin-announcement-modal,
            .admin-announcement-modal * {
              box-sizing: border-box !important;
            }
            .admin-announcement-modal input,
            .admin-announcement-modal textarea,
            .admin-announcement-modal select {
              box-sizing: border-box !important;
              width: 100% !important;
              max-width: 100% !important;
              display: block !important;
            }
            @media (max-width: 640px) {
              .admin-announcement-modal {
                padding: 18px 16px !important;
                width: 95vw !important;
                max-width: 95vw !important;
                border-radius: 14px !important;
              }
              .admin-announcement-modal h3 {
                font-size: 16px !important;
              }
              .admin-announcement-date-grid {
                grid-template-columns: 1fr !important;
              }
              .admin-announcement-layout-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>

          <div
            className="admin-announcement-modal"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
              padding: "24px 28px",
              boxSizing: "border-box"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "14px",
                marginBottom: "20px"
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                {editingId ? "แก้ไขประกาศข่าวสาร" : "สร้างประกาศข่าวสารใหม่"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                title="ปิดหน้าต่าง"
                style={{
                  border: "none",
                  backgroundColor: "#f1f5f9",
                  color: "#64748b",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "15px",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#fee2e2";
                  e.currentTarget.style.color = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.color = "#64748b";
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {formError && (
              <div
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#b91c1c",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxSizing: "border-box"
                }}
              >
                <i className="fa-solid fa-triangle-exclamation"></i>
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} style={{ width: "100%", boxSizing: "border-box" }}>
              {/* Badge Selection */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  ป้ายกำกับ / หมวดหมู่
                </label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                  {PRESET_BADGES.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBadgeText(b)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        border: badgeText === b ? "1.5px solid #5b835a" : "1px solid #cbd5e1",
                        backgroundColor: badgeText === b ? "#5b835a" : "#f8fafc",
                        color: badgeText === b ? "#ffffff" : "#475569",
                        transition: "all 0.15s ease",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="หรือพิมพ์ป้ายกำกับเอง เช่น ประกาศสำคัญ"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13.5px",
                    outline: "none"
                  }}
                />
              </div>

              {/* Title */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  หัวข้อประกาศ <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "400" }}>(เว้นว่างได้ ถ้าเป็นรูปภาพอย่างเดียว)</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น ยินดีต้อนรับสู่เปิดเทอมใหม่ พร้อมรับสิทธิพิเศษจองหอพัก!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              {/* Content */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  เนื้อหา / รายละเอียดประกาศ <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "400" }}>(เว้นว่างได้)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="ระบุข้อความข่าวสาร ประชาสัมพันธ์ หรือคำอธิบายเพิ่มเติม..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    resize: "vertical",
                    outline: "none",
                    lineHeight: "1.5"
                  }}
                />
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  รูปภาพประกอบ / แบนเนอร์ประกาศ
                </label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginBottom: "8px" }}>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      backgroundColor: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      cursor: uploadingImage ? "not-allowed" : "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#334155",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <i className={uploadingImage ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-cloud-arrow-up"}></i>
                    <span>{uploadingImage ? "กำลังอัปโหลด..." : "เลือกไฟล์รูปภาพ"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      style={{ display: "none" }}
                    />
                  </label>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    รองรับ JPG, PNG, WebP ขนาดไม่เกิน 5MB
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="หรือใส่ URL รูปภาพโดยตรง (เช่น /uploads/img-... หรือ https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />

                {imageUrl && (
                  <div
                    style={{
                      position: "relative",
                      marginTop: "10px",
                      display: "inline-block",
                      maxWidth: "100%"
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt="Preview"
                      style={{
                        maxHeight: "160px",
                        maxWidth: "100%",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        display: "block"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      title="ลบรูปภาพนี้"
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        backgroundColor: "rgba(0,0,0,0.65)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px"
                      }}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                )}
              </div>

              {/* Link URL */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  ลิงก์ปลายทาง <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "400" }}>(ถ้ามี ผู้ใช้คลิกเพื่อเปิดดูรายละเอียดได้)</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น /dorms หรือ https://line.me/..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
              </div>

              {/* Date & Time Schedule Card (ดีไซน์ใหม่ โมเดิร์น สวยงาม ใช้งานง่าย) */}
              <div
                style={{
                  marginBottom: "18px",
                  padding: "16px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                }}
              >
                {/* Section Header & Status Indicator */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "12px"
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#1e293b",
                      margin: 0
                    }}
                  >
                    <i className="fa-regular fa-clock" style={{ color: "#5b8e66" }}></i>
                    กำหนดช่วงเวลาแสดงประกาศ
                  </label>

                  {/* Status Badge */}
                  {!startDate && !endDate ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "3px 9px",
                        borderRadius: "20px",
                        backgroundColor: "#eef8ee",
                        color: "#166534",
                        border: "1px solid #bbf7d0"
                      }}
                    >
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#16a34a" }}></span>
                      แสดงตลอดเวลา
                    </span>
                  ) : (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "3px 9px",
                        borderRadius: "20px",
                        backgroundColor: "#eff6ff",
                        color: "#1d4ed8",
                        border: "1px solid #bfdbfe"
                      }}
                    >
                      <i className="fa-solid fa-calendar-check" style={{ fontSize: "10px" }}></i>
                      มีกำหนดเวลา
                    </span>
                  )}
                </div>

                {/* Quick Presets / Shortcuts */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginBottom: "14px"
                  }}
                >
                  <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "600" }}>ตั้งค่าด่วน:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    style={{
                      padding: "4px 10px",
                      fontSize: "11.5px",
                      fontWeight: "600",
                      borderRadius: "6px",
                      border: !startDate && !endDate ? "1px solid #5b8e66" : "1px solid #cbd5e1",
                      backgroundColor: !startDate && !endDate ? "#f0fdf4" : "#ffffff",
                      color: !startDate && !endDate ? "#166534" : "#475569",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <i className="fa-solid fa-infinity" style={{ marginRight: "4px", fontSize: "10px" }}></i>
                    แสดงตลอดเวลา
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const target = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                      const pad = (n) => String(n).padStart(2, "0");
                      setStartDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`);
                      setEndDate(`${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`);
                    }}
                    style={{
                      padding: "4px 10px",
                      fontSize: "11.5px",
                      fontWeight: "500",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#ffffff",
                      color: "#475569",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    + 7 วัน
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const target = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                      const pad = (n) => String(n).padStart(2, "0");
                      setStartDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`);
                      setEndDate(`${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`);
                    }}
                    style={{
                      padding: "4px 10px",
                      fontSize: "11.5px",
                      fontWeight: "500",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#ffffff",
                      color: "#475569",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    + 30 วัน
                  </button>
                  {(startDate || endDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                      }}
                      style={{
                        padding: "4px 9px",
                        fontSize: "11.5px",
                        fontWeight: "600",
                        borderRadius: "6px",
                        border: "1px solid #fecaca",
                        backgroundColor: "#fef2f2",
                        color: "#dc2626",
                        cursor: "pointer",
                        marginLeft: "auto",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <i className="fa-solid fa-rotate-left" style={{ marginRight: "4px", fontSize: "10px" }}></i>
                      รีเซ็ต
                    </button>
                  )}
                </div>

                {/* 2 Inputs Grid */}
                <div
                  className="admin-announcement-date-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px"
                  }}
                >
                  {/* Start Date */}
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                        <i className="fa-regular fa-calendar-plus" style={{ color: "#16a34a" }}></i>
                        วันและเวลาเริ่มต้น
                      </label>
                      {startDate && (
                        <button
                          type="button"
                          onClick={() => setStartDate("")}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            fontSize: "11px",
                            fontWeight: "600",
                            cursor: "pointer",
                            padding: "0 4px"
                          }}
                        >
                          ✕ ล้าง
                        </button>
                      )}
                    </div>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                        color: "#1e293b",
                        backgroundColor: "#f8fafc",
                        outline: "none",
                        fontFamily: "inherit",
                        transition: "all 0.15s ease",
                        boxSizing: "border-box"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#5b8e66";
                        e.target.style.backgroundColor = "#ffffff";
                        e.target.style.boxShadow = "0 0 0 3px rgba(91, 142, 102, 0.15)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#cbd5e1";
                        e.target.style.backgroundColor = "#f8fafc";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "5px", fontSize: "11px", color: "#94a3b8" }}>
                      <i className="fa-solid fa-circle-info" style={{ fontSize: "10px" }}></i>
                      <span>เว้นว่างไว้เพื่อเริ่มแสดงทันที</span>
                    </div>
                  </div>

                  {/* End Date */}
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                        <i className="fa-regular fa-calendar-xmark" style={{ color: "#d97706" }}></i>
                        วันและเวลาสิ้นสุด
                      </label>
                      {endDate && (
                        <button
                          type="button"
                          onClick={() => setEndDate("")}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            fontSize: "11px",
                            fontWeight: "600",
                            cursor: "pointer",
                            padding: "0 4px"
                          }}
                        >
                          ✕ ล้าง
                        </button>
                      )}
                    </div>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                        color: "#1e293b",
                        backgroundColor: "#f8fafc",
                        outline: "none",
                        fontFamily: "inherit",
                        transition: "all 0.15s ease",
                        boxSizing: "border-box"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#5b8e66";
                        e.target.style.backgroundColor = "#ffffff";
                        e.target.style.boxShadow = "0 0 0 3px rgba(91, 142, 102, 0.15)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#cbd5e1";
                        e.target.style.backgroundColor = "#f8fafc";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "5px", fontSize: "11px", color: "#94a3b8" }}>
                      <i className="fa-solid fa-circle-info" style={{ fontSize: "10px" }}></i>
                      <span>เว้นว่างไว้หากต้องการให้แสดงตลอดเวลา</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Popup Layout Style (2 แบบ + อัตโนมัติ) */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
                  รูปแบบการแสดงผล Pop-up บนหน้าแรก
                </label>
                <div
                  className="admin-announcement-layout-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "10px"
                  }}
                >
                  <div
                    onClick={() => setLayoutType("auto")}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: layoutType === "auto" ? "2px solid #5b835a" : "1px solid #cbd5e1",
                      backgroundColor: layoutType === "auto" ? "#f0fdf4" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ fontWeight: "700", fontSize: "13px", color: layoutType === "auto" ? "#166534" : "#334155" }}>
                      📌 ตรวจจับอัตโนมัติ
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "3px" }}>
                      เลือกให้อัตโนมัติตามเนื้อหา
                    </div>
                  </div>

                  <div
                    onClick={() => setLayoutType("image")}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: layoutType === "image" ? "2px solid #5b835a" : "1px solid #cbd5e1",
                      backgroundColor: layoutType === "image" ? "#f0fdf4" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ fontWeight: "700", fontSize: "13px", color: layoutType === "image" ? "#166534" : "#334155" }}>
                      🖼️ แบบที่ 1: โปสเตอร์
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "3px" }}>
                      รูปภาพเด่นเต็มตา ชัดเจน
                    </div>
                  </div>

                  <div
                    onClick={() => setLayoutType("card")}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: layoutType === "card" ? "2px solid #5b835a" : "1px solid #cbd5e1",
                      backgroundColor: layoutType === "card" ? "#f0fdf4" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ fontWeight: "700", fontSize: "13px", color: layoutType === "card" ? "#166534" : "#334155" }}>
                      📰 แบบที่ 2: การ์ดข่าว
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "3px" }}>
                      มีหัวข้อ รายละเอียด และรูป
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Custom Dropdown (Constrained to 100% width, never overflows card) */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  สถานะการเปิดใช้งาน
                </label>
                <div ref={modalStatusRef} style={{ position: "relative", width: "100%" }}>
                  <button
                    type="button"
                    onClick={() => setModalStatusOpen((prev) => !prev)}
                    style={{
                      width: "100%",
                      height: "42px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 14px",
                      backgroundColor: status === "active" ? "#f0fdf4" : "#ffffff",
                      border: "1px solid",
                      borderColor: modalStatusOpen ? "#5b8e66" : status === "active" ? "#86efac" : "#cbd5e1",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: "500",
                      color: status === "active" ? "#166534" : "#475569",
                      cursor: "pointer",
                      boxShadow: modalStatusOpen ? "0 0 0 2px rgba(91, 142, 102, 0.15)" : "none",
                      transition: "all 0.15s ease",
                      boxSizing: "border-box"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: status === "active" ? "#16a34a" : "#94a3b8"
                        }}
                      />
                      <span>{status === "active" ? "เปิดใช้งานทันที (Active)" : "ปิดใช้งาน / บันทึกร่าง (Inactive)"}</span>
                    </div>
                    <i
                      className="fa-solid fa-chevron-down"
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        transition: "transform 0.2s ease",
                        transform: modalStatusOpen ? "rotate(180deg)" : "none"
                      }}
                    ></i>
                  </button>

                  {modalStatusOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        width: "100%",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.06)",
                        zIndex: 100,
                        padding: "4px",
                        boxSizing: "border-box",
                        overflow: "hidden"
                      }}
                    >
                      <div
                        onClick={() => {
                          setStatus("active");
                          setModalStatusOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "9px 12px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: status === "active" ? "600" : "400",
                          color: status === "active" ? "#166534" : "#334155",
                          backgroundColor: status === "active" ? "#f0fdf4" : "transparent",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => {
                          if (status !== "active") e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (status !== "active") e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#16a34a" }} />
                          <span>เปิดใช้งานทันที (Active)</span>
                        </div>
                        {status === "active" && <i className="fa-solid fa-check" style={{ color: "#16a34a", fontSize: "12px" }}></i>}
                      </div>

                      <div
                        onClick={() => {
                          setStatus("inactive");
                          setModalStatusOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "9px 12px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: status === "inactive" ? "600" : "400",
                          color: status === "inactive" ? "#0f172a" : "#64748b",
                          backgroundColor: status === "inactive" ? "#f1f5f9" : "transparent",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => {
                          if (status !== "inactive") e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (status !== "inactive") e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#94a3b8" }} />
                          <span>ปิดใช้งาน / บันทึกร่าง (Inactive)</span>
                        </div>
                        {status === "inactive" && <i className="fa-solid fa-check" style={{ color: "#64748b", fontSize: "12px" }}></i>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "16px"
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#475569",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  style={{
                    padding: "9px 24px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#5b835a",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: saving || uploadingImage ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  {saving && <i className="fa-solid fa-spinner fa-spin"></i>}
                  {editingId ? "บันทึกการแก้ไข" : "สร้างและเผยแพร่"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
               PREVIEW MODAL (RESPONSIVE POPUP SIMULATOR)
      ======================================================== */}
      {previewItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: "16px 12px 24px 12px",
            boxSizing: "border-box"
          }}
          onClick={() => setPreviewItem(null)}
        >
          {/* Top Control Bar for Simulator */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "14px",
              padding: "8px 16px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              zIndex: 100,
              flexShrink: 0
            }}
          >
            {/* Style Toggle */}
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>รูปแบบ:</span>
              <button
                type="button"
                onClick={() => setPreviewLayout("image")}
                style={{
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  backgroundColor: previewLayout === "image" ? "#5b835a" : "#f1f5f9",
                  color: previewLayout === "image" ? "#ffffff" : "#475569"
                }}
              >
                🖼️ แบบที่ 1: โปสเตอร์
              </button>
              <button
                type="button"
                onClick={() => setPreviewLayout("card")}
                style={{
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  backgroundColor: previewLayout === "card" ? "#5b835a" : "#f1f5f9",
                  color: previewLayout === "card" ? "#ffffff" : "#475569"
                }}
              >
                📰 แบบที่ 2: การ์ดข่าว
              </button>
            </div>

            {/* Device Toggle */}
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>อุปกรณ์:</span>
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                style={{
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  backgroundColor: previewDevice === "desktop" ? "#334155" : "#f1f5f9",
                  color: previewDevice === "desktop" ? "#ffffff" : "#475569"
                }}
              >
                🖥️ คอมพิวเตอร์
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                style={{
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  backgroundColor: previewDevice === "mobile" ? "#334155" : "#f1f5f9",
                  color: previewDevice === "mobile" ? "#ffffff" : "#475569"
                }}
              >
                📱 มือถือ (Responsive)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              style={{
                border: "none",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                borderRadius: "6px",
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              ปิดตัวอย่าง
            </button>
          </div>

          {/* SIMULATED POPUP CONTAINER */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: previewDevice === "mobile" ? "340px" : "100%",
              maxWidth: previewDevice === "mobile" ? "340px" : previewLayout === "image" ? "460px" : "560px",
              margin: "auto 0",
              transition: "all 0.25s ease",
              position: "relative"
            }}
          >
            {/* =========================================
                PREVIEW แบบที่ 1: สไตล์รูปภาพ / โปสเตอร์
               ========================================= */}
            {previewLayout === "image" && (
              <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Floating Close Button */}
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  title="ปิดประกาศ (x)"
                  style={{
                    position: "absolute",
                    top: "-12px",
                    right: "-12px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    color: "#1e293b",
                    border: "2px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                    zIndex: 50
                  }}
                >
                  <i className="fa-solid fa-xmark" style={{ fontSize: "15px", fontWeight: "bold" }}></i>
                </button>

                <div
                  style={{
                    width: "100%",
                    borderRadius: "18px",
                    overflow: "hidden",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  {previewItem.imageUrl ? (
                    <div
                      style={{
                        backgroundColor: "#000000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        overflow: "hidden"
                      }}
                    >
                      <img
                        src={previewItem.imageUrl}
                        alt="Poster Preview"
                        style={{
                          width: "100%",
                          maxHeight: previewDevice === "mobile" ? "300px" : "400px",
                          objectFit: "contain",
                          display: "block"
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "50px 20px",
                        textAlign: "center",
                        backgroundColor: "#f1f5f9",
                        color: "#64748b"
                      }}
                    >
                      <i className="fa-regular fa-image" style={{ fontSize: "42px", marginBottom: "10px" }}></i>
                      <p style={{ margin: 0, fontSize: "14px" }}>ไม่มีรูปภาพสำหรับแสดงแบบโปสเตอร์</p>
                    </div>
                  )}

                  {(previewItem.title || previewItem.content || previewItem.linkUrl) && (
                    <div style={{ padding: "16px 20px", backgroundColor: "#ffffff", flexShrink: 0 }}>
                      {previewItem.title && (
                        <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b", margin: "0 0 6px 0" }}>
                          {previewItem.title}
                        </h4>
                      )}
                      {previewItem.content && (
                        <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 12px 0", lineHeight: "1.5" }}>
                          {previewItem.content}
                        </p>
                      )}
                      {previewItem.linkUrl && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 16px",
                            borderRadius: "8px",
                            backgroundColor: "#5b835a",
                            color: "#ffffff",
                            fontSize: "13px",
                            fontWeight: "600"
                          }}
                        >
                          ดูรายละเอียด <i className="fa-solid fa-arrow-right"></i>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "12px", textAlign: "center" }}>
                  <span
                    onClick={() => setPreviewItem(null)}
                    style={{ fontSize: "13px", color: "#ffffff", opacity: 0.9, textDecoration: "underline", cursor: "pointer" }}
                  >
                    ปิดหน้าต่างนี้
                  </span>
                </div>
              </div>
            )}

            {/* =========================================
                PREVIEW แบบที่ 2: สไตล์การ์ดข่าวสาร
               ========================================= */}
            {previewLayout === "card" && (
              <div
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "80vh"
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 18px",
                    borderBottom: "1px solid #f1f5f9",
                    backgroundColor: "#f8fafc"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        backgroundColor: "#eaf3e9",
                        color: "#5b835a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px"
                      }}
                    >
                      <i className="fa-solid fa-bullhorn"></i>
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        fontSize: "11px",
                        fontWeight: "700",
                        backgroundColor: "#dcfce7",
                        color: "#166534"
                      }}
                    >
                      {previewItem.badgeText || "ประชาสัมพันธ์"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewItem(null)}
                    style={{
                      border: "none",
                      backgroundColor: "#f1f5f9",
                      color: "#64748b",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px"
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>

                {/* Content */}
                <div style={{ padding: "18px 20px", overflowY: "auto", flex: 1 }}>
                  {previewItem.imageUrl && (
                    <div style={{ marginBottom: "14px", borderRadius: "10px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                      <img
                        src={previewItem.imageUrl}
                        alt="Preview"
                        style={{
                          width: "100%",
                          maxHeight: previewDevice === "mobile" ? "180px" : "240px",
                          objectFit: "cover",
                          display: "block"
                        }}
                      />
                    </div>
                  )}

                  {previewItem.title && (
                    <h4 style={{ fontSize: "17px", fontWeight: "800", color: "#1e293b", margin: "0 0 8px 0", lineHeight: "1.4" }}>
                      {previewItem.title}
                    </h4>
                  )}

                  {previewItem.content && (
                    <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: "1.65", margin: 0, whiteSpace: "pre-line" }}>
                      {previewItem.content}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    padding: "12px 18px",
                    borderTop: "1px solid #f1f5f9",
                    backgroundColor: "#f8fafc"
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setPreviewItem(null)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#ffffff",
                      color: "#475569",
                      fontSize: "12.5px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    ปิดประกาศ
                  </button>
                  {previewItem.linkUrl && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 16px",
                        borderRadius: "6px",
                        backgroundColor: "#5b835a",
                        color: "#ffffff",
                        fontSize: "12.5px",
                        fontWeight: "600"
                      }}
                    >
                      ดูรายละเอียด <i className="fa-solid fa-arrow-right"></i>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
