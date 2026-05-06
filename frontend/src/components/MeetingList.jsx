import { useEffect, useState } from "react";
import { meetingsApi } from "../api/client";

const PLATFORM_COLORS = {
  zoom: "#2d8cff",
  meet: "#34a853",
  teams: "#6264a7",
  other: "#6c7086",
};

export default function MeetingList({ onSelect, selectedId }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      const res = await meetingsApi.list();
      setMeetings(res.data);
    } catch (e) {
      console.error("[MeetingList] fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Lịch sử cuộc họp</span>
        <button style={styles.refreshBtn} onClick={fetchMeetings}>↻</button>
      </div>

      <div style={styles.list}>
        {loading ? (
          <p style={styles.empty}>Đang tải...</p>
        ) : meetings.length === 0 ? (
          <p style={styles.empty}>Chưa có cuộc họp nào.</p>
        ) : (
          meetings.map((m) => (
            <div
              key={m.id}
              style={{
                ...styles.item,
                ...(selectedId === m.id ? styles.itemSelected : {}),
              }}
              onClick={() => onSelect(m)}
            >
              <div style={styles.itemTop}>
                <span style={styles.itemTitle}>{m.title}</span>
                <span
                  style={{
                    ...styles.platform,
                    background: PLATFORM_COLORS[m.platform] ?? PLATFORM_COLORS.other,
                  }}
                >
                  {m.platform ?? "other"}
                </span>
              </div>
              <span style={styles.meta}>{formatDate(m.started_at)}</span>
              <span
                style={{
                  ...styles.statusBadge,
                  color: m.status === "recording" ? "#f38ba8" : "#a6e3a1",
                }}
              >
                {m.status === "recording" ? "● Đang ghi" : "✓ Hoàn tất"}
              </span>
            </div>
          ))
        )}
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
    justifyContent: "space-between",
  },
  title: {
    color: "#cdd6f4",
    fontWeight: 600,
    fontSize: 15,
  },
  refreshBtn: {
    background: "none",
    border: "none",
    color: "#89b4fa",
    fontSize: 18,
    cursor: "pointer",
    padding: "0 4px",
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  empty: {
    color: "#6c7086",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  item: {
    background: "#1e1e2e",
    border: "1px solid #313244",
    borderRadius: 6,
    padding: "10px 12px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    transition: "border-color 0.15s",
  },
  itemSelected: {
    borderColor: "#89b4fa",
    background: "#24273a",
  },
  itemTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  itemTitle: {
    color: "#cdd6f4",
    fontWeight: 600,
    fontSize: 14,
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  platform: {
    fontSize: 10,
    fontWeight: 700,
    color: "#fff",
    padding: "2px 7px",
    borderRadius: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flexShrink: 0,
  },
  meta: {
    color: "#6c7086",
    fontSize: 12,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: 500,
  },
};
