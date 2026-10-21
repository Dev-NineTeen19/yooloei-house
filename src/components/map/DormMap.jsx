import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ฟังก์ชันสร้างไอคอนหมุดแสดงราคาแบบ Modern Real-Estate Pill
function createDormPin(dorm, isHighlighted = false) {
  const price = dorm?.priceMin
    ? `฿${Number(dorm.priceMin).toLocaleString()}`
    : "สอบถาม";

  const isSelected = isHighlighted;
  const bg = isSelected ? "#f59e0b" : "#5b8e66";
  const shadow = isSelected
    ? "0 6px 16px rgba(245,158,11,0.5)"
    : "0 4px 12px rgba(91,142,102,0.35)";

  return L.divIcon({
    className: `yooloei-modern-pin ${isSelected ? "selected" : ""}`,
    html: `
      <div style="
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: ${bg};
        color: #ffffff;
        padding: 5px 10px;
        border-radius: 20px;
        border: 2px solid #ffffff;
        font-family: 'Noto Sans Thai', sans-serif;
        font-size: 12px;
        font-weight: 700;
        box-shadow: ${shadow};
        transform: translate(-50%, -100%) scale(${isSelected ? 1.15 : 1});
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        cursor: pointer;
        white-space: nowrap;
        user-select: none;
      ">
        <i class="fa-solid fa-house" style="font-size: 11px;"></i>
        <span>${price}</span>
        <div style="
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid ${bg};
        "></div>
      </div>
    `,
    iconSize: [80, 32],
    iconAnchor: [40, 32],
    popupAnchor: [0, -34]
  });
}

const DEFAULT_CENTER = [17.4861, 101.7223];

export default function DormMap({
  dorms = [],
  selectedDormId = null,
  onSelectDorm,
  height = "600px"
}) {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersMapRef = useRef(new Map());
  const [mapType, setMapType] = useState("street"); // "street" | "satellite"

  // Tile Layer URLs
  const streetUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
  const satUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: DEFAULT_CENTER,
        zoom: 14,
        zoomControl: false, // เราใช้ปุ่มซูมที่แต่งเอง
        scrollWheelZoom: true
      });

      // Add Zoom Control to Bottom Right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      const tileLayer = L.tileLayer(streetUrl, {
        attribution: 'Tiles &copy; Esri &mdash; Esri Thailand',
        maxZoom: 19
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersMapRef.current.forEach((marker) => marker.remove());
    markersMapRef.current.clear();

    const validDorms = dorms.filter((d) => {
      const lat = Number(d.latitude);
      const lng = Number(d.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });

    const bounds = L.latLngBounds();

    validDorms.forEach((dorm) => {
      const lat = Number(dorm.latitude);
      const lng = Number(dorm.longitude);
      const isSelected = selectedDormId === dorm.id;
      const pinIcon = createDormPin(dorm, isSelected);

      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      bounds.extend([lat, lng]);

      const dormImage = Array.isArray(dorm.images) && dorm.images.length > 0
        ? dorm.images[0]
        : (typeof dorm.images === "string" && dorm.images.startsWith("[") ? JSON.parse(dorm.images)[0] : dorm.images || "/images/dorm-1.jpg");

      const priceText = dorm.priceMin
        ? `฿${Number(dorm.priceMin).toLocaleString()}${dorm.priceMax && dorm.priceMax > dorm.priceMin ? " - " + Number(dorm.priceMax).toLocaleString() : ""} / เดือน`
        : "ติดต่อสอบถาม";

      const popupHtml = `
        <div style="font-family: 'Noto Sans Thai', sans-serif; width: 260px; overflow: hidden; background: #ffffff;">
          <!-- Cover Image Container -->
          <div style="position: relative; width: 100%; height: 135px; background: #f1f5f9; overflow: hidden;">
            <img
              src="${dormImage}"
              alt="${dorm.name}"
              style="width: 100%; height: 100%; object-fit: cover; display: block;"
              onerror="this.src='/images/map.jpg';"
            />
            <span style="
              position: absolute;
              top: 10px;
              left: 10px;
              background: rgba(15, 23, 42, 0.7);
              color: #ffffff;
              font-size: 11px;
              font-weight: 600;
              padding: 3px 10px;
              border-radius: 20px;
              backdrop-filter: blur(4px);
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              z-index: 1;
            ">
              <i class="fa-solid fa-location-dot" style="margin-right: 4px;"></i> ${dorm.district || "เมืองเลย"}
            </span>
          </div>

          <!-- Body Content -->
          <div style="padding: 12px 14px 14px;">
            <h4 style="
              margin: 0 0 4px 0;
              font-size: 15px;
              font-weight: 700;
              color: #0f172a;
              line-height: 1.3;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            ">
              ${dorm.name}
            </h4>

            <div style="
              font-size: 14px;
              font-weight: 700;
              color: #5b8e66;
              margin-bottom: 12px;
            ">
              ${priceText}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <a
                href="/dorms/${dorm.id}"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 6px;
                  background: #5b8e66;
                  color: #ffffff;
                  text-decoration: none;
                  font-size: 12px;
                  font-weight: 600;
                  height: 36px;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(91,142,102,0.25);
                "
              >
                <i class="fa-solid fa-circle-info" style="font-size: 12px;"></i> ดูรายละเอียด
              </a>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 6px;
                  background: #f1f5f9;
                  color: #334155;
                  text-decoration: none;
                  font-size: 12px;
                  font-weight: 600;
                  height: 36px;
                  border-radius: 8px;
                  border: 1px solid #e2e8f0;
                "
              >
                <i class="fa-solid fa-compass" style="color: #0284c7; font-size: 12px;"></i> นำทาง
              </a>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280, minWidth: 260, className: "yooloei-leaflet-popup" });

      marker.on("click", () => {
        if (onSelectDorm) onSelectDorm(dorm);
      });

      markersMapRef.current.set(dorm.id, marker);
    });

    // Auto zoom to fit all markers if multiple
    if (validDorms.length > 1 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (validDorms.length === 1) {
      map.setView([Number(validDorms[0].latitude), Number(validDorms[0].longitude)], 15);
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [dorms]);

  // Switch Tile Style (Street vs Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const url = mapType === "satellite" ? satUrl : streetUrl;
    const attr = mapType === "satellite"
      ? "Tiles &copy; Esri World Imagery"
      : "Tiles &copy; Esri &mdash; Esri Thailand";

    const newLayer = L.tileLayer(url, {
      attribution: attr,
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [mapType]);

  // Handle selected dorm change externally
  useEffect(() => {
    if (!selectedDormId || !mapInstanceRef.current) return;
    const targetMarker = markersMapRef.current.get(selectedDormId);
    if (targetMarker) {
      const latLng = targetMarker.getLatLng();
      mapInstanceRef.current.flyTo(latLng, 16, { duration: 1 });
      targetMarker.openPopup();
    }
  }, [selectedDormId]);

  // Reset focus to fit all markers
  const handleResetBounds = () => {
    if (!mapInstanceRef.current) return;
    const validDorms = dorms.filter((d) => Number(d.latitude) && Number(d.longitude));
    if (validDorms.length === 0) return;

    const bounds = L.latLngBounds();
    validDorms.forEach((d) => bounds.extend([Number(d.latitude), Number(d.longitude)]));
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const validDormCount = dorms.filter(d => Number(d.latitude) && Number(d.longitude)).length;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: height,
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #cbd5e1",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
      }}
    >
      {/* Top Floating Map Controls */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          left: "14px",
          right: "14px",
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pointerEvents: "none"
        }}
      >
        {/* Count Badge */}
        <div
          style={{
            pointerEvents: "auto",
            backgroundColor: "#ffffff",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "700",
            color: "#1e293b",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            border: "1px solid #e2e8f0"
          }}
        >
          <i className="fa-solid fa-map-pin" style={{ color: "#5b8e66" }}></i>
          <span>พบ {validDormCount} หอพักในพื้นที่</span>
        </div>

        {/* Action Controls */}
        <div style={{ pointerEvents: "auto", display: "flex", gap: "8px" }}>
          {/* Tile Switcher */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "3px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              display: "flex",
              gap: "2px",
              border: "1px solid #e2e8f0"
            }}
          >
            <button
              type="button"
              onClick={() => setMapType("street")}
              style={{
                border: "none",
                padding: "4px 10px",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                backgroundColor: mapType === "street" ? "#5b8e66" : "transparent",
                color: mapType === "street" ? "#ffffff" : "#64748b",
                transition: "all 0.2s"
              }}
            >
              ถนน
            </button>
            <button
              type="button"
              onClick={() => setMapType("satellite")}
              style={{
                border: "none",
                padding: "4px 10px",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                backgroundColor: mapType === "satellite" ? "#5b8e66" : "transparent",
                color: mapType === "satellite" ? "#ffffff" : "#64748b",
                transition: "all 0.2s"
              }}
            >
              ดาวเทียม
            </button>
          </div>

          {/* Reset Zoom Button */}
          <button
            type="button"
            onClick={handleResetBounds}
            title="จัดตำแหน่งกึ่งกลาง"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              color: "#334155",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              transition: "all 0.2s"
            }}
          >
            <i className="fa-solid fa-crosshairs"></i>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%", zIndex: 1 }} />
    </div>
  );
}
