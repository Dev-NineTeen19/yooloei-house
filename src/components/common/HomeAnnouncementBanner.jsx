import { useState, useEffect } from "react";
import { getActiveAnnouncements } from "../../services/announcementService";
import { useAuth } from "../../context/AuthContext";

const DISMISSED_STORAGE_KEY = "yooloei_dismissed_announcements";

function getDismissedAnnouncementIds() {
  try {
    const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDismissedAnnouncementId(id) {
  try {
    const current = getDismissedAnnouncementIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(current));
    }
  } catch (err) {
    console.error("Failed to save dismissed announcement to storage:", err);
  }
}

export default function HomeAnnouncementBanner() {
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAnnouncements() {
      try {
        const data = await getActiveAnnouncements();
        if (!isMounted) return;

        // ตรวจสอบว่าเป็นการ login ใหม่หรือไม่ เพื่อให้ข่าวเด้งขึ้นมาแสดงทุกครั้งที่มีการเข้าสู่ระบบ
        const isFreshLogin = sessionStorage.getItem("yooloei_fresh_login") === "true";
        if (isFreshLogin) {
          sessionStorage.removeItem("yooloei_fresh_login");
          localStorage.removeItem(DISMISSED_STORAGE_KEY);
        }

        const dismissedIds = isFreshLogin ? [] : getDismissedAnnouncementIds();
        
        // เรียงลำดับประกาศจาก 1 -> 2 -> 3 ตามลำดับเวลาที่สร้าง (เก่าไปใหม่)
        const sorted = (data || []).slice().sort((a, b) => {
          const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
          const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
          return timeA - timeB;
        });

        const available = sorted.filter((item) => !dismissedIds.includes(item.id));
        setAnnouncements(available);
        if (available.length > 0) {
          setCurrentIndex(0);
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      } catch (err) {
        console.error("Error loading home announcements:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAnnouncements();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleCloseCurrent();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, announcements]);

  // Lock body scroll & gestures when popup is open so background cannot scroll or shift
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  // Handle dismiss current announcement and immediately go to next (1 -> 2 -> 3 -> close)
  const handleCloseCurrent = (e) => {
    if (e) e.stopPropagation();
    const current = announcements[currentIndex];
    if (current) {
      saveDismissedAnnouncementId(current.id);
    }

    const nextAnnouncements = announcements.filter((_, idx) => idx !== currentIndex);
    if (nextAnnouncements.length === 0) {
      setIsOpen(false);
      setAnnouncements([]);
      setCurrentIndex(0);
    } else {
      setAnnouncements(nextAnnouncements);
      setCurrentIndex(0);
    }
  };

  // If loading, no announcements, or modal closed -> render NOTHING at all
  if (loading || !isOpen || announcements.length === 0) {
    return null;
  }

  const current = announcements[currentIndex] || announcements[0];
  if (!current) return null;

  // Determine which of the 2 popup styles to use:
  // Layout 1: "image" (Poster / Image popup)
  // Layout 2: "card" (News card / text popup)
  // If "auto", choose "image" if image exists and no content/title, or "card" otherwise.
  let activeLayout = current.layoutType || "auto";
  if (activeLayout === "auto") {
    if (current.imageUrl && !current.title && !current.content) {
      activeLayout = "image";
    } else if (current.imageUrl && (!current.content || current.content.length < 40)) {
      activeLayout = "image";
    } else {
      activeLayout = "card";
    }
  }

  return (
    <>
      {/* Inline Keyframes & Responsive Styles */}
      <style>{`
        @keyframes popupFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popupScaleUp {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .announcement-popup-overlay {
          animation: popupFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .announcement-popup-container {
          animation: popupScaleUp 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .announcement-popup-overlay {
          animation: popupFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow: hidden !important;
          touch-action: none !important;
          overscroll-behavior: none !important;
        }
        .announcement-popup-container {
          animation: popupScaleUp 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          touch-action: none !important;
          user-select: none !important;
        }
        .announcement-poster-card {
          scrollbar-width: none;
          border-radius: 0 !important;
          background-color: transparent !important;
          box-shadow: none !important;
          overflow: hidden !important;
          max-width: min(92vw, 1000px) !important;
          max-height: calc(85vh - 40px) !important;
        }
        .announcement-poster-img {
          border-radius: 0 !important;
          max-width: min(92vw, 1000px) !important;
          max-height: calc(85vh - 40px) !important;
          width: auto !important;
          height: auto !important;
          object-fit: contain !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -webkit-user-drag: none !important;
          pointer-events: auto !important;
        }
        @media (max-width: 640px) {
          .announcement-popup-overlay {
            padding: 16px 12px !important;
            overflow: hidden !important;
          }
          .announcement-popup-container {
            width: fit-content !important;
            max-width: 95vw !important;
            margin: auto !important;
          }
          .announcement-poster-card {
            width: fit-content !important;
            max-height: calc(82dvh - 30px) !important;
            border-radius: 0 !important;
            background-color: transparent !important;
            overflow: hidden !important;
          }
          .announcement-poster-img {
            max-width: 95vw !important;
            max-height: calc(82dvh - 30px) !important;
            border-radius: 0 !important;
            user-select: none !important;
            -webkit-user-drag: none !important;
          }
          .announcement-top-close-btn {
            top: -12px !important;
            right: -10px !important;
            width: 36px !important;
            height: 36px !important;
          }
          .announcement-card-mixed-layout {
            flex-direction: column !important;
          }
          .announcement-card-mixed-img {
            width: 100% !important;
            max-height: 220px !important;
          }
          .announcement-bottom-controls button {
            font-size: 12px !important;
            padding: 5px 12px !important;
          }
        }
      `}</style>

      {/* Backdrop (Soft Dark / สีดำอ่อนโฟกัสสายตา - ล็อคขนาดไม่ให้เลื่อนหน้าจอ) */}
      <div
        className="announcement-popup-overlay"
        onClick={handleCloseCurrent}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.72)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          touchAction: "none",
          overscrollBehavior: "none",
          padding: "20px 16px",
          boxSizing: "border-box"
        }}
      >
        {/* =========================================================
            แบบที่ 1: POPUP สไตล์โปสเตอร์ / รูปภาพเด่น (POSTER / IMAGE)
           ========================================================= */}
        {activeLayout === "image" && (
          <div
            className="announcement-popup-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "min(92vw, 1000px)",
              width: "fit-content",
              margin: "auto",
              backgroundColor: "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            {/* Top Close Button (Floating at top-right corner of image) */}
            <button
              type="button"
              onClick={handleCloseCurrent}
              title="ปิดประกาศ (x)"
              aria-label="ปิดประกาศ"
              className="announcement-top-close-btn"
              style={{
                position: "absolute",
                top: "-14px",
                right: "-14px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                border: "2px solid rgba(255, 255, 255, 0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.45)",
                zIndex: 50,
                transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.18s ease, color 0.18s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.backgroundColor = "#fee2e2";
                e.currentTarget.style.color = "#dc2626";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.color = "#0f172a";
              }}
            >
              <i className="fa-solid fa-xmark" style={{ fontSize: "17px", fontWeight: "900" }}></i>
            </button>

            {/* Poster Card (Sharp rectangular, no black background, locked in place) */}
            <div
              className="announcement-poster-card"
              style={{
                width: "fit-content",
                maxWidth: "min(92vw, 1000px)",
                maxHeight: "calc(85vh - 40px)",
                display: "flex",
                flexDirection: "column",
                borderRadius: "0px",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
                backgroundColor: "transparent"
              }}
            >
              {current.imageUrl ? (
                <div
                  style={{
                    backgroundColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "fit-content",
                    overflow: "hidden"
                  }}
                >
                  {current.linkUrl ? (
                    <a
                      href={current.linkUrl}
                      target={current.linkUrl.startsWith("http") ? "_blank" : "_self"}
                      rel="noreferrer"
                      style={{ display: "block", textDecoration: "none", width: "fit-content" }}
                    >
                      <img
                        src={current.imageUrl}
                        alt={current.title || "Announcement Poster"}
                        className="announcement-poster-img"
                        draggable="false"
                        onDragStart={(e) => e.preventDefault()}
                        style={{
                          width: "auto",
                          height: "auto",
                          maxWidth: "100%",
                          maxHeight: (current.title || current.content || current.linkUrl)
                            ? "calc(70vh - 50px)"
                            : "calc(85vh - 40px)",
                          objectFit: "contain",
                          display: "block",
                          margin: "0 auto",
                          borderRadius: "0px",
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          WebkitUserDrag: "none"
                        }}
                      />
                    </a>
                  ) : (
                    <img
                      src={current.imageUrl}
                      alt={current.title || "Announcement Poster"}
                      className="announcement-poster-img"
                      draggable="false"
                      onDragStart={(e) => e.preventDefault()}
                      style={{
                        width: "auto",
                        height: "auto",
                        maxWidth: "100%",
                        maxHeight: (current.title || current.content || current.linkUrl)
                          ? "calc(70vh - 50px)"
                          : "calc(85vh - 40px)",
                        objectFit: "contain",
                        display: "block",
                        margin: "0 auto",
                        borderRadius: "0px",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        WebkitUserDrag: "none"
                      }}
                    />
                  )}
                </div>
              ) : null}

              {/* Optional footer info on image popup if title/content exists */}
              {(current.title || current.content || current.linkUrl) && (
                <div style={{ padding: "16px 20px", backgroundColor: "#ffffff", flexShrink: 0, borderRadius: "0px" }}>
                  {current.title && (
                    <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#1e293b", margin: "0 0 6px 0" }}>
                      {current.title}
                    </h3>
                  )}
                  {current.content && (
                    <p style={{ fontSize: "13.5px", color: "#475569", margin: "0 0 12px 0", lineHeight: "1.55" }}>
                      {current.content}
                    </p>
                  )}
                  {current.linkUrl && (
                    <a
                      href={current.linkUrl}
                      target={current.linkUrl.startsWith("http") ? "_blank" : "_self"}
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 18px",
                        borderRadius: "8px",
                        backgroundColor: "#5b835a",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: "600",
                        textDecoration: "none"
                      }}
                    >
                      ดูรายละเอียด <i className="fa-solid fa-arrow-right"></i>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            แบบที่ 2: POPUP สไตล์การ์ดข่าวสาร / ข้อความ (NEWS CARD POPUP)
           ========================================================= */}
        {activeLayout === "card" && (
          <div
            className="announcement-popup-container announcement-card-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "min(92vw, 840px)",
              width: "100%",
              margin: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 25px 70px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.15)",
              overflow: "hidden",
              maxHeight: "86vh",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Header Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                backgroundColor: "#f8fafc"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "#eaf3e9",
                    color: "#5b835a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px"
                  }}
                >
                  <i className="fa-solid fa-bullhorn"></i>
                </span>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: "700",
                    backgroundColor: "#dcfce7",
                    color: "#166534"
                  }}
                >
                  {current.badgeText || "ประชาสัมพันธ์"}
                </span>
                {announcements.length > 1 && (
                  <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "4px" }}>
                    ({currentIndex + 1}/{announcements.length})
                  </span>
                )}
              </div>

              {/* Close Button [x] */}
              <button
                type="button"
                onClick={handleCloseCurrent}
                title="ปิดประกาศ (x)"
                aria-label="ปิดประกาศ"
                style={{
                  border: "none",
                  backgroundColor: "#f1f5f9",
                  color: "#64748b",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "15px",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#fee2e2";
                  e.currentTarget.style.color = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.color = "#64748b";
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
              {/* Optional Image inside Card */}
              {current.imageUrl && (
                <div style={{ marginBottom: "16px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                  <img
                    src={current.imageUrl}
                    alt={current.title || "Announcement Image"}
                    style={{
                      width: "100%",
                      maxHeight: "340px",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                </div>
              )}

              {/* Title */}
              {current.title && (
                <h3
                  style={{
                    fontSize: "21px",
                    fontWeight: "800",
                    color: "#1e293b",
                    margin: "0 0 12px 0",
                    lineHeight: "1.4"
                  }}
                >
                  {current.title}
                </h3>
              )}

              {/* Text Content */}
              {current.content && (
                <p
                  style={{
                    fontSize: "14.5px",
                    color: "#475569",
                    lineHeight: "1.7",
                    margin: 0,
                    whiteSpace: "pre-line"
                  }}
                >
                  {current.content}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "10px",
                padding: "14px 20px",
                borderTop: "1px solid #f1f5f9",
                backgroundColor: "#f8fafc"
              }}
            >
              <button
                type="button"
                onClick={handleCloseCurrent}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#475569",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                {announcements.length > 1 ? "ถัดไป (✕)" : "ปิดประกาศ (✕)"}
              </button>
                {current.linkUrl && (
                  <a
                    href={current.linkUrl}
                    target={current.linkUrl.startsWith("http") ? "_blank" : "_self"}
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 18px",
                      borderRadius: "8px",
                      backgroundColor: "#5b835a",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: "600",
                      textDecoration: "none"
                    }}
                  >
                    ดูรายละเอียด <i className="fa-solid fa-arrow-right"></i>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </>
  );
}
