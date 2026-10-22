import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getReviewsByUser, deleteReview, updateReview } from "../../services/reviewService";
import { showConfirm, showAlert } from "../../context/ModalContext";
import CustomSelect from "../../components/common/CustomSelect";

export default function UserReviews() {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Review Modal
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [saving, setSaving] = useState(false);

  const loadReviews = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userId = currentUser.id || currentUser.uid;
      const data = await getReviewsByUser(userId);
      setReviews(data);
    } catch (err) {
      console.error("Error loading user reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [currentUser]);

  const handleDelete = async (reviewId) => {
    const isConfirmed = await showConfirm({
      title: "ลบรีวิว",
      heading: "คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้?",
      message: "รีวิวและคะแนนที่คุณให้ไว้จะถูกลบออกจากระบบอย่างถาวร",
      confirmText: "ลบรีวิว",
      cancelText: "ยกเลิก",
      type: "danger"
    });

    if (isConfirmed) {
      try {
        await deleteReview(reviewId);
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        await showAlert({
          title: "ลบรีวิวสำเร็จ",
          heading: "ลบรีวิวเรียบร้อยแล้ว!",
          message: "ข้อมูลรีวิวถูกลบออกจากระบบแล้ว",
          type: "success"
        });
      } catch (err) {
        console.error("Error deleting review:", err);
        await showAlert({
          title: "เกิดข้อผิดพลาด",
          heading: "ไม่สามารถลบรีวิวได้",
          message: err.message || "",
          type: "danger"
        });
      }
    }
  };

  const handleOpenEdit = async (review) => {
    const baseTime = review.createdAt || review.updatedAt;
    if (baseTime && (Date.now() - new Date(baseTime).getTime() > 60000)) {
      await showAlert({
        title: "แจ้งเตือน",
        heading: "หมดเวลาสำหรับการแก้ไขรีวิวแล้ว",
        message: "สามารถแก้ไขได้ภายใน 1 นาทีหลังเขียนรีวิวเท่านั้นครับ",
        type: "warning"
      });
      return;
    }
    setEditingReview(review);
    setEditRating(review.rating || 5);
    setEditComment(review.comment || "");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingReview) return;

    const baseTime = editingReview.createdAt || editingReview.updatedAt;
    if (baseTime && (Date.now() - new Date(baseTime).getTime() > 60000)) {
      await showAlert({
        title: "แจ้งเตือน",
        heading: "หมดเวลาสำหรับการแก้ไขรีวิวแล้ว",
        message: "สามารถแก้ไขได้ภายใน 1 นาทีหลังเขียนรีวิวเท่านั้นครับ",
        type: "warning"
      });
      setEditingReview(null);
      return;
    }

    const isConfirmed = await showConfirm({
      title: "แก้ไขรีวิว",
      heading: "ยืนยันการบันทึกการแก้ไขรีวิวใช่หรือไม่?",
      message: "ความคิดเห็นและคะแนนดาวจะถูกอัปเดตตามข้อมูลใหม่",
      confirmText: "บันทึกการแก้ไข",
      cancelText: "ยกเลิก",
      type: "warning"
    });
    if (!isConfirmed) return;

    setSaving(true);
    try {
      await updateReview(editingReview.id, editComment, editRating);
      setEditingReview(null);
      await showAlert({
        title: "แก้ไขสำเร็จ",
        heading: "บันทึกการแก้ไขรีวิวเรียบร้อยแล้ว!",
        type: "success"
      });
      loadReviews();
    } catch (err) {
      console.error("Error updating review:", err);
      const msg = err?.error || err?.message || "ไม่สามารถแก้ไขรีวิวได้";
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถแก้ไขรีวิวได้",
        message: msg,
        type: "danger"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", color: "#333", fontWeight: 700 }}>รีวิวของฉัน</h1>
        <p style={{ color: "#777", fontSize: "14px" }}>ดูและจัดการรีวิวหอพักที่คุณเคยเขียนไว้ (สามารถแก้ไขได้ภายใน 1 นาทีหลังสร้าง)</p>
      </div>

      <div className="content-card">
        <div className="content-card-body">
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#7da27c" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "10px" }}></i> กำลังโหลดรีวิว...
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <i className="fa-regular fa-comment-dots" style={{ fontSize: "48px", color: "#ccc", marginBottom: "16px" }}></i>
              <h3 style={{ color: "#555" }}>คุณยังไม่ได้เขียนรีวิวหอพักใดๆ</h3>
              <p style={{ color: "#888", marginTop: "8px", marginBottom: "20px" }}>
                ร่วมแบ่งปันประสบการณ์การพักอาศัยของคุณในหน้ารายละเอียดของหอพักได้
              </p>
              <Link to="/dorms" style={{ textDecoration: "none" }}>
                <button className="btn-primary-action">
                  <i className="fa-solid fa-magnifying-glass"></i> ค้นหาหอพักเพื่อรีวิว
                </button>
              </Link>
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <span style={{ color: "#f39c12", fontSize: "16px" }}>{"⭐".repeat(rev.rating || 5)}</span>
                      <span style={{ marginLeft: "8px", color: "#888", fontSize: "13px" }}>
                        ({rev.rating} / 5 คะแนน)
                      </span>
                    </div>
                    <div className="btn-action-group" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {(() => {
                        const baseTime = rev.createdAt || rev.updatedAt;
                        const isEditable = !baseTime || (Date.now() - new Date(baseTime).getTime() < 60000);
                        return isEditable ? (
                          <button
                            className="btn-icon"
                            onClick={() => handleOpenEdit(rev)}
                            title="แก้ไขรีวิว (ภายใน 1 นาที)"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }} title="ครบกำหนด 1 นาทีแล้ว ไม่สามารถแก้ไขคำได้">
                            <i className="fa-solid fa-lock"></i> หมดเวลาแก้ไข
                          </span>
                        );
                      })()}
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(rev.id)}
                        title="ลบรีวิว"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>

                  <p style={{ color: "#444", fontSize: "15px", lineHeight: "1.6" }}>
                    {rev.comment}
                  </p>

                  {rev.ownerReply && (
                    <div style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      marginTop: "12px",
                      fontSize: "13px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <i className="fa-solid fa-reply" style={{ color: "#5b8e66", fontSize: "11px" }}></i>
                        <strong style={{ color: "#1e293b", fontSize: "12.5px" }}>การตอบกลับจากเจ้าของหอพัก:</strong>
                      </div>
                      <p style={{ color: "#475569", margin: 0, lineHeight: 1.5 }}>{rev.ownerReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          padding: "20px"
        }}>
          <div style={{
            background: "#fff",
            width: "100%",
            maxWidth: "500px",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>แก้ไขรีวิว</h3>
            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 600 }}>คะแนน</label>
                <CustomSelect
                  value={editRating}
                  onChange={(val) => setEditRating(Number(val))}
                  options={[
                    { value: 5, label: "⭐⭐⭐⭐⭐ (5 ดาว - ดีเยี่ยม)" },
                    { value: 4, label: "⭐⭐⭐⭐ (4 ดาว - ดีมาก)" },
                    { value: 3, label: "⭐⭐⭐ (3 ดาว - ปานกลาง)" },
                    { value: 2, label: "⭐⭐ (2 ดาว - พอใช้)" },
                    { value: 1, label: "⭐ (1 ดาว - ควรปรับปรุง)" },
                  ]}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 600 }}>ความคิดเห็น</label>
                <textarea
                  rows={4}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontFamily: "inherit" }}
                ></textarea>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  style={{ padding: "8px 16px", border: "1px solid #ccc", background: "#fff", borderRadius: "6px", cursor: "pointer" }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary-action"
                  style={{ padding: "8px 18px" }}
                >
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
