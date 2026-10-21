import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ฟังก์ชันสร้างไอคอนหมุดสีเขียวแบบ Modern Badge
function createCustomPin(dormName = "") {
  return L.divIcon({
    className: "yooloei-preview-marker",
    html: `
      <div style="
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #5b8e66;
        color: #ffffff;
        padding: 6px 12px;
        border-radius: 20px;
        border: 2px solid #ffffff;
        font-family: 'Noto Sans Thai', sans-serif;
        font-size: 12px;
        font-weight: 700;
        box-shadow: 0 4px 14px rgba(91,142,102,0.4);
        transform: translate(-50%, -100%);
        white-space: nowrap;
      ">
        <i class="fa-solid fa-location-dot" style="font-size: 12px; color: #ffffff;"></i>
        <span>${dormName || "ตำแหน่งหอพัก"}</span>
        <div style="
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #5b8e66;
        "></div>
      </div>
    `,
    iconSize: [120, 34],
    iconAnchor: [60, 34],
    popupAnchor: [0, -36]
  });
}

const DEFAULT_LOEI_LAT = 17.4861;
const DEFAULT_LOEI_LNG = 101.7223;

export default function MapPreview({
  latitude,
  longitude,
  dormName = "ตำแหน่งหอพัก",
  address = "",
  height = "360px",
  zoom = 15,
  interactive = true,
  showControls = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const hasCoords = Boolean(
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined &&
    !isNaN(Number(latitude)) &&
    !isNaN(Number(longitude)) &&
    Number(latitude) !== 0 &&
    Number(longitude) !== 0
  );

  const lat = hasCoords ? Number(latitude) : DEFAULT_LOEI_LAT;
  const lng = hasCoords ? Number(longitude) : DEFAULT_LOEI_LNG;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: zoom,
        zoomControl: interactive,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: false // ป้องกันแผนที่แย่ง scroll หน้าเว็บ
      });

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        attribution: 'Tiles &copy; Esri &mdash; Esri Thailand',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // อัปเดต Marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (hasCoords) {
      const pinIcon = createCustomPin(dormName);
      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: 'Noto Sans Thai', sans-serif; padding: 4px 6px; min-width: 170px;">
          <strong style="font-size: 13.5px; color: #1e293b; display: block; margin-bottom: 4px;">
            ${dormName}
          </strong>
          ${address ? `<p style="font-size: 11.5px; color: #64748b; margin: 0 0 6px; line-height: 1.4;">${address}</p>` : ""}
          <div style="font-size: 10.5px; color: #5b8e66; font-weight: 600;">
            พิกัด: ${lat.toFixed(6)}, ${lng.toFixed(6)}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { className: "yooloei-leaflet-popup" });
      markerRef.current = marker;
      map.setView([lat, lng], zoom);
    }

    // Force map redraw to solve grey tile issues on dynamic containers
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [lat, lng, hasCoords, dormName, address, zoom, interactive]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handler: ซูม/โฟกัส ไปยังพิกัดหอพัก
  const handleFocusMap = () => {
    if (mapInstanceRef.current && hasCoords) {
      mapInstanceRef.current.flyTo([lat, lng], 17, {
        duration: 1.2
      });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  // Handler: นำทางด้วย Google Maps
  const handleNavigateGoogleMaps = () => {
    if (!hasCoords) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="dorm-map-preview-container" style={{ width: "100%" }}>
      {/* Map Element */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: height,
          borderRadius: "14px",
          overflow: "hidden",
          border: "1.5px solid #cbd5e1",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
        }}
      >
        <div
          ref={mapContainerRef}
          style={{ width: "100%", height: "100%", zIndex: 1 }}
        />

        {/* Fallback Warning if coords missing */}
        {!hasCoords && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(4px)",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              color: "#64748b",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid #e2e8f0"
            }}
          >
            <i className="fa-solid fa-triangle-exclamation" style={{ color: "#f59e0b" }}></i>
            หอพักนี้ยังไม่ได้ระบุพิกัดที่ตั้งอย่างเป็นทางการ
          </div>
        )}
      </div>

      {/* Action Buttons & Coordinates Bar */}
      {showControls && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "12px",
            padding: "10px 14px",
            background: "#f8fafc",
            borderRadius: "10px",
            border: "1px solid #e2e8f0"
          }}
        >
          {/* Coordinates display */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#475569" }}>
            <i className="fa-solid fa-location-crosshairs" style={{ color: "#5b8e66" }}></i>
            <span>พิกัด: <strong>{hasCoords ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : "ยังไม่ระบุ"}</strong></span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleFocusMap}
              disabled={!hasCoords}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "#ffffff",
                color: hasCoords ? "#1e293b" : "#94a3b8",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: hasCoords ? "pointer" : "not-allowed",
                transition: "all 0.2s"
              }}
              title="ซูมและโฟกัสไปยังตำแหน่งหอพัก"
            >
              <i className="fa-solid fa-magnifying-glass-location" style={{ color: hasCoords ? "#5b8e66" : "#94a3b8" }}></i>
              ดูแผนที่
            </button>

            <button
              type="button"
              onClick={handleNavigateGoogleMaps}
              disabled={!hasCoords}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background: hasCoords ? "#5b8e66" : "#cbd5e1",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: hasCoords ? "pointer" : "not-allowed",
                boxShadow: hasCoords ? "0 2px 6px rgba(91,142,102,0.3)" : "none",
                transition: "background 0.2s"
              }}
            >
              <i className="fa-solid fa-diamond-turn-right"></i>
              นำทางไปหอพัก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
