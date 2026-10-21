import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  getAllDormitoriesAdmin,
  setDormitoryStatus,
  deleteDormitory,
  updateRecommendedDormitoriesOrder
} from "../../services/dormitoryService";
import { showConfirm, showAlert } from "../../context/ModalContext";

export default function AdminDormitories() {
  const [dorms, setDorms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [recommendList, setRecommendList] = useState([]);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadDorms = async () => {
    setLoading(true);
    try {
      const data = await getAllDormitoriesAdmin();
      setDorms(data);
    } catch (err) {
      console.error("Error loading dorms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDorms();
  }, []);

  const handleStatus = async (dormId, status) => {
    const statusLabel = status === "approved" ? "อนุมัติหอพัก" : status === "rejected" ? "ปฏิเสธหอพัก" : status;
    const isConfirmed = await showConfirm({
      title: "เปลี่ยนสถานะหอพัก",
      heading: `คุณต้องการ "${statusLabel}" ใช่หรือไม่?`,
      confirmText: "ยืนยัน",
      cancelText: "ยกเลิก",
      type: status === "rejected" ? "danger" : "warning"
    });
    if (!isConfirmed) return;

    try {
      await setDormitoryStatus(dormId, status);
      await showAlert({
        title: "สำเร็จ",
        heading: "เปลี่ยนสถานะเรียบร้อยแล้ว",
        type: "success"
      });
      loadDorms();
    } catch (err) {
      console.error(err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถเปลี่ยนสถานะได้",
        message: err.message || "",
        type: "danger"
      });
    }
  };

  const handleDelete = async (dormId) => {
    const isConfirmed = await showConfirm({
      title: "ลบหอพัก",
      heading: "คุณแน่ใจหรือไม่ว่าต้องการลบหอพักนี้?",
      message: "ข้อมูลหอพักทั้งหมดจะถูกลบออกจากระบบและไม่สามารถกู้คืนได้",
      confirmText: "ลบหอพัก",
      cancelText: "ยกเลิก",
      type: "danger"
    });

    if (isConfirmed) {
      try {
        await deleteDormitory(dormId);
        await showAlert({
          title: "ลบหอพักสำเร็จ",
          heading: "ลบหอพักเรียบร้อยแล้ว!",
          type: "success"
        });
        loadDorms();
      } catch (err) {
        console.error(err);
        await showAlert({
          title: "เกิดข้อผิดพลาด",
          heading: "ไม่สามารถลบหอพักได้",
          message: err.message || "",
          type: "danger"
        });
      }
    }
  };

  const handleOpenOrderModal = () => {
    const approvedDorms = dorms.filter((d) => d.status === "approved");
    const sorted = [...approvedDorms].sort((a, b) => {
      if ((b.isRecommended || 0) !== (a.isRecommended || 0)) {
        return (b.isRecommended || 0) - (a.isRecommended || 0);
      }
      return (a.recommendedOrder || 999) - (b.recommendedOrder || 999);
    });

    setRecommendList(
      sorted.map((item, index) => ({
        ...item,
        isRecommended: item.isRecommended ? 1 : 0,
        recommendedOrder: item.recommendedOrder || index + 1
      }))
    );
    setShowOrderModal(true);
  };

  const handleToggleRecommended = (id) => {
    setRecommendList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRecommended: item.isRecommended ? 0 : 1 } : item
      )
    );
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setRecommendList((prev) => {
      const newList = [...prev];
      const temp = newList[index - 1];
      newList[index - 1] = newList[index];
      newList[index] = temp;
      return newList.map((item, idx) => ({ ...item, recommendedOrder: idx + 1 }));
    });
  };

  const handleMoveDown = (index) => {
    if (index === recommendList.length - 1) return;
    setRecommendList((prev) => {
      const newList = [...prev];
      const temp = newList[index + 1];
      newList[index + 1] = newList[index];
      newList[index] = temp;
      return newList.map((item, idx) => ({ ...item, recommendedOrder: idx + 1 }));
    });
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      const payload = recommendList.map((item, idx) => ({
        id: item.id,
        isRecommended: item.isRecommended ? 1 : 0,
        recommendedOrder: item.isRecommended ? idx + 1 : 999
      }));

      await updateRecommendedDormitoriesOrder(payload);
      await showAlert({
        title: "สำเร็จ",
        heading: "บันทึกการจัดเรียงหอพักแนะนำเรียบร้อยแล้ว",
        type: "success"
      });
      setShowOrderModal(false);
      loadDorms();
    } catch (err) {
      console.error("Save recommended order error:", err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถบันทึกการจัดเรียงได้",
        message: err.message || "",
        type: "danger"
      });
    } finally {
      setSavingOrder(false);
    }
  };

  const filteredDorms = filterStatus === "all"
    ? dorms
    : dorms.filter((d) => d.status === filterStatus);

  const statusOptions = [
    { key: "all", label: "ทั้งหมด", count: dorms.length, icon: "fa-solid fa-layer-group" },
    { key: "pending", label: "รอตรวจสอบ", count: dorms.filter((d) => d.status === "pending").length, icon: "fa-solid fa-clock" },
    { key: "approved", label: "อนุมัติแล้ว", count: dorms.filter((d) => d.status === "approved").length, icon: "fa-solid fa-circle-check" },
    { key: "rejected", label: "ไม่อนุมัติ", count: dorms.filter((d) => d.status === "rejected").length, icon: "fa-solid fa-circle-xmark" },
  ];
  const currentStatusOption = statusOptions.find((o) => o.key === filterStatus) || statusOptions[0];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", color: "#333", fontWeight: 700 }}>จัดการหอพักทั้งหมด</h1>
          <p style={{ color: "#777", fontSize: "14px" }}>ตรวจสอบ อนุมัติ ปฏิเสธ หรือจัดเรียงลำดับหอพักแนะนำ</p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={handleOpenOrderModal}
            style={{
              background: "#2e7d32",
              color: "#ffffff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13.5px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(46, 125, 50, 0.25)"
            }}
          >
            <i className="fa-solid fa-list-ol"></i>
            <span>จัดเรียงหอพักแนะนำ (โปรโมต)</span>
          </button>

          {/* Status Filter Dropdown */}
          <div ref={statusDropdownRef} style={{ position: "relative", width: "185px" }}>
            <button
              type="button"
              onClick={() => setStatusDropdownOpen((prev) => !prev)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                padding: "8px 12px",
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
                  const isSelected = filterStatus === opt.key;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => {
                        setFilterStatus(opt.key);
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
      </div>

      <div className="content-card">
        <div className="content-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#7da27c" }}>
              <i className="fa-solid fa-spinner fa-spin"></i> กำลังโหลดข้อมูล...
            </div>
          ) : filteredDorms.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#888" }}>
              ไม่พบข้อมูลหอพักตามเงื่อนไข
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="table-responsive desktop-table-view">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ชื่อหอพัก</th>
                      <th>เจ้าของ</th>
                      <th>อำเภอ</th>
                      <th>ช่วงราคา</th>
                      <th>หอพักแนะนำ</th>
                      <th>สถานะ</th>
                      <th>การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDorms.map((dorm) => (
                      <tr key={dorm.id}>
                        <td><strong>{dorm.name}</strong></td>
                        <td>{dorm.ownerName || dorm.ownerId}</td>
                        <td>{dorm.district || "เมืองเลย"}</td>
                        <td>{Number(dorm.priceMin || 0).toLocaleString()} - {Number(dorm.priceMax || 0).toLocaleString()} บาท</td>
                        <td>
                          {dorm.isRecommended ? (
                            <span
                              style={{
                                background: "#fef3c7",
                                color: "#d97706",
                                padding: "4px 10px",
                                borderRadius: "999px",
                                fontSize: "12px",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <i className="fa-solid fa-star"></i> แนะนำ #{dorm.recommendedOrder || 1}
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "12.5px" }}>ทั่วไป</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${dorm.status}`}>
                            {dorm.status === "approved" ? "อนุมัติแล้ว" :
                             dorm.status === "rejected" ? "ไม่อนุมัติ" : "รอตรวจสอบ"}
                          </span>
                        </td>
                        <td>
                          <div className="btn-action-group">
                            {dorm.status !== "approved" && (
                              <button
                                onClick={() => handleStatus(dorm.id, "approved")}
                                style={{
                                  backgroundColor: "#e8f5e9",
                                  color: "#2e7d32",
                                  border: "1px solid #c8e6c9",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                                title="อนุมัติ"
                              >
                                <i className="fa-solid fa-check"></i> อนุมัติ
                              </button>
                            )}
                            {dorm.status !== "rejected" && (
                              <button
                                onClick={() => handleStatus(dorm.id, "rejected")}
                                style={{
                                  backgroundColor: "#fff8e1",
                                  color: "#f57f17",
                                  border: "1px solid #ffe082",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                                title="ปฏิเสธ"
                              >
                                <i className="fa-solid fa-ban"></i> ปฏิเสธ
                              </button>
                            )}
                            <Link to={`/dorms/${dorm.id}`}>
                              <button
                                className="btn-icon"
                                title="ดูหน้าเว็บ"
                                style={{
                                  backgroundColor: "#f8fafc",
                                  color: "#334155",
                                  border: "1px solid #cbd5e1"
                                }}
                              >
                                <i className="fa-solid fa-eye"></i>
                              </button>
                            </Link>
                            {dorm.ownerId && (
                              <Link to={`/admin/messages?ownerId=${dorm.ownerId}&dormId=${dorm.id}&ownerName=${encodeURIComponent(dorm.ownerName || "เจ้าของหอพัก")}&dormName=${encodeURIComponent(dorm.name)}`}>
                                <button
                                  className="btn-icon"
                                  title="แชทกับเจ้าของหอพัก"
                                  style={{
                                    backgroundColor: "#e8f5e9",
                                    color: "#2e7d32",
                                    border: "1px solid #c8e6c9"
                                  }}
                                >
                                  <i className="fa-solid fa-comments"></i>
                                </button>
                              </Link>
                            )}
                            <button
                              className="btn-icon delete"
                              onClick={() => handleDelete(dorm.id)}
                              title="ลบหอพัก"
                              style={{
                                backgroundColor: "#fef2f2",
                                color: "#dc2626",
                                border: "1px solid #fecaca"
                              }}
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="mobile-cards-view" style={{ padding: "12px" }}>
                {filteredDorms.map((dorm) => (
                  <div key={dorm.id} className="admin-dorm-card" style={{ marginBottom: "14px" }}>
                    <div className="admin-dorm-card-header">
                      <div className="admin-dorm-card-title">{dorm.name}</div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {dorm.isRecommended ? (
                          <span style={{ background: "#fef3c7", color: "#d97706", padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700 }}>
                            ★ #{dorm.recommendedOrder || 1}
                          </span>
                        ) : null}
                        <span className={`status-badge ${dorm.status}`}>
                          {dorm.status === "approved" ? "อนุมัติแล้ว" :
                           dorm.status === "rejected" ? "ไม่อนุมัติ" : "รอตรวจสอบ"}
                        </span>
                      </div>
                    </div>

                    <div className="admin-dorm-card-body">
                      <div className="admin-dorm-detail-item">
                        <span className="label">เจ้าของ:</span>
                        <span className="value">{dorm.ownerName || dorm.ownerId}</span>
                      </div>
                      <div className="admin-dorm-detail-item">
                        <span className="label">ทำเล / อำเภอ:</span>
                        <span className="value">{dorm.district || "เมืองเลย"}</span>
                      </div>
                      <div className="admin-dorm-detail-item">
                        <span className="label">ช่วงราคา:</span>
                        <span className="value">
                          {Number(dorm.priceMin || 0).toLocaleString()} - {Number(dorm.priceMax || 0).toLocaleString()} บาท
                        </span>
                      </div>
                    </div>

                    <div className="admin-dorm-card-footer" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {dorm.status !== "approved" && (
                        <button
                          onClick={() => handleStatus(dorm.id, "approved")}
                          style={{
                            backgroundColor: "#e8f5e9",
                            color: "#2e7d32",
                            border: "1px solid #c8e6c9",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "500",
                            cursor: "pointer"
                          }}
                        >
                          <i className="fa-solid fa-check"></i> อนุมัติ
                        </button>
                      )}
                      {dorm.status !== "rejected" && (
                        <button
                          onClick={() => handleStatus(dorm.id, "rejected")}
                          style={{
                            backgroundColor: "#fff8e1",
                            color: "#f57f17",
                            border: "1px solid #ffe082",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "500",
                            cursor: "pointer"
                          }}
                        >
                          <i className="fa-solid fa-ban"></i> ปฏิเสธ
                        </button>
                      )}
                      <Link to={`/dorms/${dorm.id}`} style={{ textDecoration: "none" }}>
                        <button
                          style={{
                            width: "100%",
                            backgroundColor: "#f8fafc",
                            color: "#334155",
                            border: "1px solid #cbd5e1",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "500",
                            cursor: "pointer"
                          }}
                        >
                          <i className="fa-solid fa-eye"></i> ดูหน้าเว็บ
                        </button>
                      </Link>
                      {dorm.ownerId && (
                        <Link
                          to={`/admin/messages?ownerId=${dorm.ownerId}&dormId=${dorm.id}&ownerName=${encodeURIComponent(dorm.ownerName || "เจ้าของหอพัก")}&dormName=${encodeURIComponent(dorm.name)}`}
                          style={{ textDecoration: "none" }}
                        >
                          <button
                            style={{
                              width: "100%",
                              backgroundColor: "#e8f5e9",
                              color: "#2e7d32",
                              border: "1px solid #c8e6c9",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "500",
                              cursor: "pointer"
                            }}
                          >
                            <i className="fa-solid fa-comments"></i> แชท
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(dorm.id)}
                        style={{
                          gridColumn: dorm.status === "pending" ? "span 2" : "span 1",
                          backgroundColor: "#fef2f2",
                          color: "#dc2626",
                          border: "1px solid #fecaca",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer"
                        }}
                      >
                        <i className="fa-solid fa-trash-can"></i> ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal จัดเรียงหอพักแนะนำ */}
      {showOrderModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(3px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              overflow: "hidden"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc"
              }}
            >
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="fa-solid fa-star" style={{ color: "#d97706" }}></i>
                  <span>จัดเรียงหอพักแนะนำ (โปรโมต / สปอนเซอร์)</span>
                </h2>
                <p style={{ color: "#64748b", fontSize: "12.5px", margin: "4px 0 0 0" }}>
                  เปิด-ปิดสถานะแนะนำ และปรับลำดับ (1, 2, 3...) เพื่อให้หอพักสปอนเซอร์ขึ้นอันดับแรก
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "6px"
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Body: List of dormitories */}
            <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
              {recommendList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                  ยังไม่มีหอพักที่ได้รับการอนุมัติในระบบ
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recommendList.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        padding: "14px 16px",
                        borderRadius: "14px",
                        border: item.isRecommended ? "1.5px solid #fcd34d" : "1px solid #e2e8f0",
                        background: item.isRecommended ? "#fffdf5" : "#ffffff",
                        boxShadow: item.isRecommended ? "0 2px 8px rgba(245, 158, 11, 0.08)" : "0 1px 3px rgba(0,0,0,0.02)",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {/* Top Row: Rank Badge + Dorm Info */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        {/* Rank Badge */}
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "10px",
                            background: item.isRecommended ? "#d97706" : "#f1f5f9",
                            color: item.isRecommended ? "#ffffff" : "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: 800,
                            flexShrink: 0,
                            boxShadow: item.isRecommended ? "0 2px 6px rgba(217, 119, 6, 0.25)" : "none"
                          }}
                        >
                          {index + 1}
                        </div>

                        {/* Dorm Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", wordBreak: "break-word" }}>
                              {item.name}
                            </span>
                            {item.isRecommended && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  background: "#fef3c7",
                                  color: "#b45309",
                                  border: "1px solid #fde68a",
                                  padding: "1px 8px",
                                  borderRadius: "12px",
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px"
                                }}
                              >
                                <i className="fa-solid fa-star" style={{ fontSize: "9px" }}></i> แนะนำ
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <span>
                              <i className="fa-regular fa-user" style={{ marginRight: "4px", color: "#94a3b8" }}></i>
                              เจ้าของ: {item.ownerName || "ไม่ระบุ"}
                            </span>
                            <span style={{ color: "#cbd5e1" }}>•</span>
                            <span>
                              <i className="fa-solid fa-location-dot" style={{ marginRight: "4px", color: "#94a3b8" }}></i>
                              {item.district || "เมืองเลย"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Actions (Move Up/Down & Toggle Recommend) */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                          paddingTop: "10px",
                          borderTop: "1px dashed",
                          borderColor: item.isRecommended ? "#fde68a" : "#f1f5f9",
                          flexWrap: "wrap"
                        }}
                      >
                        {/* Move Order Buttons */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>ปรับลำดับ:</span>
                          <button
                            type="button"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            style={{
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              padding: "5px 10px",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: index === 0 ? "not-allowed" : "pointer",
                              opacity: index === 0 ? 0.35 : 1,
                              color: "#334155",
                              fontWeight: 500
                            }}
                            title="เลื่อนขึ้น"
                          >
                            <i className="fa-solid fa-arrow-up" style={{ fontSize: "11px" }}></i>
                            <span>ขึ้น</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === recommendList.length - 1}
                            style={{
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              padding: "5px 10px",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: index === recommendList.length - 1 ? "not-allowed" : "pointer",
                              opacity: index === recommendList.length - 1 ? 0.35 : 1,
                              color: "#334155",
                              fontWeight: 500
                            }}
                            title="เลื่อนลง"
                          >
                            <i className="fa-solid fa-arrow-down" style={{ fontSize: "11px" }}></i>
                            <span>ลง</span>
                          </button>
                        </div>

                        {/* Toggle Recommended Status Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleRecommended(item.id)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "8px",
                            border: "1px solid",
                            borderColor: item.isRecommended ? "#f59e0b" : "#cbd5e1",
                            background: item.isRecommended ? "#fef3c7" : "#f8fafc",
                            color: item.isRecommended ? "#b45309" : "#475569",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.15s ease"
                          }}
                        >
                          <i
                            className={item.isRecommended ? "fa-solid fa-star" : "fa-regular fa-star"}
                            style={{ color: item.isRecommended ? "#d97706" : "#94a3b8" }}
                          ></i>
                          <span>{item.isRecommended ? "แนะนำอยู่ (คลิกยกเลิก)" : "ตั้งเป็นแนะนำ"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                background: "#f8fafc"
              }}
            >
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                disabled={savingOrder}
                style={{
                  background: "#ffffff",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleSaveOrder}
                disabled={savingOrder}
                style={{
                  background: "#2e7d32",
                  color: "#ffffff",
                  border: "none",
                  padding: "9px 22px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 8px rgba(46, 125, 50, 0.3)"
                }}
              >
                {savingOrder ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    <span>บันทึกการจัดเรียง</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
