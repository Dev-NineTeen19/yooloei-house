import { useState, useEffect, useRef } from "react";
import { getLocations, addLocation, updateLocation, deleteLocation, verifyDormLocation } from "../../services/locationService";
import { getRoomTypes, addRoomType, updateRoomType, deleteRoomType } from "../../services/roomTypeService";
import { getAllDormitoriesAdmin } from "../../services/dormitoryService";
import MapPreview from "../../components/map/MapPreview";
import { showConfirm, showAlert } from "../../context/ModalContext";
import "../../styles/dashboard.css";

export default function AdminLocations() {
  const [activeTab, setActiveTab] = useState("locations"); // "locations" | "roomTypes" | "verifyLocations"

  // Location state
  const [locations, setLocations] = useState([]);
  const [locLoading, setLocLoading] = useState(true);
  const [locSearchQuery, setLocSearchQuery] = useState("");
  const [showLocModal, setShowLocModal] = useState(false);
  const [editingLocId, setEditingLocId] = useState(null);
  const [locName, setLocName] = useState("");
  const [locDescription, setLocDescription] = useState("");
  const [locErrorMsg, setLocErrorMsg] = useState("");
  const [locSuccessMsg, setLocSuccessMsg] = useState("");
  const [locSaving, setLocSaving] = useState(false);

  // Room Type state
  const [roomTypes, setRoomTypes] = useState([]);
  const [rtLoading, setRtLoading] = useState(true);
  const [rtSearchQuery, setRtSearchQuery] = useState("");
  const [showRtModal, setShowRtModal] = useState(false);
  const [editingRtId, setEditingRtId] = useState(null);
  const [rtName, setRtName] = useState("");
  const [rtCategory, setRtCategory] = useState("รูปแบบการเช่า");
  const [rtDescription, setRtDescription] = useState("");
  const [rtErrorMsg, setRtErrorMsg] = useState("");
  const [rtSuccessMsg, setRtSuccessMsg] = useState("");
  const [rtSaving, setRtSaving] = useState(false);

  // Dorm Location Verification state
  const [dorms, setDorms] = useState([]);
  const [dormsLoading, setDormsLoading] = useState(false);
  const [dormLocFilter, setDormLocFilter] = useState("all"); // "all" | "pending" | "verified" | "action_needed"
  const [dormLocDropdownOpen, setDormLocDropdownOpen] = useState(false);
  const dormLocDropdownRef = useRef(null);
  const [openDormInfoId, setOpenDormInfoId] = useState(null);
  const [dormLocSearch, setDormLocSearch] = useState("");
  const [inspectingDorm, setInspectingDorm] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch functions
  const fetchLocationsList = async () => {
    setLocLoading(true);
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (err) {
      console.error("Failed to load locations:", err);
    } finally {
      setLocLoading(false);
    }
  };

  const fetchRoomTypesList = async () => {
    setRtLoading(true);
    try {
      const data = await getRoomTypes();
      setRoomTypes(data);
    } catch (err) {
      console.error("Failed to load room types:", err);
    } finally {
      setRtLoading(false);
    }
  };

  const fetchDormsList = async () => {
    setDormsLoading(true);
    try {
      const data = await getAllDormitoriesAdmin();
      setDorms(data || []);
    } catch (err) {
      console.error("Failed to load dormitories for location verification:", err);
    } finally {
      setDormsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationsList();
    fetchRoomTypesList();
    fetchDormsList();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dormLocDropdownRef.current && !dormLocDropdownRef.current.contains(event.target)) {
        setDormLocDropdownOpen(false);
      }
      if (!event.target.closest(".dorm-info-dropdown-container")) {
        setOpenDormInfoId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Location Handlers
  const handleOpenAddLocModal = () => {
    setEditingLocId(null);
    setLocName("");
    setLocDescription("");
    setLocErrorMsg("");
    setLocSuccessMsg("");
    setShowLocModal(true);
  };

  const handleOpenEditLocModal = (loc) => {
    setEditingLocId(loc.id);
    setLocName(loc.name || "");
    setLocDescription(loc.description || "");
    setLocErrorMsg("");
    setLocSuccessMsg("");
    setShowLocModal(true);
  };

  const handleSaveLoc = async (e) => {
    e.preventDefault();
    if (!locName.trim()) {
      setLocErrorMsg("กรุณาระบุชื่อพื้นที่/โซน");
      return;
    }

    if (editingLocId) {
      const isConfirmed = await showConfirm({
        title: "แก้ไขพื้นที่",
        heading: `ยืนยันการแก้ไขข้อมูลพื้นที่ "${locName}" ใช่หรือไม่?`,
        confirmText: "บันทึกการแก้ไข",
        cancelText: "ยกเลิก",
        type: "warning"
      });
      if (!isConfirmed) return;
    }

    setLocSaving(true);
    setLocErrorMsg("");
    setLocSuccessMsg("");

    try {
      if (editingLocId) {
        await updateLocation(editingLocId, locName.trim(), locDescription.trim());
        setLocSuccessMsg("แก้ไขข้อมูลพื้นที่เรียบร้อยแล้ว");
      } else {
        await addLocation(locName.trim(), locDescription.trim());
        setLocSuccessMsg("เพิ่มพื้นที่ใหม่เรียบร้อยแล้ว");
      }

      await fetchLocationsList();
      setTimeout(() => {
        setShowLocModal(false);
        setLocSuccessMsg("");
      }, 1200);
    } catch (err) {
      setLocErrorMsg(err.error || err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLocSaving(false);
    }
  };

  const handleDeleteLoc = async (id, name) => {
    const isConfirmed = await showConfirm({
      title: "ลบพื้นที่",
      heading: `คุณแน่ใจหรือไม่ว่าต้องการลบพื้นที่ "${name}"?`,
      message: "ข้อมูลพื้นที่นี้จะถูกลบออกจากระบบอย่างถาวร",
      confirmText: "ลบพื้นที่",
      cancelText: "ยกเลิก",
      type: "danger"
    });
    if (!isConfirmed) return;

    try {
      await deleteLocation(id);
      await showAlert({
        title: "สำเร็จ",
        heading: "ลบพื้นที่เรียบร้อยแล้ว!",
        type: "success"
      });
      await fetchLocationsList();
    } catch (err) {
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถลบพื้นที่ได้",
        message: err.error || err.message || "",
        type: "danger"
      });
    }
  };

  // Room Type Handlers
  const handleOpenAddRtModal = () => {
    setEditingRtId(null);
    setRtName("");
    setRtCategory("รูปแบบการเช่า");
    setRtDescription("");
    setRtErrorMsg("");
    setRtSuccessMsg("");
    setShowRtModal(true);
  };

  const handleOpenEditRtModal = (rt) => {
    setEditingRtId(rt.id);
    setRtName(rt.name || "");
    setRtCategory(rt.category || "รูปแบบการเช่า");
    setRtDescription(rt.description || "");
    setRtErrorMsg("");
    setRtSuccessMsg("");
    setShowRtModal(true);
  };

  const handleSaveRt = async (e) => {
    e.preventDefault();
    if (!rtName.trim()) {
      setRtErrorMsg("กรุณาระบุชื่อประเภทห้อง/การเช่า");
      return;
    }

    if (editingRtId) {
      const isConfirmed = await showConfirm({
        title: "แก้ไขประเภทห้อง",
        heading: `ยืนยันการแก้ไขประเภทห้อง "${rtName}" ใช่หรือไม่?`,
        confirmText: "บันทึกการแก้ไข",
        cancelText: "ยกเลิก",
        type: "warning"
      });
      if (!isConfirmed) return;
    }

    setRtSaving(true);
    setRtErrorMsg("");
    setRtSuccessMsg("");

    try {
      if (editingRtId) {
        await updateRoomType(editingRtId, rtName.trim(), rtCategory, rtDescription.trim());
        setRtSuccessMsg("แก้ไขประเภทห้อง/การเช่าเรียบร้อยแล้ว");
      } else {
        await addRoomType(rtName.trim(), rtCategory, rtDescription.trim());
        setRtSuccessMsg("เพิ่มประเภทห้อง/การเช่าใหม่เรียบร้อยแล้ว");
      }

      await fetchRoomTypesList();
      setTimeout(() => {
        setShowRtModal(false);
        setRtSuccessMsg("");
      }, 1200);
    } catch (err) {
      setRtErrorMsg(err.error || err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setRtSaving(false);
    }
  };

  const handleDeleteRt = async (id, name) => {
    const isConfirmed = await showConfirm({
      title: "ลบประเภทห้อง",
      heading: `คุณแน่ใจหรือไม่ว่าต้องการลบประเภทห้อง "${name}"?`,
      message: "ข้อมูลประเภทห้องนี้จะถูกลบออกจากระบบอย่างถาวร",
      confirmText: "ลบประเภทห้อง",
      cancelText: "ยกเลิก",
      type: "danger"
    });
    if (!isConfirmed) return;

    try {
      await deleteRoomType(id);
      await showAlert({
        title: "สำเร็จ",
        heading: "ลบประเภทห้องเรียบร้อยแล้ว!",
        type: "success"
      });
      await fetchRoomTypesList();
    } catch (err) {
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถลบประเภทห้องได้",
        message: err.error || err.message || "",
        type: "danger"
      });
    }
  };

  // Dorm Location Verification Handlers
  const handleOpenInspectModal = (dorm) => {
    setInspectingDorm(dorm);
    setRejectReason(dorm.locationRejectReason || dorm.location_reject_reason || "");
    setShowRejectInput(false);
  };

  const handleVerifyLocationStatus = async (status) => {
    if (!inspectingDorm) return;

    if (status === "action_needed" && !showRejectInput) {
      setShowRejectInput(true);
      return;
    }

    if (status === "action_needed" && !rejectReason.trim()) {
      await showAlert({
        title: "กรุณาระบุเหตุผล",
        heading: "กรุณากรอกเหตุผลที่ต้องให้เจ้าของหอพักแก้ไขพิกัด",
        type: "warning"
      });
      return;
    }

    const isConfirmed = await showConfirm({
      title: status === "verified" ? "ยืนยันพิกัดตำแหน่ง" : "แจ้งให้แก้ไขพิกัด",
      heading: status === "verified"
        ? `ยืนยันว่าพิกัดตำแหน่งของหอพัก "${inspectingDorm.name}" ถูกต้องใช่หรือไม่?`
        : `ส่งคำขอให้เจ้าของหอพัก "${inspectingDorm.name}" แก้ไขพิกัดใช่หรือไม่?`,
      confirmText: status === "verified" ? "ยืนยันตำแหน่ง" : "ส่งคำขอแก้ไข",
      cancelText: "ยกเลิก",
      type: status === "verified" ? "success" : "danger"
    });
    if (!isConfirmed) return;

    setIsVerifying(true);
    try {
      await verifyDormLocation(inspectingDorm.id, status, rejectReason.trim());
      await showAlert({
        title: "สำเร็จ",
        heading: status === "verified" ? "ยืนยันพิกัดตำแหน่งหอพักเรียบร้อยแล้ว" : "ส่งคำขอให้แก้ไขพิกัดเรียบร้อยแล้ว",
        type: "success"
      });
      setInspectingDorm(null);
      setShowRejectInput(false);
      setRejectReason("");
      await fetchDormsList();
    } catch (err) {
      console.error("Failed to verify location:", err);
      await showAlert({
        title: "เกิดข้อผิดพลาด",
        heading: "ไม่สามารถบันทึกสถานะพิกัดได้",
        message: err.message || "",
        type: "danger"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const pendingDormLocCount = dorms.filter((d) => {
    const s = d.locationStatus || d.location_status;
    return s === "pending" || (!s && d.latitude && d.longitude);
  }).length;

  const verifiedDormLocCount = dorms.filter(
    (d) => (d.locationStatus || d.location_status) === "verified"
  ).length;

  const actionNeededDormLocCount = dorms.filter((d) => {
    const s = d.locationStatus || d.location_status;
    return s === "action_needed" || s === "rejected";
  }).length;

  const dormLocFilterOptions = [
    { value: "all", label: "ทั้งหมด", count: dorms.length, icon: "fa-solid fa-list", color: "#5b8e66" },
    { value: "pending", label: "รอตรวจสอบ", count: pendingDormLocCount, icon: "fa-solid fa-clock", color: "#ca8a04" },
    { value: "verified", label: "ยืนยันแล้ว", count: verifiedDormLocCount, icon: "fa-solid fa-circle-check", color: "#16a34a" },
    { value: "action_needed", label: "ต้องแก้ไข", count: actionNeededDormLocCount, icon: "fa-solid fa-triangle-exclamation", color: "#dc2626" }
  ];

  const currentDormLocOption =
    dormLocFilterOptions.find((opt) => opt.value === dormLocFilter) || dormLocFilterOptions[0];

  const filteredDormsForLoc = dorms.filter((d) => {
    const status = d.locationStatus || d.location_status || (d.latitude && d.longitude ? "pending" : "none");
    const matchesFilter =
      dormLocFilter === "all" ||
      (dormLocFilter === "pending" && (status === "pending" || (!d.locationStatus && !d.location_status && d.latitude && d.longitude))) ||
      (dormLocFilter === "verified" && status === "verified") ||
      (dormLocFilter === "action_needed" && (status === "action_needed" || status === "rejected"));

    const query = dormLocSearch.toLowerCase();
    const matchesSearch =
      !dormLocSearch ||
      (d.name || "").toLowerCase().includes(query) ||
      (d.address || "").toLowerCase().includes(query) ||
      (d.district || d.zone || "").toLowerCase().includes(query) ||
      (d.ownerName || d.owner_name || "").toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  // Filtered lists
  const filteredLocations = locations.filter((loc) =>
    (loc.name || "").toLowerCase().includes(locSearchQuery.toLowerCase()) ||
    (loc.description || "").toLowerCase().includes(locSearchQuery.toLowerCase())
  );

  const filteredRoomTypes = roomTypes.filter((rt) =>
    (rt.name || "").toLowerCase().includes(rtSearchQuery.toLowerCase()) ||
    (rt.category || "").toLowerCase().includes(rtSearchQuery.toLowerCase()) ||
    (rt.description || "").toLowerCase().includes(rtSearchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-page admin-locations-page">
      {/* Page Header */}
      <div className="admin-loc-header">
        <h2 className="admin-loc-header-title">
          <i className="fa-solid fa-map-location-dot" style={{ color: "#7da27c" }}></i>
          จัดการพื้นที่ & ประเภทห้องพัก
        </h2>
        <p className="admin-loc-header-sub">
          เพิ่ม แก้ไข และจัดการพื้นที่/โซน, ประเภทห้องพัก และตรวจสอบพิกัดตำแหน่งหอพักในระบบ
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-loc-tabs">
        <button
          onClick={() => setActiveTab("locations")}
          className="admin-loc-tab-btn"
          style={{
            color: activeTab === "locations" ? "#5b8e66" : "#64748b",
            borderBottom: activeTab === "locations" ? "3px solid #5b8e66" : "3px solid transparent"
          }}
        >
          <i className="fa-solid fa-location-dot"></i>
          จัดการพื้นที่ / โซนหอพัก ({locations.length})
        </button>

        <button
          onClick={() => setActiveTab("roomTypes")}
          className="admin-loc-tab-btn"
          style={{
            color: activeTab === "roomTypes" ? "#5b8e66" : "#64748b",
            borderBottom: activeTab === "roomTypes" ? "3px solid #5b8e66" : "3px solid transparent"
          }}
        >
          <i className="fa-solid fa-door-open"></i>
          จัดการประเภทห้อง / การเช่า ({roomTypes.length})
        </button>

        <button
          onClick={() => setActiveTab("verifyLocations")}
          className="admin-loc-tab-btn"
          style={{
            color: activeTab === "verifyLocations" ? "#5b8e66" : "#64748b",
            borderBottom: activeTab === "verifyLocations" ? "3px solid #5b8e66" : "3px solid transparent"
          }}
        >
          <i className="fa-solid fa-map-pin"></i>
          ตรวจสอบพิกัดหอพัก
          {pendingDormLocCount > 0 && (
            <span
              style={{
                backgroundColor: "#ef4444",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: "700",
                padding: "2px 7px",
                borderRadius: "10px"
              }}
            >
              {pendingDormLocCount}
            </span>
          )}
        </button>
      </div>

      {/* =====================================================
                       TAB 1: LOCATIONS MANAGEMENT
      ===================================================== */}
      {activeTab === "locations" && (
        <div>
          <div className="admin-loc-controls">
            <div className="admin-loc-search-box">
              <input
                type="text"
                placeholder="ค้นหาชื่อพื้นที่/โซน..."
                value={locSearchQuery}
                onChange={(e) => setLocSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px 10px 40px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
              <i
                className="fa-solid fa-magnifying-glass"
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8"
                }}
              ></i>
            </div>

            <button
              onClick={handleOpenAddLocModal}
              className="admin-loc-btn-add"
            >
              <i className="fa-solid fa-plus"></i>
              เพิ่มพื้นที่ใหม่
            </button>
          </div>

          {/* Locations Desktop Table View & Mobile Cards View */}
          {locLoading ? (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "40px", textAlign: "center", color: "#64748b" }}>
              กำลังโหลดข้อมูลพื้นที่...
            </div>
          ) : filteredLocations.length === 0 ? (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "40px", textAlign: "center", color: "#64748b" }}>
              {locSearchQuery ? "ไม่พบข้อมูลพื้นที่ที่ตรงกับการค้นหา" : "ยังไม่มีข้อมูลพื้นที่ในระบบ"}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="admin-loc-table-card desktop-table-view">
                <table className="admin-loc-table">
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: "600", color: "#475569" }}>#</th>
                      <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: "600", color: "#475569" }}>ชื่อพื้นที่ / โซน</th>
                      <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: "600", color: "#475569" }}>รายละเอียด</th>
                      <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: "600", color: "#475569", textAlign: "right" }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLocations.map((loc, idx) => (
                      <tr key={loc.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#64748b" }}>{idx + 1}</td>
                        <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <i className="fa-solid fa-location-dot" style={{ color: "#7da27c", fontSize: "13px" }}></i>
                            {loc.name}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#64748b" }}>
                          {loc.description || "-"}
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <button
                            onClick={() => handleOpenEditLocModal(loc)}
                            style={{
                              backgroundColor: "#f1f5f9",
                              color: "#3b82f6",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 12px",
                              fontSize: "13px",
                              cursor: "pointer",
                              marginRight: "8px"
                            }}
                            title="แก้ไข"
                          >
                            <i className="fa-solid fa-pen"></i> แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteLoc(loc.id, loc.name)}
                            style={{
                              backgroundColor: "#fef2f2",
                              color: "#ef4444",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 12px",
                              fontSize: "13px",
                              cursor: "pointer"
                            }}
                            title="ลบ"
                          >
                            <i className="fa-solid fa-trash-can"></i> ลบ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="mobile-cards-view">
                {filteredLocations.map((loc) => (
                  <div key={loc.id} className="mobile-item-card">
                    <div className="mobile-item-card-header">
                      <div className="mobile-item-card-title">
                        <i className="fa-solid fa-location-dot" style={{ color: "#7da27c" }}></i>
                        {loc.name}
                      </div>
                    </div>

                    <div className="mobile-item-card-desc">
                      {loc.description || "ไม่มีคำอธิบายเพิ่มเติม"}
                    </div>

                    <div className="mobile-item-card-actions">
                      <button
                        onClick={() => handleOpenEditLocModal(loc)}
                        style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}
                      >
                        <i className="fa-solid fa-pen"></i> แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteLoc(loc.id, loc.name)}
                        style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
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
      )}

      {/* =====================================================
                     TAB 2: ROOM TYPES MANAGEMENT
      ===================================================== */}
      {activeTab === "roomTypes" && (
        <div>
          <div className="admin-loc-controls">
            <div className="admin-loc-search-box">
              <input
                type="text"
                placeholder="ค้นหาประเภทห้อง/การเช่า (เช่น รายวัน, รายเดือน)..."
                value={rtSearchQuery}
                onChange={(e) => setRtSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px 10px 40px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
              <i
                className="fa-solid fa-magnifying-glass"
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8"
                }}
              ></i>
            </div>

            <button
              onClick={handleOpenAddRtModal}
              className="admin-loc-btn-add"
            >
              <i className="fa-solid fa-plus"></i>
              เพิ่มประเภทห้องใหม่
            </button>
          </div>

          {/* Room Types Desktop Table View & Mobile Cards View */}
          {rtLoading ? (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "40px", textAlign: "center", color: "#64748b" }}>
              กำลังโหลดข้อมูลประเภทห้อง...
            </div>
          ) : filteredRoomTypes.length === 0 ? (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "40px", textAlign: "center", color: "#64748b" }}>
              {rtSearchQuery ? "ไม่พบข้อมูลประเภทห้องที่ตรงกับการค้นหา" : "ยังไม่มีข้อมูลประเภทห้องในระบบ"}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="admin-loc-table-card desktop-table-view">
                <table className="admin-loc-table">
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: "600", color: "#475569" }}>#</th>
                      <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: "600", color: "#475569" }}>ชื่อประเภทห้อง / รูปแบบเช่า</th>
                      <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: "600", color: "#475569" }}>หมวดหมู่</th>
                      <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: "600", color: "#475569" }}>คำอธิบาย</th>
                      <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: "600", color: "#475569", textAlign: "right" }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoomTypes.map((rt, idx) => (
                      <tr key={rt.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#64748b" }}>{idx + 1}</td>
                        <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <i className="fa-solid fa-door-closed" style={{ color: "#7da27c", fontSize: "13px" }}></i>
                            {rt.name}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px" }}>
                          <span
                            style={{
                              backgroundColor: rt.category === "รูปแบบการเช่า" ? "#e0f2fe" : "#f1f5f9",
                              color: rt.category === "รูปแบบการเช่า" ? "#0284c7" : "#475569",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontWeight: "600"
                            }}
                          >
                            {rt.category || "ทั่วไป"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "14px", color: "#64748b" }}>
                          {rt.description || "-"}
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <button
                            onClick={() => handleOpenEditRtModal(rt)}
                            style={{
                              backgroundColor: "#f1f5f9",
                              color: "#3b82f6",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 12px",
                              fontSize: "13px",
                              cursor: "pointer",
                              marginRight: "8px"
                            }}
                            title="แก้ไข"
                          >
                            <i className="fa-solid fa-pen"></i> แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteRt(rt.id, rt.name)}
                            style={{
                              backgroundColor: "#fef2f2",
                              color: "#ef4444",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 12px",
                              fontSize: "13px",
                              cursor: "pointer"
                            }}
                            title="ลบ"
                          >
                            <i className="fa-solid fa-trash-can"></i> ลบ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="mobile-cards-view">
                {filteredRoomTypes.map((rt) => (
                  <div key={rt.id} className="mobile-item-card">
                    <div className="mobile-item-card-header">
                      <div className="mobile-item-card-title">
                        <i className="fa-solid fa-door-closed" style={{ color: "#7da27c" }}></i>
                        {rt.name}
                      </div>
                      <span
                        style={{
                          backgroundColor: rt.category === "รูปแบบการเช่า" ? "#e0f2fe" : "#f1f5f9",
                          color: rt.category === "รูปแบบการเช่า" ? "#0284c7" : "#475569",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "11.5px",
                          fontWeight: "600"
                        }}
                      >
                        {rt.category || "ทั่วไป"}
                      </span>
                    </div>

                    <div className="mobile-item-card-desc">
                      {rt.description || "ไม่มีคำอธิบายเพิ่มเติม"}
                    </div>

                    <div className="mobile-item-card-actions">
                      <button
                        onClick={() => handleOpenEditRtModal(rt)}
                        style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}
                      >
                        <i className="fa-solid fa-pen"></i> แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteRt(rt.id, rt.name)}
                        style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
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
      )}

      {/* =====================================================
               TAB 3: DORM LOCATION VERIFICATION
      ===================================================== */}
      {activeTab === "verifyLocations" && (
        <div>
          {/* Stats Cards like AdminAnnouncements */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "20px"
            }}
          >
            <div
              onClick={() => setDormLocFilter("all")}
              style={{
                backgroundColor: "#ffffff",
                padding: "16px 20px",
                borderRadius: "12px",
                border: dormLocFilter === "all" ? "2px solid #5b8e66" : "1px solid #e2e8f0",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>หอพักทั้งหมด</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", marginTop: "4px" }}>
                {dorms.length}
              </div>
            </div>

            <div
              onClick={() => setDormLocFilter("pending")}
              style={{
                backgroundColor: "#ffffff",
                padding: "16px 20px",
                borderRadius: "12px",
                border: dormLocFilter === "pending" ? "2px solid #ca8a04" : "1px solid #e2e8f0",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ fontSize: "13px", color: "#ca8a04", fontWeight: "600" }}>
                <i className="fa-solid fa-clock" style={{ marginRight: "6px" }}></i>
                รอตรวจสอบ
              </div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#854d0e", marginTop: "4px" }}>
                {pendingDormLocCount}
              </div>
            </div>

            <div
              onClick={() => setDormLocFilter("verified")}
              style={{
                backgroundColor: "#ffffff",
                padding: "16px 20px",
                borderRadius: "12px",
                border: dormLocFilter === "verified" ? "2px solid #16a34a" : "1px solid #e2e8f0",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ fontSize: "13px", color: "#16a34a", fontWeight: "600" }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: "6px" }}></i>
                ยืนยันแล้ว
              </div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#166534", marginTop: "4px" }}>
                {verifiedDormLocCount}
              </div>
            </div>

            <div
              onClick={() => setDormLocFilter("action_needed")}
              style={{
                backgroundColor: "#ffffff",
                padding: "16px 20px",
                borderRadius: "12px",
                border: dormLocFilter === "action_needed" ? "2px solid #dc2626" : "1px solid #e2e8f0",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ fontSize: "13px", color: "#dc2626", fontWeight: "600" }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "6px" }}></i>
                ต้องแก้ไข
              </div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#991b1b", marginTop: "4px" }}>
                {actionNeededDormLocCount}
              </div>
            </div>
          </div>

          {/* Filter & Search Bar like AdminAnnouncements */}
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
                placeholder="ค้นหาชื่อหอพัก, เจ้าของ, ที่อยู่..."
                value={dormLocSearch}
                onChange={(e) => setDormLocSearch(e.target.value)}
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
              {dormLocSearch && (
                <i
                  className="fa-solid fa-xmark"
                  onClick={() => setDormLocSearch("")}
                  style={{ color: "#94a3b8", cursor: "pointer", fontSize: "12px" }}
                ></i>
              )}
            </div>

            {/* Status Filter Dropdown like AdminAnnouncements */}
            <div ref={dormLocDropdownRef} style={{ position: "relative", width: "190px" }}>
              <button
                type="button"
                onClick={() => setDormLocDropdownOpen((prev) => !prev)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  padding: "7px 12px",
                  background: "#ffffff",
                  border: "1px solid",
                  borderColor: dormLocDropdownOpen ? "#5b8e66" : "#e2e8f0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#334155",
                  cursor: "pointer",
                  boxShadow: dormLocDropdownOpen ? "0 0 0 2px rgba(91, 142, 102, 0.15)" : "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, overflow: "hidden" }}>
                  <i className={currentDormLocOption.icon} style={{ color: currentDormLocOption.color || "#5b8e66", fontSize: "13px", flexShrink: 0 }}></i>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {currentDormLocOption.label}
                    <span style={{ color: "#94a3b8", marginLeft: "4px", fontSize: "12px" }}>({currentDormLocOption.count})</span>
                  </span>
                </div>
                <i
                  className="fa-solid fa-chevron-down"
                  style={{
                    fontSize: "10px",
                    color: "#94a3b8",
                    flexShrink: 0,
                    transition: "transform 0.2s ease",
                    transform: dormLocDropdownOpen ? "rotate(180deg)" : "none"
                  }}
                ></i>
              </button>

              {dormLocDropdownOpen && (
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
                  {dormLocFilterOptions.map((opt) => {
                    const isSelected = dormLocFilter === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => {
                          setDormLocFilter(opt.value);
                          setDormLocDropdownOpen(false);
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

          {/* Main Content Card like AdminAnnouncements */}
          <div className="content-card" style={{ overflow: "visible" }}>
            <div className="content-card-body" style={{ padding: 0, overflow: "visible" }}>
              {dormsLoading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#7da27c" }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "10px", fontSize: "20px" }}></i>
                  <span>กำลังโหลดข้อมูลหอพัก...</span>
                </div>
              ) : filteredDormsForLoc.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <i className="fa-solid fa-map-location-dot" style={{ fontSize: "48px", color: "#cbd5e1", marginBottom: "16px" }}></i>
                  <h3 style={{ color: "#334155", fontWeight: 700, fontSize: "18px" }}>
                    {dormLocSearch ? "ไม่พบหอพักที่ตรงกับการค้นหา" : "ยังไม่มีรายการหอพักในหมวดหมู่นี้"}
                  </h3>
                  <p style={{ color: "#64748b", marginTop: "8px", fontSize: "14px" }}>
                    ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองสถานะใหม่อีกครั้ง
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="desktop-table-view table-responsive" style={{ overflow: "visible" }}>
                    <table className="custom-table" style={{ width: "100%", minWidth: "850px" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "50px", textAlign: "center", whiteSpace: "nowrap" }}>#</th>
                          <th style={{ minWidth: "220px", whiteSpace: "nowrap" }}>หอพัก</th>
                          <th style={{ width: "170px", textAlign: "center", whiteSpace: "nowrap" }}>ข้อมูลหอพัก</th>
                          <th style={{ width: "140px", whiteSpace: "nowrap", textAlign: "center" }}>สถานะพิกัด</th>
                          <th style={{ width: "150px", textAlign: "center", whiteSpace: "nowrap" }}>จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDormsForLoc.map((dorm, idx) => {
                          const status = dorm.locationStatus || dorm.location_status || (dorm.latitude && dorm.longitude ? "pending" : "none");
                          const hasCoord = dorm.latitude != null && dorm.longitude != null && !isNaN(Number(dorm.latitude));
                          const coverImg = dorm.coverImage || dorm.cover_image || (Array.isArray(dorm.images) ? dorm.images[0] : (typeof dorm.images === 'string' && dorm.images.startsWith('[') ? JSON.parse(dorm.images)[0] : dorm.images));
                          const isDropdownOpen = openDormInfoId === dorm.id;
                          const isLastRow = idx >= filteredDormsForLoc.length - 1 && filteredDormsForLoc.length > 1;

                          return (
                            <tr
                              key={dorm.id}
                              style={{
                                position: "relative",
                                zIndex: isDropdownOpen ? 9999 : 1
                              }}
                            >
                              <td style={{ textAlign: "center", color: "#64748b", fontSize: "13px" }}>{idx + 1}</td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  {coverImg ? (
                                    <img
                                      src={coverImg}
                                      alt={dorm.name}
                                      style={{
                                        width: "60px",
                                        height: "45px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
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
                                        width: "60px",
                                        height: "45px",
                                        borderRadius: "8px",
                                        backgroundColor: "#f1f5f9",
                                        border: "1px solid #e2e8f0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#94a3b8",
                                        flexShrink: 0
                                      }}
                                    >
                                      <i className="fa-solid fa-building" style={{ fontSize: "18px" }}></i>
                                    </div>
                                  )}
                                  <div>
                                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "14px", lineHeight: "1.4" }}>
                                      {dorm.name}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                      รหัส: #{dorm.id}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Dropdown column for Dorm Information & Coordinates like AdminAnnouncements */}
                              <td style={{ textAlign: "center", verticalAlign: "middle", position: "relative", zIndex: isDropdownOpen ? 10000 : "auto" }}>
                                <div className="dorm-info-dropdown-container" style={{ position: "relative", display: "inline-block", zIndex: isDropdownOpen ? 10001 : 1 }}>
                                  <button
                                    type="button"
                                    onClick={() => setOpenDormInfoId(isDropdownOpen ? null : dorm.id)}
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
                                    <span>ข้อมูลหอพัก</span>
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
                                        width: "260px",
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
                                      {/* 1. เจ้าของหอพัก */}
                                      <div style={{ marginBottom: "10px" }}>
                                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                                          เจ้าของหอพัก
                                        </div>
                                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                                          <i className="fa-solid fa-user-tie" style={{ color: "#7da27c", fontSize: "12px" }}></i>
                                          <span>{dorm.ownerName || dorm.owner_name || dorm.ownerEmail || "-"}</span>
                                        </div>
                                      </div>

                                      {/* 2. ที่อยู่ / อำเภอ */}
                                      <div style={{ marginBottom: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                                          ที่อยู่ / อำเภอ
                                        </div>
                                        <div style={{ fontSize: "13px", color: "#334155", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                                          <i className="fa-solid fa-location-dot" style={{ color: "#e11d48", fontSize: "12px", marginTop: "3px" }}></i>
                                          <span>{dorm.district || dorm.zone || dorm.address || "-"}</span>
                                        </div>
                                      </div>

                                      {/* 3. พิกัด (Lat, Lng) */}
                                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                                          พิกัด (Lat, Lng)
                                        </div>
                                        {hasCoord ? (
                                          <span
                                            style={{
                                              fontSize: "12px",
                                              fontFamily: "monospace",
                                              color: "#0369a1",
                                              backgroundColor: "#f0f9ff",
                                              border: "1px solid #bae6fd",
                                              padding: "3px 8px",
                                              borderRadius: "6px",
                                              display: "inline-flex",
                                              alignItems: "center",
                                              gap: "5px"
                                            }}
                                          >
                                            <i className="fa-solid fa-map-pin" style={{ color: "#0284c7", fontSize: "11px" }}></i>
                                            {Number(dorm.latitude).toFixed(5)}, {Number(dorm.longitude).toFixed(5)}
                                          </span>
                                        ) : (
                                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>ยังไม่ปักหมุด</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                {status === "verified" ? (
                                  <span
                                    style={{
                                      backgroundColor: "#eef8ee",
                                      color: "#2e7d32",
                                      border: "1px solid #c8e6c9",
                                      padding: "4px 10px",
                                      borderRadius: "999px",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      whiteSpace: "nowrap"
                                    }}
                                  >
                                    <i className="fa-solid fa-circle-check"></i> ยืนยันแล้ว
                                  </span>
                                ) : status === "action_needed" || status === "rejected" ? (
                                  <span
                                    style={{
                                      backgroundColor: "#fef2f2",
                                      color: "#dc2626",
                                      border: "1px solid #fecaca",
                                      padding: "4px 10px",
                                      borderRadius: "999px",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      whiteSpace: "nowrap"
                                    }}
                                  >
                                    <i className="fa-solid fa-triangle-exclamation"></i> ต้องแก้ไข
                                  </span>
                                ) : hasCoord ? (
                                  <span
                                    style={{
                                      backgroundColor: "#fff8e1",
                                      color: "#b45309",
                                      border: "1px solid #ffe082",
                                      padding: "4px 10px",
                                      borderRadius: "999px",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      whiteSpace: "nowrap"
                                    }}
                                  >
                                    <i className="fa-solid fa-clock"></i> รอตรวจสอบ
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      backgroundColor: "#f1f5f9",
                                      color: "#64748b",
                                      border: "1px solid #e2e8f0",
                                      padding: "4px 10px",
                                      borderRadius: "999px",
                                      fontSize: "12px",
                                      fontWeight: "500",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      whiteSpace: "nowrap"
                                    }}
                                  >
                                    ไม่มีพิกัด
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenInspectModal(dorm)}
                                  style={{
                                    backgroundColor: "#f0fdf4",
                                    color: "#166534",
                                    border: "1px solid #bbf7d0",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    fontSize: "12.5px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    transition: "all 0.15s ease",
                                    whiteSpace: "nowrap"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#dcfce7";
                                    e.currentTarget.style.borderColor = "#86efac";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#f0fdf4";
                                    e.currentTarget.style.borderColor = "#bbf7d0";
                                  }}
                                >
                                  <i className="fa-solid fa-map-location-dot" style={{ color: "#16a34a" }}></i>
                                  <span>ตรวจสอบตำแหน่ง</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View like AdminAnnouncements */}
                  <div className="mobile-cards-view" style={{ padding: "12px" }}>
                    {filteredDormsForLoc.map((dorm) => {
                      const status = dorm.locationStatus || dorm.location_status || (dorm.latitude && dorm.longitude ? "pending" : "none");
                      const hasCoord = dorm.latitude != null && dorm.longitude != null && !isNaN(Number(dorm.latitude));
                      const coverImg = dorm.coverImage || dorm.cover_image || (Array.isArray(dorm.images) ? dorm.images[0] : (typeof dorm.images === 'string' && dorm.images.startsWith('[') ? JSON.parse(dorm.images)[0] : dorm.images));

                      return (
                        <div
                          key={dorm.id}
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
                          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                            {coverImg ? (
                              <img
                                src={coverImg}
                                alt={dorm.name}
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
                                <i className="fa-solid fa-building" style={{ fontSize: "24px" }}></i>
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
                                {dorm.name}
                              </div>

                              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>
                                รหัส: #{dorm.id} • {dorm.ownerName || dorm.owner_name || "เจ้าของหอพัก"}
                              </div>

                              <div>
                                {status === "verified" ? (
                                  <span
                                    style={{
                                      backgroundColor: "#eef8ee",
                                      color: "#2e7d32",
                                      border: "1px solid #c8e6c9",
                                      padding: "3px 8px",
                                      borderRadius: "999px",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px"
                                    }}
                                  >
                                    <i className="fa-solid fa-circle-check"></i> ยืนยันแล้ว
                                  </span>
                                ) : status === "action_needed" || status === "rejected" ? (
                                  <span
                                    style={{
                                      backgroundColor: "#fef2f2",
                                      color: "#dc2626",
                                      border: "1px solid #fecaca",
                                      padding: "3px 8px",
                                      borderRadius: "999px",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px"
                                    }}
                                  >
                                    <i className="fa-solid fa-triangle-exclamation"></i> ต้องแก้ไข
                                  </span>
                                ) : hasCoord ? (
                                  <span
                                    style={{
                                      backgroundColor: "#fff8e1",
                                      color: "#b45309",
                                      border: "1px solid #ffe082",
                                      padding: "3px 8px",
                                      borderRadius: "999px",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px"
                                    }}
                                  >
                                    <i className="fa-solid fa-clock"></i> รอตรวจสอบ
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      backgroundColor: "#f1f5f9",
                                      color: "#64748b",
                                      border: "1px solid #e2e8f0",
                                      padding: "3px 8px",
                                      borderRadius: "999px",
                                      fontSize: "11px",
                                      fontWeight: "500"
                                    }}
                                  >
                                    ไม่มีพิกัด
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: "12.5px",
                              margin: "10px 0 12px 0",
                              paddingTop: "10px",
                              borderTop: "1px solid #f1f5f9",
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px"
                            }}
                          >
                            <div style={{ color: "#475569" }}>
                              <i className="fa-solid fa-location-dot" style={{ color: "#64748b", marginRight: "6px" }}></i>
                              อำเภอ/โซน: {dorm.district || dorm.zone || dorm.address || "-"}
                            </div>
                            <div style={{ color: hasCoord ? "#0284c7" : "#94a3b8", fontFamily: "monospace", fontSize: "12px" }}>
                              <i className="fa-solid fa-map-pin" style={{ marginRight: "6px" }}></i>
                              พิกัด: {hasCoord ? `${Number(dorm.latitude).toFixed(5)}, ${Number(dorm.longitude).toFixed(5)}` : "ยังไม่ได้ปักหมุด"}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenInspectModal(dorm)}
                            style={{
                              width: "100%",
                              backgroundColor: "#f0fdf4",
                              color: "#166534",
                              border: "1px solid #bbf7d0",
                              borderRadius: "8px",
                              padding: "10px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px"
                            }}
                          >
                            <i className="fa-solid fa-map-location-dot" style={{ color: "#16a34a" }}></i>
                            <span>ตรวจสอบตำแหน่ง</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Location */}
      {showLocModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 10000,
            padding: "90px 16px 24px 16px",
            overflowY: "auto"
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "480px",
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
            }}
          >
            <div
              style={{
                padding: "24px",
                maxHeight: "calc(100vh - 140px)",
                overflowY: "auto"
              }}
            >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                {editingLocId ? "แก้ไขพื้นที่ / โซน" : "เพิ่มพื้นที่ / โซนใหม่"}
              </h3>
              <button
                type="button"
                onClick={() => setShowLocModal(false)}
                style={{ background: "transparent", border: "none", outline: "none", boxShadow: "none", fontSize: "18px", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {locErrorMsg && (
              <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: "6px", fontSize: "14px", marginBottom: "14px" }}>
                {locErrorMsg}
              </div>
            )}

            {locSuccessMsg && (
              <div style={{ backgroundColor: "#f0fdf4", color: "#16a34a", padding: "10px 14px", borderRadius: "6px", fontSize: "14px", marginBottom: "14px" }}>
                {locSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveLoc}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  ชื่อพื้นที่ / โซน <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น กำเนิดเพชร, เชียงคาน, ราชภัฏเลย..."
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none"
                  }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  รายละเอียดเพิ่มเติม
                </label>
                <textarea
                  placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับพื้นที่นี้ (ถ้ามี)"
                  value={locDescription}
                  onChange={(e) => setLocDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowLocModal(false)}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "6px",
                    padding: "10px 18px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={locSaving}
                  style={{
                    backgroundColor: "#7da27c",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: locSaving ? "not-allowed" : "pointer",
                    opacity: locSaving ? 0.7 : 1
                  }}
                >
                  {locSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Room Type */}
      {showRtModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 10000,
            padding: "90px 16px 24px 16px",
            overflowY: "auto"
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "480px",
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
            }}
          >
            <div
              style={{
                padding: "24px",
                maxHeight: "calc(100vh - 140px)",
                overflowY: "auto"
              }}
            >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                {editingRtId ? "แก้ไขประเภทห้อง / รูปแบบการเช่า" : "เพิ่มประเภทห้อง / รูปแบบการเช่าใหม่"}
              </h3>
              <button
                type="button"
                onClick={() => setShowRtModal(false)}
                style={{ background: "transparent", border: "none", outline: "none", boxShadow: "none", fontSize: "18px", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {rtErrorMsg && (
              <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: "6px", fontSize: "14px", marginBottom: "14px" }}>
                {rtErrorMsg}
              </div>
            )}

            {rtSuccessMsg && (
              <div style={{ backgroundColor: "#f0fdf4", color: "#16a34a", padding: "10px 14px", borderRadius: "6px", fontSize: "14px", marginBottom: "14px" }}>
                {rtSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveRt}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  ชื่อประเภทห้อง / รูปแบบการเช่า <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น รายวัน, รายเดือน, ห้องแอร์, ห้องพัดลม..."
                  value={rtName}
                  onChange={(e) => setRtName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none"
                  }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  หมวดหมู่
                </label>
                <select
                  value={rtCategory}
                  onChange={(e) => setRtCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "#ffffff"
                  }}
                >
                  <option value="รูปแบบการเช่า">รูปแบบการเช่า (เช่น รายวัน, รายเดือน)</option>
                  <option value="ประเภทห้อง">ประเภทห้อง (เช่น ห้องแอร์, ห้องพัดลม)</option>
                  <option value="ประเภทสิ่งอำนวยความสะดวก">ประเภทสิ่งอำนวยความสะดวก</option>
                  <option value="ทั่วไป">ทั่วไป</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  คำอธิบายเพิ่มเติม
                </label>
                <textarea
                  placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับประเภทห้องนี้ (ถ้ามี)"
                  value={rtDescription}
                  onChange={(e) => setRtDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowRtModal(false)}
                  style={{
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "6px",
                    padding: "10px 18px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={rtSaving}
                  style={{
                    backgroundColor: "#7da27c",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: rtSaving ? "not-allowed" : "pointer",
                    opacity: rtSaving ? 0.7 : 1
                  }}
                >
                  {rtSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Inspect Dorm Location */}
      {inspectingDorm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 10000,
            padding: "90px 16px 24px 16px",
            overflowY: "auto"
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "760px",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}
          >
            <div
              style={{
                padding: "24px",
                maxHeight: "calc(100vh - 140px)",
                overflowY: "auto"
              }}
            >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="fa-solid fa-location-dot" style={{ color: "#5b8e66" }}></i>
                  ตรวจสอบตำแหน่งพิกัด: {inspectingDorm.name}
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                  {inspectingDorm.address || "-"} {inspectingDorm.district ? `(${inspectingDorm.district})` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingDorm(null)}
                style={{ background: "transparent", border: "none", outline: "none", boxShadow: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Dorm Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "14px 18px", borderRadius: "12px", marginBottom: "16px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "#64748b" }}>เจ้าของหอพัก: </span>
                <strong style={{ color: "#1e293b" }}>{inspectingDorm.ownerName || inspectingDorm.owner_name || "-"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>พิกัดละติจูด: </span>
                <strong style={{ color: "#0284c7", fontFamily: "monospace" }}>{inspectingDorm.latitude ?? "ไม่ได้ระบุ"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>พิกัดลองจิจูด: </span>
                <strong style={{ color: "#0284c7", fontFamily: "monospace" }}>{inspectingDorm.longitude ?? "ไม่ได้ระบุ"}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>สถานะปัจจุบัน: </span>
                <strong>
                  {(inspectingDorm.locationStatus || inspectingDorm.location_status) === "verified" ? (
                    <span style={{ color: "#059669" }}>ยืนยันแล้ว</span>
                  ) : (inspectingDorm.locationStatus || inspectingDorm.location_status) === "action_needed" || (inspectingDorm.locationStatus || inspectingDorm.location_status) === "rejected" ? (
                    <span style={{ color: "#dc2626" }}>ต้องแก้ไข</span>
                  ) : (
                    <span style={{ color: "#d97706" }}>รอตรวจสอบ</span>
                  )}
                </strong>
              </div>
            </div>

            {/* Map Preview */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                  ตำแหน่งบนแผนที่ (Interactive Map)
                </span>
                {inspectingDorm.latitude && inspectingDorm.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${inspectingDorm.latitude},${inspectingDorm.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "12px", color: "#3b82f6", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> เปิดดูบน Google Maps
                  </a>
                )}
              </div>

              {inspectingDorm.latitude && inspectingDorm.longitude ? (
                <div style={{ height: "340px", borderRadius: "12px", overflow: "hidden", border: "1px solid #cbd5e1", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <MapPreview
                    latitude={inspectingDorm.latitude}
                    longitude={inspectingDorm.longitude}
                    dormName={inspectingDorm.name}
                    address={inspectingDorm.address}
                    initialZoom={16}
                  />
                </div>
              ) : (
                <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1", color: "#94a3b8" }}>
                  <i className="fa-solid fa-location-crosshairs" style={{ fontSize: "32px", marginBottom: "8px", display: "block" }}></i>
                  หอพักนี้ยังไม่ได้ระบุพิกัดละติจูดและลองจิจูด
                </div>
              )}
            </div>

            {/* Reject reason input section */}
            {showRejectInput && (
              <div style={{ marginBottom: "16px", backgroundColor: "#fef2f2", padding: "16px", borderRadius: "12px", border: "1px solid #fecaca" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#991b1b", marginBottom: "6px" }}>
                  ระบุเหตุผลที่ให้แก้ไขพิกัด <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="เช่น พิกัดที่ปักไม่ตรงกับที่อยู่จริง หรือปักอยู่กลางถนน กรุณาปักหมุดใหม่ให้อยู่บริเวณตัวอาคารหอพัก"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #f87171",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "#ffffff"
                  }}
                  autoFocus
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="admin-loc-inspect-actions">
              <button
                type="button"
                onClick={() => setInspectingDorm(null)}
                style={{
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                ปิดหน้าต่าง
              </button>

              <div className="admin-loc-inspect-btn-group">
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => handleVerifyLocationStatus("action_needed")}
                  style={{
                    backgroundColor: "#fee2e2",
                    color: "#dc2626",
                    border: "1px solid #fca5a5",
                    borderRadius: "10px",
                    padding: "10px 18px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: isVerifying ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  {showRejectInput ? "ส่งคำขอแก้ไข" : "ต้องแก้ไขพิกัด"}
                </button>

                <button
                  type="button"
                  disabled={isVerifying || !inspectingDorm.latitude || !inspectingDorm.longitude}
                  onClick={() => handleVerifyLocationStatus("verified")}
                  style={{
                    backgroundColor: "#5b8e66",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: isVerifying || !inspectingDorm.latitude || !inspectingDorm.longitude ? "not-allowed" : "pointer",
                    opacity: isVerifying || !inspectingDorm.latitude || !inspectingDorm.longitude ? 0.6 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 6px rgba(91, 142, 102, 0.3)"
                  }}
                >
                  <i className="fa-solid fa-circle-check"></i>
                  {isVerifying ? "กำลังบันทึก..." : "ยืนยันตำแหน่งถูกต้อง"}
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
