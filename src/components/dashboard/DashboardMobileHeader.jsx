import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

function getDashboardMobileConfig(pathname) {
  if (!pathname) {
    return null;
  }

  const path = pathname.replace(/\/$/, "");

  if (path.includes("/messages")) {
    return { title: "แชทข้อความ", breadcrumbs: [] };
  }

  // 1. User Dashboard Pages
  if (path === "/user/dashboard") {
    return { title: "แดชบอร์ดผู้เช่า", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "แดชบอร์ดผู้เช่า" }] };
  }
  if (path === "/user/profile") {
    return { title: "โปรไฟล์ส่วนตัว", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "โปรไฟล์" }] };
  }
  if (path === "/user/favorites") {
    return { title: "รายการโปรด", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "รายการโปรด" }] };
  }
  if (path === "/user/history") {
    return { title: "ประวัติการเข้าชม", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "ประวัติการเข้าชม" }] };
  }
  if (path === "/user/bookings") {
    return { title: "การจองของฉัน", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "การจองของฉัน" }] };
  }
  if (path === "/user/reviews") {
    return { title: "รีวิวของฉัน", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "รีวิวของฉัน" }] };
  }
  if (path === "/user/notifications") {
    return { title: "การแจ้งเตือน", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "การแจ้งเตือน" }] };
  }

  // 2. Owner Dashboard Pages
  if (path === "/owner/dashboard") {
    return { title: "ภาพรวมหอพัก", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "ภาพรวมหอพัก" }] };
  }
  if (path === "/owner/profile") {
    return { title: "โปรไฟล์เจ้าของหอ", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "โปรไฟล์" }] };
  }
  if (path === "/owner/dormitories/create") {
    return { title: "เพิ่มหอพักใหม่", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "เพิ่มหอพัก" }] };
  }
  if (path.includes("/owner/dormitories/") && path.endsWith("/edit")) {
    return { title: "แก้ไขข้อมูลหอพัก", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "แก้ไขหอพัก" }] };
  }
  if (path === "/owner/dormitories") {
    return { title: "หอพักของฉัน", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "หอพักของฉัน" }] };
  }
  if (path === "/owner/rooms") {
    return { title: "จัดการห้องพัก", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "จัดการห้องพัก" }] };
  }
  if (path === "/owner/bookings") {
    return { title: "คำขอจองห้องพัก", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "คำขอจองห้องพัก" }] };
  }
  if (path === "/owner/reviews") {
    return { title: "จัดการรีวิว", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "จัดการรีวิว" }] };
  }
  if (path === "/owner/history") {
    return { title: "ประวัติการเข้าชม", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "ประวัติการเข้าชม" }] };
  }
  if (path === "/owner/notifications") {
    return { title: "การแจ้งเตือน", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "การแจ้งเตือน" }] };
  }

  // 3. Admin Dashboard Pages
  if (path === "/admin/dashboard") {
    return { title: "แดชบอร์ดแอดมิน", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "แดชบอร์ดแอดมิน" }] };
  }
  if (path === "/admin/announcements") {
    return { title: "ประกาศข่าวหน้าแรก", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "ประกาศข่าวหน้าแรก" }] };
  }
  if (path === "/admin/profile") {
    return { title: "โปรไฟล์แอดมิน", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "โปรไฟล์" }] };
  }
  if (path === "/admin/users") {
    return { title: "จัดการผู้ใช้งาน", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "จัดการผู้ใช้งาน" }] };
  }
  if (path === "/admin/owners") {
    return { title: "อนุมัติเจ้าของหอ", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "อนุมัติเจ้าของหอ" }] };
  }
  if (path === "/admin/dormitories") {
    return { title: "อนุมัติหอพัก", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "อนุมัติหอพัก" }] };
  }
  if (path === "/admin/locations") {
    return { title: "จัดการแผนที่พิกัด", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "จัดการแผนที่พิกัด" }] };
  }
  if (path === "/admin/bookings") {
    return { title: "การจองทั้งหมด", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "การจองทั้งหมด" }] };
  }
  if (path === "/admin/reviews") {
    return { title: "รีวิวทั้งหมด", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "รีวิวทั้งหมด" }] };
  }
  if (path === "/admin/reports") {
    return { title: "รายงานปัญหาระบบ", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "รายงานปัญหาระบบ" }] };
  }
  if (path === "/admin/logs") {
    return { title: "ประวัติการทำงานระบบ", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "ประวัติการทำงานระบบ" }] };
  }
  if (path === "/admin/settings") {
    return { title: "ตั้งค่าระบบ", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "ตั้งค่าระบบ" }] };
  }
  if (path === "/admin/history") {
    return { title: "ประวัติการเข้าชม", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "ประวัติการเข้าชม" }] };
  }
  if (path === "/admin/notifications") {
    return { title: "การแจ้งเตือน", breadcrumbs: [{ label: "หน้าแรก", to: "/" }, { label: "การแจ้งเตือน" }] };
  }

  // Fallback
  const segments = path.split("/").filter(Boolean);
  const lastSegment = decodeURIComponent(segments[segments.length - 1] || "แดชบอร์ด");
  return {
    title: lastSegment,
    breadcrumbs: [
      { label: "หน้าแรก", to: "/" },
      { label: lastSegment }
    ]
  };
}

export default function DashboardMobileHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const config = getDashboardMobileConfig(location.pathname);
  if (!config) return null;

  return (
    <>
      {/* 1. Fixed Top Bar: < Title */}
      <div className="dashboard-mobile-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="dashboard-mobile-back-btn"
          aria-label="ย้อนกลับ"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2 className="dashboard-mobile-header-title">{config.title}</h2>
      </div>

      {/* 2. Breadcrumbs Line (หน้าแรก / [ชื่อหน้า]) */}
      {config.breadcrumbs && config.breadcrumbs.length > 0 && (
        <div className="dashboard-mobile-breadcrumbs">
          {config.breadcrumbs.map((b, idx) => {
            const isLast = idx === config.breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {b.to && !isLast ? (
                  <Link to={b.to} className="breadcrumb-link">
                    {b.label}
                  </Link>
                ) : (
                  <span className="breadcrumb-current">
                    {b.label}
                  </span>
                )}
                {!isLast && <span className="breadcrumb-sep">/</span>}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </>
  );
}
