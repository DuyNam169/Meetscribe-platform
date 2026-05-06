import { useState } from "react";
import { meetingsApi } from "../api/client";

const PLATFORMS = ["zoom", "meet", "teams", "other"];

export default function RecordingControls({ onMeetingStart, onMeetingEnd, currentMeeting, isRecording }) {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("zoom");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tên cuộc họp.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await meetingsApi.create({ title: title.trim(), platform });
      onMeetingStart(res.data);
      setTitle("");
    } catch (e) {
      setError("Không thể tạo meeting. Kiểm tra kết nối backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!currentMeeting) return;
    setLoading(true);
    try {
      await meetingsApi.end(currentMeeting.id);
      onMeetingEnd();
    } catch (e) {
      setError("Không thể kết thúc meeting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>MeetScribe</h2>

      {!isRecording ? (
        <div style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Tên cuộc họp..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
          />
          <select
            style={styles.select}
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
          <button style={styles.btnStart} onClick={handleStart} disabled={loading}>
            {loading ? "Đang tạo..." : "▶ Start Recording"}
          </button>
        </div>
      ) : (
        <div style={styles.activeBar}>
          <span style={styles.recDot} />
          <span style={styles.recLabel}>
            Đang ghi — <strong>{currentMeeting.title}</strong> ({currentMeeting.platform})
          </span>
          <button style={styles.btnStop} onClick={handleStop} disabled={loading}>
            {loading ? "Đang dừng..." : "■ Stop"}
          </button>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    background: "#1e1e2e",
    padding: "16px 24px",
    borderBottom: "1px solid #313244",
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  heading: {
    margin: 0,
    color: "#cdd6f4",
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 1,
  },
  form: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: 200,
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #45475a",
    background: "#313244",
    color: "#cdd6f4",
    fontSize: 14,
    outline: "none",
  },
  select: {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #45475a",
    background: "#313244",
    color: "#cdd6f4",
    fontSize: 14,
    cursor: "pointer",
  },
  btnStart: {
    padding: "8px 20px",
    borderRadius: 6,
    border: "none",
    background: "#a6e3a1",
    color: "#1e1e2e",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  activeBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#f38ba8",
    animation: "pulse 1s infinite",
    display: "inline-block",
  },
  recLabel: {
    color: "#cdd6f4",
    fontSize: 14,
    flex: 1,
  },
  btnStop: {
    padding: "8px 20px",
    borderRadius: 6,
    border: "none",
    background: "#f38ba8",
    color: "#1e1e2e",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  error: {
    color: "#f38ba8",
    margin: 0,
    fontSize: 13,
    width: "100%",
  },
};
