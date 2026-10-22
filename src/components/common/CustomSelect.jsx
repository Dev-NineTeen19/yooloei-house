import { useState, useRef, useEffect } from "react";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "เลือก...",
  icon = null,
  width = "100%",
  disabled = false,
  className = "",
  style = {},
  triggerStyle = {},
  menuStyle = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Normalize options to { value, label, icon?, count?, description? }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string" || typeof opt === "number") {
      return { value: opt, label: String(opt) };
    }
    return {
      value: opt.value ?? opt.key ?? opt.id,
      label: opt.label ?? opt.name ?? opt.title ?? String(opt.value),
      icon: opt.icon,
      count: opt.count,
      description: opt.description
    };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  return (
    <div
      ref={containerRef}
      className={`custom-ui-select-container ${className}`}
      style={{
        position: "relative",
        width,
        boxSizing: "border-box",
        ...style
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        style={{
          width: "100%",
          height: "40px",
          padding: "0 12px",
          backgroundColor: disabled ? "#f1f5f9" : "#ffffff",
          border: "1px solid",
          borderColor: isOpen ? "#5b8e66" : "#cbd5e1",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: "13.5px",
          fontWeight: 500,
          color: selectedOption ? "#1e293b" : "#94a3b8",
          boxShadow: isOpen ? "0 0 0 3px rgba(91, 142, 102, 0.15)" : "none",
          transition: "all 0.15s ease",
          boxSizing: "border-box",
          outline: "none",
          ...triggerStyle
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
            overflow: "hidden",
            flex: 1
          }}
        >
          {icon && (
            <i
              className={icon}
              style={{ color: "#5b8e66", fontSize: "13px", flexShrink: 0 }}
            ></i>
          )}
          {selectedOption?.icon && (
            <i
              className={selectedOption.icon}
              style={{ color: "#5b8e66", fontSize: "13px", flexShrink: 0 }}
            ></i>
          )}
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.count !== undefined && (
            <span
              style={{
                fontSize: "11px",
                color: "#64748b",
                backgroundColor: "#f1f5f9",
                padding: "1px 6px",
                borderRadius: "999px",
                flexShrink: 0
              }}
            >
              {selectedOption.count}
            </span>
          )}
        </div>

        <i
          className="fa-solid fa-chevron-down"
          style={{
            fontSize: "10px",
            color: "#94a3b8",
            flexShrink: 0,
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "none"
          }}
        ></i>
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            width: "100%",
            maxHeight: "260px",
            overflowY: "auto",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
            zIndex: 1050,
            padding: "4px",
            boxSizing: "border-box",
            ...menuStyle
          }}
        >
          {normalizedOptions.length === 0 ? (
            <div
              style={{
                padding: "10px 12px",
                fontSize: "12.5px",
                color: "#94a3b8",
                textAlign: "center"
              }}
            >
              ไม่มีตัวเลือก
            </div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={String(opt.value)}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "#166534" : "#334155",
                    backgroundColor: isSelected ? "#f0fdf4" : "transparent",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                    boxSizing: "border-box"
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      minWidth: 0,
                      overflow: "hidden",
                      flex: 1
                    }}
                  >
                    {opt.icon && (
                      <i
                        className={opt.icon}
                        style={{
                          color: isSelected ? "#166534" : "#64748b",
                          fontSize: "13px",
                          width: "16px",
                          textAlign: "center",
                          flexShrink: 0
                        }}
                      ></i>
                    )}
                    <div style={{ minWidth: 0, overflow: "hidden" }}>
                      <span
                        style={{
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {opt.label}
                      </span>
                      {opt.description && (
                        <span
                          style={{
                            display: "block",
                            fontSize: "11px",
                            color: "#94a3b8",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {opt.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    {opt.count !== undefined && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: isSelected ? "#166534" : "#94a3b8",
                          backgroundColor: isSelected ? "#dcfce7" : "#f1f5f9",
                          padding: "1px 6px",
                          borderRadius: "999px"
                        }}
                      >
                        {opt.count}
                      </span>
                    )}
                    {isSelected && (
                      <i
                        className="fa-solid fa-check"
                        style={{ color: "#166534", fontSize: "11px" }}
                      ></i>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
