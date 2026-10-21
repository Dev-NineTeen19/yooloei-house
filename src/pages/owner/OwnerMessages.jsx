import ChatBox from "../../components/chat/ChatBox";

export default function OwnerMessages() {
  return (
    <div className="messages-page-wrapper">
      <div className="messages-page-header" style={{ marginBottom: "14px" }}>
        <h1 style={{ fontSize: "22px", color: "#1e293b", fontWeight: 700, margin: "0 0 4px 0", letterSpacing: "-0.3px" }}>
          แชทข้อความ
        </h1>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0, fontWeight: 400 }}>
          พูดคุยและตอบคำถามผู้เช่าที่สนใจหอพักของคุณ
        </p>
      </div>

      <ChatBox defaultRole="owner" />
    </div>
  );
}

