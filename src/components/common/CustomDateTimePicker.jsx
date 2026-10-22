import { useState, useRef, useEffect } from "react";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

export default function CustomDateTimePicker({
  value,
  onChange,
  placeholder = "คลิกเลือกวันและเวลา...",
  includeTime = true,
  disabled = false,
  width = "100%",
  className = "",
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial value or current date
  const parseDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const selectedDateObj = parseDate(value);

  // Month currently viewed in calendar
  const [viewDate, setViewDate] = useState(() => selectedDateObj || new Date());
  // Selected hour & minute
  const [selectedHour, setSelectedHour] = useState(() =>
    selectedDateObj ? String(selectedDateObj.getHours()).padStart(2, "0") : "12"
  );
  const [selectedMinute, setSelectedMinute] = useState(() =>
    selectedDateObj ? String(selectedDateObj.getMinutes()).padStart(2, "0") : "00"
  );

  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      if (d) {
        setViewDate(d);
        setSelectedHour(String(d.getHours()).padStart(2, "0"));
        setSelectedMinute(String(d.getMinutes()).padStart(2, "0"));
      }
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const curYear = viewDate.getFullYear();
  const curMonth = viewDate.getMonth();
  const firstDayOfWeek = new Date(curYear, curMonth, 1).getDay();
  const totalDaysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const prevMonthLastDay = new Date(curYear, curMonth, 0).getDate();

  const todayObj = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const todayStr = `${todayObj.getFullYear()}-${pad(todayObj.getMonth() + 1)}-${pad(todayObj.getDate())}`;

  // Formatted date string for display
  const formatDisplay = () => {
    if (!selectedDateObj) return null;
    const y = selectedDateObj.getFullYear() + 543;
    const m = THAI_MONTHS[selectedDateObj.getMonth()];
    const d = selectedDateObj.getDate();
    if (includeTime) {
      const hh = pad(selectedDateObj.getHours());
      const mm = pad(selectedDateObj.getMinutes());
      return `${d} ${m} ${y} เวลา ${hh}:${mm} น.`;
    }
    return `${d} ${m} ${y}`;
  };

  const handleSelectDay = (dayNum) => {
    const formatted = includeTime
      ? `${curYear}-${pad(curMonth + 1)}-${pad(dayNum)}T${selectedHour}:${selectedMinute}`
      : `${curYear}-${pad(curMonth + 1)}-${pad(dayNum)}`;
    onChange(formatted);
    if (!includeTime) {
      setIsOpen(false);
    }
  };

  const handleTimeChange = (h, m) => {
    setSelectedHour(h);
    setSelectedMinute(m);
    if (selectedDateObj) {
      const y = selectedDateObj.getFullYear();
      const mo = pad(selectedDateObj.getMonth() + 1);
      const day = pad(selectedDateObj.getDate());
      onChange(`${y}-${mo}-${day}T${h}:${m}`);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  const handleSetNow = () => {
    const now = new Date();
    setViewDate(now);
    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    setSelectedHour(h);
    setSelectedMinute(m);
    const formatted = includeTime
      ? `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${h}:${m}`
      : `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    onChange(formatted);
  };

  return (
    <div
      ref={containerRef}
      className={`custom-ui-datetime-picker ${className}`}
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
          fontSize: "13px",
          fontWeight: 500,
          color: selectedDateObj ? "#1e293b" : "#94a3b8",
          boxShadow: isOpen ? "0 0 0 3px rgba(91, 142, 102, 0.15)" : "none",
          transition: "all 0.15s ease",
          boxSizing: "border-box",
          outline: "none"
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
          <i
            className="fa-regular fa-calendar-days"
            style={{ color: selectedDateObj ? "#5b8e66" : "#94a3b8", fontSize: "14px", flexShrink: 0 }}
          ></i>
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: selectedDateObj ? 600 : 400
            }}
          >
            {formatDisplay() || placeholder}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          {selectedDateObj && (
            <span
              onClick={handleClear}
              title="ล้างค่า"
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                cursor: "pointer",
                padding: "2px 4px",
                borderRadius: "4px"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
            >
              <i className="fa-solid fa-xmark"></i>
            </span>
          )}
          <i
            className="fa-solid fa-chevron-down"
            style={{
              fontSize: "10px",
              color: "#94a3b8",
              transition: "transform 0.2s ease",
              transform: isOpen ? "rotate(180deg)" : "none"
            }}
          ></i>
        </div>
      </button>

      {/* Popover Calendar Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            width: "100%",
            minWidth: "280px",
            maxWidth: "340px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e2e8f0",
            zIndex: 1050,
            padding: "14px",
            boxSizing: "border-box"
          }}
        >
          {/* Calendar Header: Month + Buddhist Year + Prev/Next */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px"
            }}
          >
            <button
              type="button"
              onClick={() => setViewDate(new Date(curYear, curMonth - 1, 1))}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#4a5568",
                fontSize: "12px"
              }}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <span style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>
              {THAI_MONTHS[curMonth]} {curYear + 543}
            </span>

            <button
              type="button"
              onClick={() => setViewDate(new Date(curYear, curMonth + 1, 1))}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#4a5568",
                fontSize: "12px"
              }}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          {/* Weekday Names */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "2px",
              marginBottom: "6px",
              textAlign: "center"
            }}
          >
            {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d, i) => (
              <div
                key={d}
                style={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: i === 0 ? "#dc2626" : "#64748b",
                  padding: "2px 0"
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "3px",
              textAlign: "center",
              marginBottom: "12px"
            }}
          >
            {/* Prev month overflow days */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
              const prevDateNum = prevMonthLastDay - firstDayOfWeek + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  style={{
                    padding: "7px 0",
                    fontSize: "12px",
                    color: "#cbd5e1",
                    userSelect: "none"
                  }}
                >
                  {prevDateNum}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateFormatted = `${curYear}-${pad(curMonth + 1)}-${pad(dayNum)}`;
              const isSelected =
                selectedDateObj &&
                selectedDateObj.getFullYear() === curYear &&
                selectedDateObj.getMonth() === curMonth &&
                selectedDateObj.getDate() === dayNum;
              const isToday = dateFormatted === todayStr;

              return (
                <button
                  key={dateFormatted}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  style={{
                    padding: "7px 0",
                    fontSize: "12.5px",
                    fontWeight: isSelected ? 700 : isToday ? 600 : 500,
                    color: isSelected ? "#ffffff" : isToday ? "#166534" : "#1e293b",
                    backgroundColor: isSelected
                      ? "#5b8e66"
                      : isToday
                      ? "#dcfce7"
                      : "transparent",
                    border: isToday && !isSelected ? "1px solid #86efac" : "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: "1.2",
                    transition: "all 0.1s ease"
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !isToday)
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isToday)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Time Picker Section (If includeTime is true) */}
          {includeTime && (
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                padding: "8px 10px",
                border: "1px solid #e2e8f0",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <i className="fa-regular fa-clock" style={{ color: "#5b8e66", fontSize: "12px" }}></i>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>เวลา:</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <select
                  value={selectedHour}
                  onChange={(e) => handleTimeChange(e.target.value, selectedMinute)}
                  style={{
                    padding: "3px 6px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    backgroundColor: "#ffffff",
                    color: "#1e293b",
                    outline: "none"
                  }}
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const h = pad(i);
                    return <option key={h} value={h}>{h}</option>;
                  })}
                </select>

                <span style={{ fontWeight: 700, color: "#64748b" }}>:</span>

                <select
                  value={selectedMinute}
                  onChange={(e) => handleTimeChange(selectedHour, e.target.value)}
                  style={{
                    padding: "3px 6px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    backgroundColor: "#ffffff",
                    color: "#1e293b",
                    outline: "none"
                  }}
                >
                  {["00", "05", "10", "15", "20", "25", "30", "35", "40", "41", "42", "43", "44", "45", "50", "55"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "2px" }}>น.</span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "8px",
              borderTop: "1px solid #f1f5f9"
            }}
          >
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: "none",
                border: "none",
                color: "#ef4444",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px"
              }}
            >
              ล้างค่า
            </button>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={handleSetNow}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "5px 10px",
                  borderRadius: "6px"
                }}
              >
                {includeTime ? "ตอนนี้" : "วันนี้"}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "#5b8e66",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "5px 12px",
                  borderRadius: "6px"
                }}
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
