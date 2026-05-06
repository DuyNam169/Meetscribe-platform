import { useState, useEffect, useRef } from "react";
import { chatApi } from "../api/client";

export default function ChatPanel({ meetingId, initialHistory = [] }) {
  const [messages, setMessages] = useState(initialHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages(initialHistory);
  }, [meetingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !meetingId || loading) return;

    const userMsg = { id: Date.now(), role: "user", content: text, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatApi.ask(meetingId, text);
      setMessages(res.data.history);
    } catch (e) {
      const errMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Lỗi khi gọi AI. Vui lòng thử lại.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Hỏi AI về cuộc họp</span>
      </div>

      <div style={styles.body}>
        {!meetingId ? (
          <p style={styles.empty}>Chọn một cuộc họp để bắt đầu hỏi AI.</p>
        ) : messages.length === 0 ? (
          <p style={styles.empty}>Hỏi bất kỳ điều gì về transcript hiện tại...</p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={msg.id ?? i}
              style={{
                ...styles.bubble,
                ...(msg.role === "user" ? styles.userBubble : styles.assistantBubble),
              }}
            >
              <span style={styles.roleLabel}>
                {msg.role === "user" ? "Bạn" : "AI"}
              </span>
              <p style={styles.bubbleText}>{msg.content}</p>
            </div>
          ))
        )}
        {loading && (
          <div style={{ ...styles.bubble, ...styles.assistantBubble }}>
            <span style={styles.roleLabel}>AI</span>
            <p style={{ ...styles.bubbleText, color: "#6c7086" }}>Đang trả lời...</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          type="text"
          placeholder={meetingId ? "Hỏi về nội dung cuộc họp..." : "Chọn cuộc họp trước"}
          value={input}
          disabled={!meetingId || loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          style={styles.sendBtn}
          onClick={handleSend}
          disabled={!meetingId || loading || !input.trim()}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#181825",
    border: "1px solid #313244",
    borderRadius: 8,
    overflow: "hidden",
  },
  header: {
    padding: "12px 16px",
    background: "#1e1e2e",
    borderBottom: "1px solid #313244",
  },
  title: {
    color: "#cdd6f4",
    fontWeight: 600,
    fontSize: 15,
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  empty: {
    color: "#6c7086",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: 8,
    maxWidth: "90%",
  },
  userBubble: {
    background: "#313244",
    alignSelf: "flex-end",
    borderBottomRightRadius: 2,
  },
  assistantBubble: {
    background: "#1e1e2e",
    border: "1px solid #313244",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 2,
  },
  roleLabel: {
    fontSize: 11,
    color: "#6c7086",
    display: "block",
    marginBottom: 4,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bubbleText: {
    margin: 0,
    color: "#cdd6f4",
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: 12,
    borderTop: "1px solid #313244",
    background: "#1e1e2e",
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #45475a",
    background: "#313244",
    color: "#cdd6f4",
    fontSize: 14,
    outline: "none",
  },
  sendBtn: {
    padding: "8px 18px",
    borderRadius: 6,
    border: "none",
    background: "#89b4fa",
    color: "#1e1e2e",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
};
