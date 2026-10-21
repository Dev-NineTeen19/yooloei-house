import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDormitoriesByOwner } from "../../services/dormitoryService";
import { getReviewsByDormitory, replyToReview } from "../../services/reviewService";
import { showAlert, showConfirm } from "../../context/ModalContext";

export default function OwnerReviews() {
  const { currentUser } = useAuth();
  const [dorms, setDorms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reply state
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadOwnerReviews() {
      if (!currentUser) return;
      setLoading(true);
      try {
        const ownerDorms = await getDormitoriesByOwner(currentUser.uid);
        setDorms(ownerDorms);

        // ดึงรีวิวของทุกหอพักของ owner
        const reviewPromises = ownerDorms.map((d) => getReviewsByDormitory(d.id));
        const allReviewsNested = await Promise.all(reviewPromises);
        const combined = allReviewsNested.flat();
        setReviews(combined);
      } catch (err) {
        console.error("Error loading owner reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOwnerReviews();
  }, [currentUser]);

  const handleSendReply = async (reviewId) => {
    if (!replyText.trim()) return;

    const isConfirmed = await showConfirm({
      title: "ตอบกลับรีวิว",
      heading: "ยืนยันการส่งคำตอบกลับรีวิวนี้ใช่หรือไม่?",
      message: "คำตอบของคุณจะแสดงอยู่ใต้รีวิวของผู้เช่า",
      confirmText: "ส่งคำตอบ",
      cancelText: "ยกเลิก",
      type: "warning"
    });
    if (!isConfirmed) return;

    setSubmitting(true);
    try {
      await replyToReview(reviewId, replyText.trim());
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, ownerReply: replyText.trim(), ownerReplyAt: new Date().toISOString() } : r))
      );
      setReplyingReviewId(null);
      setReplyText("");
      await showAlert({
        title: "สำเร็จ",
        heading: "ตอบกลับรีวิวเรียบร้อยแล้ว!",
        type: "success"
      });
    } catch (err) {
      console.error("Error replying to review:", err);
      const msg = err?.error || err?.message || "ไม่สามารถตอบกลับรีวิวได้";
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถตอบกลับรีวิวได้",
        message: msg,
        type: "danger"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bookings-page-container">
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", color: "#1e293b", fontWeight: 800 }}>รีวิวจากผู้เช่า</h1>
        <p style={{ color: "#64748b", fontSize: "14px" }}>ติดตามความคิดเห็นและตอบกลับผู้เช่าเพื่อสร้างความประทับใจ</p>
      </div>

      <div className="content-card">
        <div className="content-card-body">
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#7da27c" }}>
              <i className="fa-solid fa-spinner fa-spin"></i> กำลังโหลดรีวิว...
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <i className="fa-regular fa-comment-dots" style={{ fontSize: "48px", color: "#ccc", marginBottom: "16px" }}></i>
              <h3 style={{ color: "#555" }}>ยังไม่มีรีวิวสำหรับหอพักของคุณ</h3>
              <p style={{ color: "#888", marginTop: "8px" }}>เมื่อมีผู้เช่าแสดงความคิดเห็น จะปรากฏขึ้นที่นี่</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{
                  border: "1px solid #e5e9e3",
                  borderRadius: "8px",
                  padding: "18px 22px",
                  background: "#fcfdfb"
                }}>
                  {/* Tenant Info Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src={rev.userPhoto || "/images/default-avatar.jpg"}
                        alt={rev.userName || "ผู้รีวิว"}
                        style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid #e0e0e0", backgroundColor: "#f5f5f5" }}
                        onError={(e) => {
                          e.target.src = "/images/default-avatar.jpg";
                        }}
                      />
                      <div>
                        <strong style={{ fontSize: "15px", color: "#333", display: "block" }}>{rev.userName || "ผู้เช่า"}</strong>
                        <span style={{ fontSize: "12px", color: "#f39c12" }}>{"⭐".repeat(rev.rating || 5)}</span>
                      </div>
                    </div>

                    {rev.dormitoryId && (
                      <a
                        href={`/dorms/${rev.dormitoryId}`}
                        style={{ color: "#7da27c", fontWeight: 600, fontSize: "13px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        title="คลิกเพื่อเปิดดูหน้าหอพักนี้"
                      >
                        <span>{rev.dormitoryName || "ดูหน้าหอพัก"}</span>
                        <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "11px" }}></i>
                      </a>
                    )}
                  </div>

                  <p style={{ color: "#444", fontSize: "15px", lineHeight: "1.6" }}>{rev.comment}</p>

                  {/* Owner Reply Section */}
                  {rev.ownerReply ? (
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        marginTop: "12px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <img
                            src={rev.ownerReplyPhoto || "/images/default-avatar.jpg"}
                            alt={rev.ownerReplyName || "ผู้ตอบกลับ"}
                            style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover", border: "1px solid #cbd5e1" }}
                            onError={(e) => { e.target.src = "/images/default-avatar.jpg"; }}
                          />
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <span style={{ color: "#1e293b", fontSize: "13.5px", fontWeight: 600 }}>
                              {rev.ownerReplyName || (rev.ownerReplyRole === "admin" ? "ผู้ดูแลระบบ" : "เจ้าของหอพัก")}
                            </span>
                            <span style={{
                              background: rev.ownerReplyRole === "admin" ? "#eff6ff" : "#f0fdf4",
                              color: rev.ownerReplyRole === "admin" ? "#2563eb" : "#166534",
                              border: rev.ownerReplyRole === "admin" ? "1px solid #dbeafe" : "1px solid #dcfce7",
                              padding: "1px 7px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px"
                            }}>
                              <i className={rev.ownerReplyRole === "admin" ? "fa-solid fa-shield-halved" : "fa-solid fa-building-user"} style={{ fontSize: "9px" }}></i>
                              {rev.ownerReplyRole === "admin" ? "ผู้ดูแลระบบ" : "เจ้าของหอพัก"}
                            </span>
                          </div>
                        </div>

                        {(() => {
                          const isEditable = !rev.ownerReplyAt || (Date.now() - new Date(rev.ownerReplyAt).getTime() < 60000);
                          return isEditable ? (
                            <button
                              onClick={() => {
                                setReplyingReviewId(rev.id);
                                setReplyText(rev.ownerReply);
                              }}
                              style={{ background: "none", border: "none", color: "#5b8e66", fontSize: "12px", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}
                            >
                              <i className="fa-solid fa-pen-to-square"></i> แก้ไขคำตอบ (ภายใน 1 นาที)
                            </button>
                          ) : (
                            <span style={{ fontSize: "11.5px", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "4px" }} title="ครบกำหนด 1 นาทีแล้ว ไม่สามารถแก้ไขคำได้">
                              <i className="fa-solid fa-lock" style={{ fontSize: "10px" }}></i> หมดเวลาแก้ไข
                            </span>
                          );
                        })()}
                      </div>
                      <p style={{ color: "#334155", margin: 0, fontSize: "13.5px", lineHeight: "1.6" }}>{rev.ownerReply}</p>
                    </div>
                  ) : replyingReviewId !== rev.id ? (
                    <button
                      onClick={() => {
                        setReplyingReviewId(rev.id);
                        setReplyText("");
                      }}
                      className="btn-secondary-action"
                      style={{ padding: "6px 14px", fontSize: "12px", marginTop: "12px" }}
                    >
                      <i className="fa-solid fa-reply"></i> ตอบกลับรีวิวนี้
                    </button>
                  ) : null}

                  {replyingReviewId === rev.id && (
                    <div style={{ marginTop: "14px", background: "#f8faf7", padding: "14px", borderRadius: "6px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                        พิมพ์คำตอบของคุณ
                      </label>
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="เช่น ขอบคุณสำหรับรีวิวครับ ยินดีให้บริการเสมอ..."
                        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", fontFamily: "inherit" }}
                      ></textarea>
                      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                        <button
                          onClick={() => handleSendReply(rev.id)}
                          disabled={submitting}
                          className="btn-primary-action"
                          style={{ padding: "6px 14px", fontSize: "13px" }}
                        >
                          {submitting ? "กำลังส่ง..." : "ส่งคำตอบ"}
                        </button>
                        <button
                          onClick={() => setReplyingReviewId(null)}
                          style={{ padding: "6px 14px", border: "1px solid #ccc", background: "#fff", borderRadius: "4px", cursor: "pointer" }}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
