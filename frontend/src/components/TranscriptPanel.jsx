import { useEffect, useRef } from "react";

export default function TranscriptPanel({ transcripts, isRecording }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Transcript</span>
        {isRecording && <span style={styles.liveBadge}>LIVE</span>}
      </div>

      <div style={styles.body}>
        {transcripts.length === 0 ? (
          <p style={styles.empty}>
            {isRecording
              ? "Đang chờ âm thanh... (VB-Cable phải được bật)"
              : "Chưa có transcript. Nhấn Start Recording để bắt đầu."}
          </p>
        ) : (
          transcripts.map((t, i) => (
            <div key={t.id ?? i} style={styles.block}>
              <span style={styles.ts}>
                {t.timestamp
                  ? new Date(t.timestamp).toLocaleTimeString("vi-VN")
                  : ""}
              </span>
              <p style={styles.text}>{t.content}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
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
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: "#cdd6f4",
    fontWeight: 600,
    fontSize: 15,
  },
  liveBadge: {
    background: "#f38ba8",
    color: "#1e1e2e",
    fontSize: 11,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 4,
    letterSpacing: 1,
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  empty: {
    color: "#6c7086",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  block: {
    background: "#1e1e2e",
    borderRadius: 6,
    padding: "8px 12px",
    borderLeft: "3px solid #89b4fa",
  },
  ts: {
    color: "#6c7086",
    fontSize: 11,
    display: "block",
    marginBottom: 4,
  },
  text: {
    margin: 0,
    color: "#cdd6f4",
    fontSize: 14,
    lineHeight: 1.6,
  },
};
