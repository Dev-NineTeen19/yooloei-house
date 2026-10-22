import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDormitoriesByOwner } from "../../services/dormitoryService";
import { getRoomsByDormitory, createRoom, updateRoomStatus, deleteRoom } from "../../services/roomService";
import { showConfirm, showAlert } from "../../context/ModalContext";
import CustomSelect from "../../components/common/CustomSelect";

export default function OwnerRooms() {
  const { currentUser } = useAuth();
  const [dorms, setDorms] = useState([]);
  const [selectedDormId, setSelectedDormId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Room Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    roomType: "ห้องแอร์",
    price: "",
    status: "available"
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadDorms() {
      if (!currentUser) return;
      try {
        const ownerId = currentUser.id || currentUser.uid;
        const dormList = await getDormitoriesByOwner(ownerId);
        setDorms(dormList);
        if (dormList.length > 0) {
          setSelectedDormId(dormList[0].id);
        }
      } catch (err) {
        console.error("Error loading dorms for rooms:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDorms();
  }, [currentUser]);

  const loadRooms = async (dormId) => {
    if (!dormId) return;
    try {
      const roomList = await getRoomsByDormitory(dormId);
      setRooms(roomList);
    } catch (err) {
      console.error("Error loading rooms:", err);
    }
  };

  useEffect(() => {
    if (selectedDormId) {
      loadRooms(selectedDormId);
    }
  }, [selectedDormId]);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!selectedDormId) {
      await showAlert({
        title: "แจ้งเตือน",
        heading: "กรุณาเลือกหอพักก่อน",
        message: "โปรดเลือกหอพักที่ต้องการเพิ่มห้องพักในรายการ",
        type: "warning"
      });
      return;
    }

    setSubmitting(true);
    try {
      const ownerId = currentUser.id || currentUser.uid;
      await createRoom({
        dormitoryId: selectedDormId,
        ownerId: ownerId,
        roomNumber: newRoom.roomNumber,
        roomType: newRoom.roomType,
        price: Number(newRoom.price) || 0,
        status: newRoom.status
      });

      setModalOpen(false);
      setNewRoom({ roomNumber: "", roomType: "ห้องแอร์", price: "", status: "available" });
      await showAlert({
        title: "เพิ่มห้องพักสำเร็จ",
        heading: "เพิ่มห้องพักเรียบร้อยแล้ว!",
        type: "success"
      });
      loadRooms(selectedDormId);
    } catch (err) {
      console.error("Error adding room:", err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถเพิ่มห้องพักได้",
        message: err.message || "",
        type: "danger"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeStatus = async (roomId, newStatus) => {
    const statusMap = {
      available: "ว่าง",
      occupied: "มีผู้เช่าแล้ว",
      maintenance: "ปิดปรับปรุง"
    };
    const isConfirmed = await showConfirm({
      title: "เปลี่ยนสถานะห้องพัก",
      heading: `ต้องการเปลี่ยนสถานะห้องพักเป็น "${statusMap[newStatus] || newStatus}" ใช่หรือไม่?`,
      confirmText: "ยืนยันเปลี่ยน",
      cancelText: "ยกเลิก",
      type: "warning"
    });
    if (!isConfirmed) return;

    try {
      setRooms((prevRooms) =>
        prevRooms.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r))
      );
      await updateRoomStatus(roomId, newStatus);
      await showAlert({
        title: "สำเร็จ",
        heading: "เปลี่ยนสถานะห้องพักเรียบร้อยแล้ว!",
        type: "success"
      });
      await loadRooms(selectedDormId);
    } catch (err) {
      console.error("Error updating room status:", err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถอัปเดตสถานะห้องพักได้",
        message: err.message || "",
        type: "danger"
      });
      loadRooms(selectedDormId);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const isConfirmed = await showConfirm({
      title: "ลบห้องพัก",
      heading: "คุณต้องการลบห้องนี้ใช่หรือไม่?",
      message: "ข้อมูลห้องพักนี้จะถูกลบออกจากระบบอย่างถาวร",
      confirmText: "ลบห้องพัก",
      cancelText: "ยกเลิก",
      type: "danger"
    });

    if (isConfirmed) {
      try {
        await deleteRoom(roomId);
        await showAlert({
          title: "ลบห้องพักสำเร็จ",
          heading: "ลบห้องพักเรียบร้อยแล้ว!",
          type: "success"
        });
        loadRooms(selectedDormId);
      } catch (err) {
        console.error("Error deleting room:", err);
        await showAlert({
          title: "เกิดข้อผิดพลาด",
          heading: "ไม่สามารถลบห้องพักได้",
          message: err.message || "",
          type: "danger"
        });
      }
    }
  };

  return (
    <div>
      <div className="owner-rooms-top-bar">
        <div>
          <h1 style={{ fontSize: "24px", color: "#333", fontWeight: 700 }}>จัดการห้องพัก</h1>
          <p style={{ color: "#777", fontSize: "14px" }}>กำหนดหมายเลขห้อง ราคา และสถานะความว่างของห้อง</p>
        </div>

        {dorms.length > 0 && (
          <button className="btn-primary-action" onClick={() => setModalOpen(true)}>
            <i className="fa-solid fa-plus"></i> เพิ่มห้องพัก
          </button>
        )}
      </div>

      {/* Select Dormitory dropdown */}
      {dorms.length > 0 && (
        <div className="owner-rooms-select-box" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <label style={{ fontWeight: 600, color: "#444", fontSize: "14px", whiteSpace: "nowrap" }}>
            <i className="fa-solid fa-hotel" style={{ color: "#5b8e66", marginRight: "6px" }}></i>
            เลือกหอพัก:
          </label>
          <CustomSelect
            value={selectedDormId}
            onChange={(val) => setSelectedDormId(val)}
            options={dorms.map((dorm) => ({
              value: dorm.id,
              label: `${dorm.name} (${dorm.district || "เมืองเลย"})`,
              icon: "fa-solid fa-building"
            }))}
            width="320px"
            triggerStyle={{ height: "40px" }}
          />
        </div>
      )}

      <div className="content-card">
        <div className="content-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#7da27c" }}>
              <i className="fa-solid fa-spinner fa-spin"></i> กำลังโหลดห้องพัก...
            </div>
          ) : dorms.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <i className="fa-solid fa-hotel" style={{ fontSize: "48px", color: "#ccc", marginBottom: "16px" }}></i>
              <h3 style={{ color: "#555" }}>คุณยังไม่มีหอพักสำหรับจัดการห้อง</h3>
              <p style={{ color: "#888", marginTop: "8px" }}>กรุณาลงประกาศหอพักก่อนเพิ่มห้องพัก</p>
            </div>
          ) : rooms.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <i className="fa-solid fa-bed" style={{ fontSize: "48px", color: "#ccc", marginBottom: "16px" }}></i>
              <h3 style={{ color: "#555" }}>ยังไม่มีห้องพักในหอพักนี้</h3>
              <p style={{ color: "#888", marginTop: "8px", marginBottom: "16px" }}>คลิกปุ่มเพิ่มห้องพักเพื่อเริ่มต้นใส่หมายเลขห้อง</p>
              <button className="btn-primary-action" onClick={() => setModalOpen(true)}>
                <i className="fa-solid fa-plus"></i> เพิ่มห้องพักแรก
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>หมายเลขห้อง</th>
                    <th>ประเภทห้อง</th>
                    <th>ราคา (บาท/เดือน)</th>
                    <th>สถานะปัจจุบัน</th>
                    <th>เปลี่ยนสถานะ</th>
                    <th>ลบ</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id}>
                      <td><strong>ห้อง {room.roomNumber}</strong></td>
                      <td>{room.roomType}</td>
                      <td>{Number(room.price).toLocaleString()} บาท</td>
                      <td>
                        <span className={`status-badge ${room.status}`}>
                          {room.status === "available" ? "ห้องว่าง" :
                           room.status === "reserved" ? "จองแล้ว" : "ไม่ว่าง / มีผู้เช่า"}
                        </span>
                      </td>
                      <td style={{ minWidth: "160px" }}>
                        <CustomSelect
                          value={room.status}
                          onChange={(val) => handleChangeStatus(room.id, val)}
                          options={[
                            { value: "available", label: "ห้องว่าง", icon: "fa-solid fa-check" },
                            { value: "reserved", label: "จองแล้ว", icon: "fa-regular fa-clock" },
                            { value: "occupied", label: "มีผู้เช่าแล้ว", icon: "fa-solid fa-user-check" },
                          ]}
                          triggerStyle={{ height: "34px", fontSize: "12.5px", padding: "0 10px" }}
                        />
                      </td>
                      <td>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDeleteRoom(room.id)}
                          title="ลบห้อง"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Room Modal */}
      {modalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          padding: "20px"
        }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: "450px", borderRadius: "10px", padding: "24px" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "18px" }}>เพิ่มห้องพักใหม่</h3>
            <form onSubmit={handleAddRoom}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 600 }}>หมายเลขห้อง <span>*</span></label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 101, A203"
                  value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 600 }}>ประเภทห้อง</label>
                <CustomSelect
                  value={newRoom.roomType}
                  onChange={(val) => setNewRoom({ ...newRoom, roomType: val })}
                  options={[
                    { value: "ห้องพัดลม", label: "ห้องพัดลม", icon: "fa-solid fa-fan" },
                    { value: "ห้องแอร์", label: "ห้องแอร์", icon: "fa-regular fa-snowflake" },
                    { value: "ห้องสตูดิโอ", label: "ห้องสตูดิโอ", icon: "fa-solid fa-couch" },
                    { value: "ห้องชุด", label: "ห้องชุด", icon: "fa-solid fa-house-chimney" },
                  ]}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 600 }}>ราคา (บาท/เดือน) <span>*</span></label>
                <input
                  type="number"
                  required
                  placeholder="เช่น 3500"
                  value={newRoom.price}
                  onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 600 }}>สถานะห้อง</label>
                <CustomSelect
                  value={newRoom.status}
                  onChange={(val) => setNewRoom({ ...newRoom, status: val })}
                  options={[
                    { value: "available", label: "ห้องว่าง (Available)", icon: "fa-solid fa-check" },
                    { value: "reserved", label: "จองแล้ว (Reserved)", icon: "fa-regular fa-clock" },
                    { value: "occupied", label: "มีผู้เช่าแล้ว (Occupied)", icon: "fa-solid fa-user-check" },
                  ]}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: "8px 16px", border: "1px solid #ccc", background: "#fff", borderRadius: "6px", cursor: "pointer" }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary-action"
                  style={{ padding: "8px 20px" }}
                >
                  {submitting ? "กำลังบันทึก..." : "เพิ่มห้อง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
