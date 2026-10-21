import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function PublicMobileHeader({ title, breadcrumbs }) {
  const navigate = useNavigate();

  return (
    <>
      {/* 1. Fixed Top Bar: < Title */}
      <div className="public-mobile-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mobile-header-back-btn"
          aria-label="ย้อนกลับ"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2 className="mobile-header-title">{title}</h2>
      </div>

      {/* 2. Breadcrumbs Line */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="public-mobile-breadcrumbs">
          {breadcrumbs.map((b, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {b.to && !isLast ? (
                  <Link to={b.to} className="breadcrumb-link">
                    {b.label}
                  </Link>
                ) : (
                  <span className="breadcrumb-current">{b.label}</span>
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
