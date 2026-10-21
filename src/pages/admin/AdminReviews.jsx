import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllReviewsAdmin, deleteReview, replyToReview } from "../../services/reviewService";
import { showConfirm, showAlert } from "../../context/ModalContext";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("5");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const ratingOptions = [
    { value: "5", label: "5 ดาว (ยอดเยี่ยม)", stars: "★★★★★" },
    { value: "4", label: "4 ดาว (ดีมาก)", stars: "★★★★" },
    { value: "3", label: "3 ดาว (ปานกลาง)", stars: "★★★" },
    { value: "2", label: "2 ดาว (พอใช้)", stars: "★★" },
    { value: "1", label: "1 ดาว (ต้องปรับปรุง)", stars: "★" }
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reply State
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getAllReviewsAdmin();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id) => {
    const isConfirmed = await showConfirm({
      title: "ลบรีวิว",
      heading: "คุณต้องการลบรีวิวนี้ใช่หรือไม่?",
      message: "ข้อมูลรีวิวนี้จะถูกลบออกจากระบบและไม่สามารถกู้คืนได้",
      confirmText: "ลบรีวิว",
      cancelText: "ยกเลิก",
      type: "danger"
    });

    if (isConfirmed) {
      try {
        await deleteReview(id);
        await showAlert({
          title: "ลบรีวิวสำเร็จ",
          heading: "ลบรีวิวเรียบร้อยแล้ว!",
          type: "success"
        });
        loadReviews();
      } catch (err) {
        console.error(err);
        await showAlert({
          title: "เกิดข้อผิดพลาด",
          heading: "ไม่สามารถลบรีวิวได้",
          message: err.message || "",
          type: "danger"
        });
      }
    }
  };

  const handleStartReply = (r) => {
    setReplyingId(r.id);
    setReplyText(r.ownerReply || "");
  };

  const handleCancelReply = () => {
    setReplyingId(null);
    setReplyText("");
  };

  const handleSendReply = async (reviewId) => {
    if (!replyText.trim()) return;

    const isConfirmed = await showConfirm({
      title: "ตอบกลับรีวิว",
      heading: "ยืนยันการส่งคำตอบกลับรีวิวนี้ใช่หรือไม่?",
      message: "คำตอบของผู้ดูแลระบบจะแสดงใต้รีวิวนี้ทันที",
      confirmText: "ส่งคำตอบ",
      cancelText: "ยกเลิก",
      type: "warning"
    });
    if (!isConfirmed) return;

    setSubmittingReply(true);
    try {
      await replyToReview(reviewId, replyText.trim());
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, ownerReply: replyText.trim(), ownerReplyAt: new Date().toISOString() } : r))
      );
      setReplyingId(null);
      setReplyText("");
      await showAlert({
        title: "สำเร็จ",
        heading: "บันทึกการตอบกลับเรียบร้อยแล้ว!",
        type: "success"
      });
    } catch (err) {
      console.error(err);
      const msg = err?.error || err?.message || "ไม่สามารถบันทึกการตอบกลับได้";
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถบันทึกการตอบกลับได้",
        message: msg,
        type: "danger"
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
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

  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter !== "all" && String(r.rating) !== String(ratingFilter)) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const nameMatch = (r.userName || "").toLowerCase().includes(term);
      const dormMatch = (r.dormitoryName || "").toLowerCase().includes(term);
      const commentMatch = (r.comment || "").toLowerCase().includes(term);
      return nameMatch || dormMatch || commentMatch;
    }
    return true;
  });

  return (
    <div className="bookings-page-container">
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "24px", color: "#1e293b", fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>
              รีวิวจากผู้เช่า
            </h1>
            {!loading && (
              <span
                style={{
                  background: "#eef8ee",
                  color: "#2e7d32",
                  border: "1px solid #c8e6c9",
                  fontSize: "13px",
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                  flexShrink: 0
                }}
              >
                <i className="fa-solid fa-star" style={{ fontSize: "11px" }}></i>
                {reviews.length} รีวิว
              </span>
            )}
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            ตรวจสอบความคิดเห็น ค้นหารีวิว ตอบกลับผู้เช่า และจัดการข้อมูลรีวิวในระบบ
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="content-card" style={{ marginBottom: "20px", padding: "16px 20px", overflow: "visible", position: "relative", zIndex: 50 }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          {/* Search Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 260px", minWidth: 0, width: "100%" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>
              ค้นหารีวิว:
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px" }}></i>
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้รีวิว หอพัก หรือข้อความ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  height: "40px",
                  width: "100%",
                  padding: "0 38px 0 38px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px" }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>
          </div>

          {/* Custom Rating Filter Dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 220px", minWidth: 0, width: "100%", position: "relative" }} ref={dropdownRef}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>
              คะแนนรีวิว:
            </label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                height: "42px",
                width: "100%",
                padding: "0 16px",
                borderRadius: "10px",
                border: isDropdownOpen ? "1.5px solid #2e7d32" : "1px solid #cbd5e1",
                fontSize: "14px",
                fontWeight: 700,
                color: "#1e293b",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                boxSizing: "border-box",
                boxShadow: isDropdownOpen ? "0 0 0 3px rgba(46, 125, 50, 0.12)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              {(() => {
                const selectedOpt = ratingOptions.find((opt) => opt.value === ratingFilter) || ratingOptions[0];
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#f59e0b", fontSize: "14px", letterSpacing: "1px" }}>{selectedOpt.stars}</span>
                    <span style={{ color: "#1e293b", fontSize: "14px", fontWeight: 700 }}>{selectedOpt.label}</span>
                  </div>
                );
              })()}
              <i className={`fa-solid ${isDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"}`} style={{ fontSize: "12px", color: "#64748b" }}></i>
            </button>

            {isDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                zIndex: 9999,
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
                overflow: "hidden",
                padding: "4px 0"
              }}>
                {ratingOptions.map((opt) => {
                  const isSelected = ratingFilter === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => {
                        setRatingFilter(opt.value);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        padding: "10px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#f0fdf4" : "transparent",
                        color: isSelected ? "#166534" : "#334155",
                        fontWeight: isSelected ? 700 : 600,
                        fontSize: "14px",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#f59e0b", fontSize: "14px", letterSpacing: "1px" }}>{opt.stars}</span>
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && (
                        <i className="fa-solid fa-check" style={{ color: "#166534", fontSize: "13px", fontWeight: 800 }}></i>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Card List */}
      <div className="content-card">
        <div className="content-card-body" style={{ padding: "24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#7da27c", fontSize: "15px", fontWeight: 600 }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "8px" }}></i> กำลังโหลดรีวิว...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <i className="fa-regular fa-star" style={{ fontSize: "48px", color: "#cbd5e1", marginBottom: "16px", display: "block" }}></i>
              <h3 style={{ color: "#334155", fontWeight: 700, fontSize: "18px", margin: "0 0 6px 0" }}>
                {reviews.length === 0 ? "ยังไม่มีรีวิวในระบบ" : "ไม่พบรีวิวที่ตรงกับเงื่อนไขค้นหา"}
              </h3>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                {reviews.length === 0 ? "เมื่อมีผู้เช่าแสดงความคิดเห็น จะปรากฏรายการขึ้นที่นี่" : "ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองคะแนนแบบอื่น"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {filteredReviews.map((r) => {
                const avatarSrc = r.userPhoto || "/images/default-avatar.jpg";
                const isReplying = replyingId === r.id;

                return (
                  <div
                    key={r.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      padding: "16px 18px",
                      background: "#ffffff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                    }}
                  >
                    {/* Header: User Info & Actions */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                      {/* Left: Avatar + Name + Rating */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: "1 1 200px" }}>
                        <img
                          src={avatarSrc}
                          alt={r.userName || "ผู้รีวิว"}
                          style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", flexShrink: 0 }}
                          onError={(e) => {
                            e.target.src = "/images/default-avatar.jpg";
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <strong style={{ fontSize: "14.5px", color: "#0f172a", fontWeight: 700, wordBreak: "break-word" }}>
                              {r.userName || "ผู้เช่า"}
                            </strong>
                            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
                              ผู้เช่า
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "2px" }}>
                            <span style={{ fontSize: "12.5px", color: "#f59e0b", fontWeight: 600 }}>
                              {"⭐".repeat(r.rating || 5)} <span style={{ color: "#64748b", fontWeight: 500, fontSize: "11.5px" }}>({r.rating || 5}.0)</span>
                            </span>
                            {r.created_at || r.createdAt ? (
                              <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                                • {formatDate(r.created_at || r.createdAt)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Right: Dormitory Link & Delete Action */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginLeft: "auto" }}>
                        {r.dormitoryId && (
                          <Link
                            to={`/dorms/${r.dormitoryId}`}
                            style={{
                              background: "#f4f8f4",
                              color: "#2e7d32",
                              padding: "4px 10px",
                              borderRadius: "16px",
                              fontSize: "12px",
                              fontWeight: 600,
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              whiteSpace: "nowrap"
                            }}
                            title="คลิกเพื่อเปิดดูหน้าหอพักนี้"
                          >
                            <i className="fa-solid fa-building" style={{ fontSize: "10px" }}></i>
                            <span>{r.dormitoryName || "ดูหอพัก"}</span>
                            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "10px" }}></i>
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          style={{
                            background: "transparent",
                            color: "#94a3b8",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            whiteSpace: "nowrap"
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "#fef2f2"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}
                          title="ลบรีวิวนี้ออกจากระบบ"
                        >
                          <i className="fa-solid fa-trash-can"></i> ลบรีวิว
                        </button>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <p style={{
                      color: "#334155",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      margin: "10px 0 14px 0",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word"
                    }}>
                      {r.comment || "ไม่มีข้อความรีวิว"}
                    </p>

                    {/* Response / Reply Section */}
                    <div style={{ marginTop: "10px" }}>
                      {r.ownerReply ? (
                        <div style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          padding: "10px 14px",
                          borderRadius: "8px"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <img
                                src={r.ownerReplyPhoto || "/images/default-avatar.jpg"}
                                alt={r.ownerReplyName || "ผู้ตอบกลับ"}
                                style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover", border: "1px solid #cbd5e1" }}
                                onError={(e) => { e.target.src = "/images/default-avatar.jpg"; }}
                              />
                              <strong style={{ color: "#1e293b", fontSize: "12.5px", fontWeight: 700 }}>
                                {r.ownerReplyName || (r.ownerReplyRole === "admin" ? "ผู้ดูแลระบบ" : "เจ้าของหอพัก")}
                              </strong>
                              <span style={{
                                background: r.ownerReplyRole === "admin" ? "#eff6ff" : "#f0fdf4",
                                color: r.ownerReplyRole === "admin" ? "#2563eb" : "#166534",
                                border: r.ownerReplyRole === "admin" ? "1px solid #dbeafe" : "1px solid #dcfce7",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                fontSize: "10.5px",
                                fontWeight: 600
                              }}>
                                {r.ownerReplyRole === "admin" ? "ผู้ดูแลระบบ" : "เจ้าของหอพัก"}
                              </span>
                            </div>

                            {(() => {
                              const isEditable = !r.ownerReplyAt || (Date.now() - new Date(r.ownerReplyAt).getTime() < 60000);
                              return isEditable ? (
                                <button
                                  type="button"
                                  onClick={() => handleStartReply(r)}
                                  style={{ background: "none", border: "none", color: "#2e7d32", fontSize: "11.5px", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px", padding: 0 }}
                                  title="แก้ไขข้อความตอบกลับ"
                                >
                                  <i className="fa-solid fa-pen-to-square"></i> แก้ไข (ภายใน 1 นาที)
                                </button>
                              ) : (
                                <span style={{ fontSize: "11px", color: "#94a3b8" }} title="ครบกำหนด 1 นาทีแล้ว ไม่สามารถแก้ไขคำได้">
                                  <i className="fa-solid fa-lock"></i> หมดเวลาแก้ไข
                                </span>
                              );
                            })()}
                          </div>
                          <p style={{ color: "#475569", margin: 0, fontSize: "13px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                            {r.ownerReply}
                          </p>
                        </div>
                      ) : !isReplying ? (
                        <button
                          type="button"
                          onClick={() => handleStartReply(r)}
                          style={{
                            background: "transparent",
                            color: "#2e7d32",
                            border: "none",
                            padding: "2px 0",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px"
                          }}
                        >
                          <i className="fa-solid fa-reply"></i> ตอบกลับรีวิวนี้
                        </button>
                      ) : null}

                      {/* Active Reply Input Form */}
                      {isReplying && (
                        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px", borderRadius: "8px", marginTop: "8px" }}>
                          <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>
                            พิมพ์ข้อความตอบกลับ (ในนามผู้ดูแลระบบ)
                          </label>
                          <textarea
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="พิมพ์ข้อความตอบกลับผู้เช่าที่นี่..."
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "13px",
                              fontFamily: "inherit",
                              outline: "none",
                              boxSizing: "border-box"
                            }}
                          ></textarea>
                          <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                            <button
                              type="button"
                              onClick={() => handleSendReply(r.id)}
                              disabled={submittingReply}
                              style={{
                                background: "#7da27c",
                                color: "#ffffff",
                                border: "none",
                                padding: "6px 14px",
                                borderRadius: "6px",
                                fontSize: "12.5px",
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              {submittingReply ? "กำลังบันทึก..." : "บันทึกคำตอบ"}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelReply}
                              style={{
                                background: "#ffffff",
                                color: "#64748b",
                                border: "1px solid #cbd5e1",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "12.5px",
                                cursor: "pointer"
                              }}
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
