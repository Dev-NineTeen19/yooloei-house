import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getBookingsByOwner, updateBookingStatus } from "../../services/bookingService";
import { showAlert, showConfirm } from "../../context/ModalContext";

export default function OwnerBookings() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadBookings = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const ownerId = currentUser.id || currentUser.uid;
      const data = await getBookingsByOwner(ownerId);
      setBookings(data);
    } catch (err) {
      console.error("Error loading owner bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [currentUser]);

  const handleUpdate = async (bookingId, status) => {
    const statusTextMap = {
      approved: "อนุมัติการจอง",
      rejected: "ปฏิเสธการจอง",
      cancelled: "ยกเลิกการจอง"
    };
    const isConfirmed = await showConfirm({
      title: "เปลี่ยนสถานะการจอง",
      heading: `ต้องการ "${statusTextMap[status] || status}" ใช่หรือไม่?`,
      message: "ระบบจะแจ้งเตือนการอัปเดตสถานะนี้ไปยังผู้เช่าทันที",
      confirmText: "ยืนยัน",
      cancelText: "ยกเลิก",
      type: status === "rejected" || status === "cancelled" ? "danger" : "warning"
    });
    if (!isConfirmed) return;

    try {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
      await updateBookingStatus(bookingId, status);
      await showAlert({
        title: "สำเร็จ",
        heading: "เปลี่ยนสถานะการจองเรียบร้อยแล้ว!",
        type: "success"
      });
      await loadBookings();
    } catch (err) {
      console.error("Error updating status:", err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถเปลี่ยนสถานะได้",
        message: err.message || "",
        type: "danger"
      });
      loadBookings();
    }
  };

  const filteredBookings = statusFilter === "all"
    ? bookings
    : statusFilter === "available"
    ? bookings.filter((b) => b.status === "available" || b.status === "rejected" || b.status === "cancelled")
    : bookings.filter((b) => b.status === statusFilter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", color: "#333", fontWeight: 700 }}>จัดการการจองห้องพัก</h1>
          <p style={{ color: "#777", fontSize: "14px" }}>ตรวจสอบและเปลี่ยนสถานะการจองได้ตลอดเวลา (รออนุมัติ / จองแล้ว / ยกเลิกคำขอ)</p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["all", "pending", "approved", "available"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={statusFilter === st ? "btn-primary-action" : "btn-secondary-action"}
              style={{ padding: "6px 14px", fontSize: "13px" }}
            >
              {st === "all" ? "ทั้งหมด" : st === "pending" ? "รออนุมัติ" : st === "approved" ? "จองแล้ว" : "ยกเลิกคำขอ"}
            </button>
          ))}
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#7da27c" }}>
              <i className="fa-solid fa-spinner fa-spin"></i> กำลังโหลดข้อมูล...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <i className="fa-regular fa-calendar-xmark" style={{ fontSize: "48px", color: "#ccc", marginBottom: "16px" }}></i>
              <h3 style={{ color: "#555" }}>ไม่มีรายการจองตามตัวกรองนี้</h3>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ผู้ขอจอง</th>
                    <th>เบอร์โทรศัพท์</th>
                    <th>หอพัก</th>
                    <th>ห้องพัก</th>
                    <th>วันที่ต้องการเข้าพัก</th>
                    <th>ข้อความเพิ่มเติม</th>
                    <th>สถานะปัจจุบัน</th>
                    <th>เปลี่ยนสถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.userName || b.userEmail}</strong></td>
                      <td>{b.userPhone || "-"}</td>
                      <td>{b.dormitoryName}</td>
                      <td>{b.roomNumber}</td>
                      <td>{b.bookingDate}</td>
                      <td><span style={{ color: "#666", fontSize: "13px" }}>{b.note || "-"}</span></td>
                      <td>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: (b.status === "approved" || b.status === "completed") ? "#dcfce7" : b.status === "pending" ? "#fef3c7" : "#f1f5f9",
                          color: (b.status === "approved" || b.status === "completed") ? "#166534" : b.status === "pending" ? "#92400e" : "#475569"
                        }}>
                          {b.status === "approved" || b.status === "completed" ? "จองแล้ว (อนุมัติ)" :
                           b.status === "pending" ? "รออนุมัติ" :
                           "ยกเลิกคำขอ"}
                        </span>
                      </td>
                      <td>
                        <select
                          value={
                            b.status === "approved" || b.status === "completed" ? "approved" :
                            b.status === "pending" ? "pending" : "available"
                          }
                          onChange={(e) => handleUpdate(b.id, e.target.value)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #7da27c",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            outline: "none",
                            background: "#fff"
                          }}
                        >
                          <option value="pending">รออนุมัติ</option>
                          <option value="approved">จองแล้ว (อนุมัติ)</option>
                          <option value="available">ยกเลิกคำขอ</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
