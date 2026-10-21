import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

const ModalContext = createContext(null);

let globalModalRef = {
  confirm: null,
  alert: null,
};

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState(null);
  const resolveRef = useRef(null);

  const closeModal = useCallback((result) => {
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
    setModalState(null);
  }, []);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;

      let config = typeof options === "string" ? { message: options } : { ...options };

      const msg = config.message || "";
      const isDestructive =
        config.type === "danger" ||
        msg.includes("ลบ") ||
        msg.includes("ล้าง") ||
        msg.includes("ยกเลิก");

      setModalState({
        isOpen: true,
        mode: "confirm",
        title: config.title || "ยืนยันการทำรายการ",
        heading: config.heading || (config.message && config.message.length <= 45 ? config.message : "คุณต้องการดำเนินการต่อหรือไม่?"),
        message: config.heading ? config.message : (config.message && config.message.length > 45 ? config.message : ""),
        confirmText: config.confirmText || (isDestructive ? "ยืนยัน" : "ตกลง"),
        cancelText: config.cancelText || "ยกเลิก",
        type: config.type || (isDestructive ? "danger" : "question"),
        onConfirm: () => closeModal(true),
        onCancel: () => closeModal(false),
      });
    });
  }, [closeModal]);

  const alert = useCallback((options) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;

      let config = typeof options === "string" ? { message: options } : { ...options };
      const msg = config.message || "";
      const isSuccess =
        config.type === "success" ||
        msg.includes("สำเร็จ") ||
        msg.includes("เรียบร้อย");
      const isError =
        config.type === "danger" ||
        msg.includes("ไม่สามารถ") ||
        msg.includes("ผิดพลาด") ||
        msg.includes("ล้มเหลว");
      const isWarning =
        config.type === "warning" ||
        msg.includes("คำเตือน") ||
        msg.includes("หมดเวลา") ||
        msg.includes("กรุณา");

      const detectedType = config.type || (isSuccess ? "success" : isError ? "danger" : isWarning ? "warning" : "info");

      setModalState({
        isOpen: true,
        mode: "alert",
        title: config.title || (isSuccess ? "ทำรายการสำเร็จ" : isError ? "เกิดข้อผิดพลาด" : "แจ้งเตือน"),
        heading: config.heading || (config.message && config.message.length <= 40 ? config.message : (isSuccess ? "สำเร็จแล้ว!" : isError ? "ไม่สามารถดำเนินการได้" : "แจ้งเตือน")),
        message: config.heading ? config.message : (config.message && config.message.length > 40 ? config.message : ""),
        confirmText: config.confirmText || "ตกลง",
        type: detectedType,
        onConfirm: () => closeModal(true),
        onCancel: () => closeModal(true),
      });
    });
  }, [closeModal]);

  useEffect(() => {
    globalModalRef.confirm = confirm;
    globalModalRef.alert = alert;

    if (typeof window !== "undefined") {
      window.showConfirm = confirm;
      window.showAlert = alert;
    }

    return () => {
      globalModalRef.confirm = null;
      globalModalRef.alert = null;
    };
  }, [confirm, alert]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && modalState?.isOpen) {
        closeModal(modalState.mode === "confirm" ? false : true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalState, closeModal]);

  return (
    <ModalContext.Provider value={{ confirm, alert, showConfirm: confirm, showAlert: alert }}>
      {children}
      {modalState && modalState.isOpen && (
        <div
          className="custom-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal(modalState.mode === "confirm" ? false : true);
            }
          }}
        >
          <div className="custom-modal-card" role="dialog" aria-modal="true">
            {/* Header */}
            <div className="custom-modal-header">
              <h3 className="custom-modal-title">{modalState.title}</h3>
              <button
                type="button"
                className="custom-modal-close-btn"
                onClick={() => closeModal(modalState.mode === "confirm" ? false : true)}
                title="ปิด"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="custom-modal-body">
              <div className="custom-modal-icon-wrap">
                {modalState.type === "success" && (
                  <i className="fa-solid fa-circle-check" style={{ fontSize: "52px", color: "#16a34a" }}></i>
                )}
                {modalState.type === "danger" && (
                  <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "52px", color: "#ef4444" }}></i>
                )}
                {modalState.type === "warning" && (
                  <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "52px", color: "#f59e0b" }}></i>
                )}
                {(modalState.type === "info" || modalState.type === "question") && (
                  <i className="fa-solid fa-circle-question" style={{ fontSize: "52px", color: "#5b8e66" }}></i>
                )}
              </div>

              {modalState.heading && (
                <h4
                  className="custom-modal-heading"
                  style={{
                    color:
                      modalState.type === "success"
                        ? "#16a34a"
                        : modalState.type === "danger"
                        ? "#dc2626"
                        : modalState.type === "warning"
                        ? "#d97706"
                        : "#1e293b",
                  }}
                >
                  {modalState.heading}
                </h4>
              )}

              {modalState.message && (
                <p className="custom-modal-message">{modalState.message}</p>
              )}
            </div>

            {/* Footer */}
            <div className="custom-modal-footer">
              {modalState.mode === "confirm" && (
                <button
                  type="button"
                  className="custom-modal-btn btn-cancel"
                  onClick={() => closeModal(false)}
                >
                  {modalState.cancelText}
                </button>
              )}

              <button
                type="button"
                className={`custom-modal-btn btn-confirm ${modalState.type === "danger" ? "danger" : "primary"}`}
                onClick={() => closeModal(true)}
              >
                {modalState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    return {
      showConfirm,
      showAlert,
      confirm: showConfirm,
      alert: showAlert,
    };
  }
  return context;
}

export const showConfirm = (options) => {
  if (globalModalRef.confirm) {
    return globalModalRef.confirm(options);
  }
  const msg = typeof options === "string" ? options : (options?.message || options?.heading || options?.title || "");
  return Promise.resolve(window.confirm(msg));
};

export const showAlert = (options) => {
  if (globalModalRef.alert) {
    return globalModalRef.alert(options);
  }
  const msg = typeof options === "string" ? options : (options?.message || options?.heading || options?.title || "");
  window.alert(msg);
  return Promise.resolve(true);
};
