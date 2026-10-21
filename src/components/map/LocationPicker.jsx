import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { showAlert } from "../../context/ModalContext";

// หมุดสีส้มสำหรับตำแหน่งที่กำลังเลือก / ลากได้
function createDraggablePin(title = "") {
  return L.divIcon({
    className: "yooloei-picker-marker",
    html: `
      <div style="
        position: relative;
        width: 42px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 6px 12px rgba(0,0,0,0.35));
        transform: translate(-50%, -100%);
        cursor: grab;
      ">
        <svg viewBox="0 0 384 512" style="width: 100%; height: 100%; fill: #e53e3e;">
          <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
        </svg>
        <div style="
          position: absolute;
          top: 9px;
          width: 20px;
          height: 20px;
          background: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e53e3e;
          font-size: 11px;
        ">
          <i class="fa-solid fa-location-dot" style="font-size: 11px;"></i>
        </div>
      </div>
    `,
    iconSize: [42, 52],
    iconAnchor: [21, 52],
    popupAnchor: [0, -52]
  });
}

const LOEI_PRESETS = [
  { name: "มรภ.เลย", lat: 17.486100, lng: 101.722300 },
  { name: "ตัวเมืองเลย", lat: 17.489500, lng: 101.730000 },
  { name: "รพ.เลย", lat: 17.492500, lng: 101.734000 },
  { name: "นาอาน", lat: 17.455000, lng: 101.738000 },
  { name: "เชียงคาน", lat: 17.895400, lng: 101.654800 },
  { name: "ภูเรือ", lat: 17.452300, lng: 101.365400 }
];

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  locationStatus = "pending",
  locationRejectReason = "",
  dormName = "หอพักของฉัน"
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [pickerMode, setPickerMode] = useState("auto"); // 'auto' (หาพิกัดให้อัตโนมัติ) หรือ 'manual' (กรอกเอง/เลือกบนแผนที่)
  const [gettingLocation, setGettingLocation] = useState(false);

  const initialLat = latitude && !isNaN(Number(latitude)) && Number(latitude) !== 0
    ? Number(latitude)
    : 17.486100;
  const initialLng = longitude && !isNaN(Number(longitude)) && Number(longitude) !== 0
    ? Number(longitude)
    : 101.722300;

  const [inputLat, setInputLat] = useState(latitude ? String(latitude) : "");
  const [inputLng, setInputLng] = useState(longitude ? String(longitude) : "");

  // Update text inputs when external lat/lng changes
  useEffect(() => {
    if (latitude !== undefined && latitude !== null && latitude !== "") {
      setInputLat(String(latitude));
    }
    if (longitude !== undefined && longitude !== null && longitude !== "") {
      setInputLng(String(longitude));
    }
  }, [latitude, longitude]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false
      });

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        attribution: 'Tiles &copy; Esri &mdash; Esri Thailand',
        maxZoom: 19
      }).addTo(map);

      // สร้าง Draggable Marker
      const pinIcon = createDraggablePin(dormName);
      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: 'Noto Sans Thai', sans-serif; padding: 4px; text-align: center;">
          <strong style="color: #2d3748; font-size: 13px;">${dormName}</strong>
          <p style="margin: 4px 0 0; font-size: 11px; color: #718096;">สามารถคลิกแล้วลากหมุดไปยังจุดที่ต้องการได้</p>
        </div>
      `);

      // Event 1: Drag Marker
      marker.on("dragend", (e) => {
        const position = e.target.getLatLng();
        const newLat = Number(position.lat.toFixed(6));
        const newLng = Number(position.lng.toFixed(6));
        setInputLat(String(newLat));
        setInputLng(String(newLng));
        if (onChange) {
          onChange({ latitude: newLat, longitude: newLng });
        }
      });

      // Event 2: Click on Map
      map.on("click", (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        const newLat = Number(clickLat.toFixed(6));
        const newLng = Number(clickLng.toFixed(6));
        marker.setLatLng([newLat, newLng]);
        setInputLat(String(newLat));
        setInputLng(String(newLng));
        if (onChange) {
          onChange({ latitude: newLat, longitude: newLng });
        }
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when inputs change
  const applyCoordinates = (newLat, newLng, centerMap = true) => {
    if (isNaN(newLat) || isNaN(newLng)) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
    }
    if (mapInstanceRef.current && centerMap) {
      mapInstanceRef.current.panTo([newLat, newLng]);
    }
    if (onChange) {
      onChange({ latitude: newLat, longitude: newLng });
    }
  };

  // Handler: ดึงตำแหน่งปัจจุบันของอุปกรณ์/เบราว์เซอร์อัตโนมัติ (Auto GPS)
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showAlert({
        title: "ไม่รองรับ GPS",
        heading: "เบราว์เซอร์หรืออุปกรณ์ของคุณไม่รองรับระบบค้นหาพิกัด GPS อัตโนมัติ",
        message: "กรุณาใช้วิธีเลือกพิกัดบนแผนที่หรือกรอกตัวเลขละติจูด/ลองจิจูดแทนครับ",
        type: "warning"
      });
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: rawLat, longitude: rawLng } = position.coords;
        const newLat = Number(rawLat.toFixed(6));
        const newLng = Number(rawLng.toFixed(6));

        setInputLat(String(newLat));
        setInputLng(String(newLng));

        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
          markerRef.current.openPopup();
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([newLat, newLng], 17, { duration: 1.2 });
        }

        if (onChange) {
          onChange({ latitude: newLat, longitude: newLng });
        }

        setGettingLocation(false);

        showAlert({
          title: "ค้นหาตำแหน่งสำเร็จ",
          heading: "ระบบดึงตำแหน่งพิกัดปัจจุบันของคุณเรียบร้อยแล้ว!",
          message: `พิกัดละติจูด: ${newLat}, ลองจิจูด: ${newLng}`,
          type: "success"
        });
      },
      (error) => {
        setGettingLocation(false);
        console.error("Geolocation error:", error);
        let errorMsg = "ไม่สามารถเข้าถึงตำแหน่งพิกัดของคุณได้";
        if (error.code === 1) {
          errorMsg = "โปรดอนุญาตการเข้าถึงตำแหน่ง (Location Permission) ในเบราว์เซอร์ของคุณก่อนนะครับ";
        } else if (error.code === 2) {
          errorMsg = "ไม่พบสัญญาณพิกัดตำแหน่งในขณะนี้ กรุณาเปิด GPS แล้วลองใหม่อีกครั้ง";
        } else if (error.code === 3) {
          errorMsg = "การค้นหาพิกัดใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้งหรือระบุบนแผนที่";
        }

        showAlert({
          title: "เกิดข้อผิดพลาดในการดึงพิกัด",
          heading: errorMsg,
          message: "คุณสามารถสลับไปใช้แบบ 'กรอกเอง / เลือกบนแผนที่' ได้ทันทีครับ",
          type: "warning"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleLatChange = (e) => {
    const val = e.target.value;
    setInputLat(val);
    const numLat = parseFloat(val);
    const numLng = parseFloat(inputLng);
    if (!isNaN(numLat) && !isNaN(numLng)) {
      applyCoordinates(numLat, numLng, false);
    }
  };

  const handleLngChange = (e) => {
    const val = e.target.value;
    setInputLng(val);
    const numLat = parseFloat(inputLat);
    const numLng = parseFloat(val);
    if (!isNaN(numLat) && !isNaN(numLng)) {
      applyCoordinates(numLat, numLng, false);
    }
  };

  const handlePresetClick = (preset) => {
    setInputLat(String(preset.lat));
    setInputLng(String(preset.lng));
    applyCoordinates(preset.lat, preset.lng, true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([preset.lat, preset.lng], 16);
    }
  };

  // Status Badge Rendering
  const renderStatusBadge = () => {
    if (locationStatus === "verified") {
      return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#dcfce7", color: "#166534", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
          <i className="fa-solid fa-circle-check"></i>
          พิกัดยืนยันแล้ว
        </div>
      );
    }
    if (locationStatus === "action_needed" || locationStatus === "rejected") {
      return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fee2e2", color: "#991b1b", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
          <i className="fa-solid fa-triangle-exclamation"></i>
          ต้องแก้ไขตำแหน่งพิกัด
        </div>
      );
    }
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fef3c7", color: "#92400e", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
        <i className="fa-solid fa-clock"></i>
        ตำแหน่งรอการตรวจสอบ
      </div>
    );
  };

  return (
    <div className="location-picker-wrapper" style={{ marginTop: "16px" }}>
      {/* Status banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
        <div>
          <span style={{ fontSize: "13px", color: "#718096", marginRight: "8px" }}>สถานะการตรวจสอบพิกัด:</span>
          {renderStatusBadge()}
        </div>
        {locationStatus === "pending" && (
          <span style={{ fontSize: "12px", color: "#92400e" }}>
            *ตำแหน่งหอพักกำลังรอการตรวจสอบจากผู้ดูแลระบบ
          </span>
        )}
      </div>

      {/* Reject Reason Callout if action_needed */}
      {(locationStatus === "action_needed" || locationStatus === "rejected") && locationRejectReason && (
        <div style={{ background: "#fff5f5", borderLeft: "4px solid #e53e3e", padding: "12px 16px", borderRadius: "0 8px 8px 0", marginBottom: "16px" }}>
          <strong style={{ display: "block", color: "#c53030", fontSize: "13px", marginBottom: "4px" }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "6px" }}></i>
            ข้อความจากผู้ดูแลระบบที่ต้องแก้ไข:
          </strong>
          <p style={{ margin: 0, color: "#4a5568", fontSize: "13px", lineHeight: "1.5" }}>
            {locationRejectReason}
          </p>
        </div>
      )}

      {/* Mode Switcher Tabs (2 แบบตามโจทย์ผู้ใช้) */}
      <div style={{
        display: "flex",
        background: "#f1f5f9",
        borderRadius: "12px",
        padding: "4px",
        marginBottom: "16px",
        border: "1px solid #cbd5e1"
      }}>
        <button
          type="button"
          onClick={() => setPickerMode("auto")}
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "none",
            borderRadius: "8px",
            background: pickerMode === "auto" ? "#ffffff" : "transparent",
            color: pickerMode === "auto" ? "#2e7d32" : "#64748b",
            fontWeight: pickerMode === "auto" ? 700 : 500,
            fontSize: "13.5px",
            cursor: "pointer",
            boxShadow: pickerMode === "auto" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          <i className="fa-solid fa-location-crosshairs" style={{ fontSize: "15px", color: pickerMode === "auto" ? "#2e7d32" : "#64748b" }}></i>
          <span>แบบที่ 1: ดึงพิกัดจาก GPS อัตโนมัติ</span>
        </button>

        <button
          type="button"
          onClick={() => setPickerMode("manual")}
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "none",
            borderRadius: "8px",
            background: pickerMode === "manual" ? "#ffffff" : "transparent",
            color: pickerMode === "manual" ? "#1e293b" : "#64748b",
            fontWeight: pickerMode === "manual" ? 700 : 500,
            fontSize: "13.5px",
            cursor: "pointer",
            boxShadow: pickerMode === "manual" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          <i className="fa-solid fa-pen-to-square" style={{ fontSize: "14px", color: pickerMode === "manual" ? "#1e293b" : "#64748b" }}></i>
          <span>แบบที่ 2: กรอกเอง / เลือกบนแผนที่</span>
        </button>
      </div>

      {/* Mode 1: Auto GPS System */}
      {pickerMode === "auto" && (
        <div style={{
          background: "#f0fdf4",
          border: "1.5px solid #bbf7d0",
          borderRadius: "14px",
          padding: "18px 20px",
          marginBottom: "16px",
          boxShadow: "0 2px 8px rgba(46,125,50,0.05)"
        }}>
          <div style={{ fontWeight: 700, color: "#166534", fontSize: "15px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="fa-solid fa-compass" style={{ fontSize: "18px", color: "#2e7d32" }}></i>
            ระบบค้นหาพิกัดตำแหน่งปัจจุบันของคุณอัตโนมัติ (Automatic GPS)
          </div>
          <p style={{ margin: "0 0 14px 0", color: "#374151", fontSize: "13px", lineHeight: "1.6" }}>
            กดปุ่มด้านล่างเพื่ออนุญาตให้ระบบดึงตำแหน่งละติจูดและลองจิจูดจากอุปกรณ์หรือมือถือของคุณโดยอัตโนมัติ หมุดจะปักยังตำแหน่งที่คุณอยู่จริงทันที
          </p>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={gettingLocation}
            style={{
              width: "100%",
              padding: "12px 20px",
              background: "#2e7d32",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "14.5px",
              cursor: gettingLocation ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 4px 12px rgba(46,125,50,0.3)",
              transition: "all 0.2s ease",
              opacity: gettingLocation ? 0.8 : 1
            }}
          >
            {gettingLocation ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "16px" }}></i>
                <span>กำลังค้นหาและระบุตำแหน่งปัจจุบันของคุณ...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-location-crosshairs" style={{ fontSize: "16px" }}></i>
                <span>ใช้ตำแหน่งปัจจุบันของฉันอัตโนมัติ</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Mode 2: Instructions Card for Manual mode */}
      {pickerMode === "manual" && (
        <div style={{ background: "#f8faf8", border: "1px solid #e8eee8", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#4a5568" }}>
          <div style={{ fontWeight: 700, color: "#2d3748", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <i className="fa-solid fa-hand-pointer" style={{ color: "#5b8e66" }}></i>
            วิธีกรอกและเลือกตำแหน่งพิกัดหอพัก:
          </div>
          <ul style={{ margin: "4px 0 0 18px", padding: 0, lineHeight: "1.6", fontSize: "12.5px" }}>
            <li><strong>วิธีที่ 1:</strong> คลิกบนแผนที่ด้านล่าง เพื่อปักหมุดตำแหน่งหอพักทันที</li>
            <li><strong>วิธีที่ 2:</strong> คลิกค้างแล้วลากหมุดสีแดง <i className="fa-solid fa-location-dot text-danger"></i> ไปวางยังจุดที่ตั้งจริง</li>
            <li><strong>วิธีที่ 3:</strong> พิมพ์ตัวเลข Latitude / Longitude ลงในช่องด้านล่าง</li>
          </ul>
        </div>
      )}

      {/* Quick Preset Buttons */}
      <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", color: "#718096", fontWeight: 600 }}>จุดสังเกตด่วนในเมืองเลย:</span>
        {LOEI_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handlePresetClick(preset)}
            style={{
              padding: "4px 10px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "16px",
              fontSize: "12px",
              color: "#4a5568",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "#5b8e66"; e.currentTarget.style.color = "#5b8e66"; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#4a5568"; }}
          >
            <i className="fa-solid fa-location-dot me-1" style={{ color: "#e11d48" }}></i>{preset.name}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "360px",
          borderRadius: "14px",
          overflow: "hidden",
          border: "2px solid #d9e2ec",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          marginBottom: "16px"
        }}
      >
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%", zIndex: 1 }} />
      </div>

      {/* Coordinates Input Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", background: "#f8faf8", padding: "16px", borderRadius: "12px", border: "1px solid #e8eee8" }}>
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#2d3748", marginBottom: "6px" }}>
            ละติจูด (Latitude)
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              step="any"
              placeholder="เช่น 17.486100"
              value={inputLat}
              onChange={handleLatChange}
              style={{
                width: "100%",
                height: "40px",
                padding: "0 12px 0 34px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                color: "#1a202c",
                background: "#ffffff",
                outline: "none"
              }}
            />
            <i className="fa-solid fa-arrows-up-down" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: "13px" }}></i>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#2d3748", marginBottom: "6px" }}>
            ลองจิจูด (Longitude)
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              step="any"
              placeholder="เช่น 101.722300"
              value={inputLng}
              onChange={handleLngChange}
              style={{
                width: "100%",
                height: "40px",
                padding: "0 12px 0 34px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                color: "#1a202c",
                background: "#ffffff",
                outline: "none"
              }}
            />
            <i className="fa-solid fa-arrows-left-right" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: "13px" }}></i>
          </div>
        </div>
      </div>
    </div>
  );
}
