import { useState, useCallback, useEffect } from "react";
import RecordingControls from "./components/RecordingControls";
import TranscriptPanel from "./components/TranscriptPanel";
import ChatPanel from "./components/ChatPanel";
import MeetingList from "./components/MeetingList";
import { useWebSocket } from "./hooks/useWebSocket";
import { meetingsApi } from "./api/client";

const TAB_LIVE = "live";
const TAB_HISTORY = "history";

export default function App() {
  const [tab, setTab] = useState(TAB_LIVE);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedTranscripts, setSelectedTranscripts] = useState([]);
  const [selectedChat, setSelectedChat] = useState([]);
  const [wsStatus, setWsStatus] = useState("idle");

  const handleWsMessage = useCallback((data) => {
    if (data.type === "transcript") {
      setTranscripts((prev) => [
        ...prev,
        { id: Date.now(), content: data.content, timestamp: data.timestamp },
      ]);
    } else if (data.type === "status") {
      setWsStatus(data.message);
    } else if (data.type === "error") {
      console.error("[WS error]", data.message);
      setWsStatus("error: " + data.message);
    }
  }, []);

  const { connect, send, disconnect } = useWebSocket(
    currentMeeting?.id,
    handleWsMessage
  );

  const handleMeetingStart = (meeting) => {
    setCurrentMeeting(meeting);
    setTranscripts([]);
    setChatHistory([]);
    setIsRecording(true);
    setTab(TAB_LIVE);

    const ws = connect();
    if (ws) {
      ws.onopen = () => {
        send({ action: "start" });
      };
    }
  };

  const handleMeetingEnd = () => {
    send({ action: "stop" });
    disconnect();
    setIsRecording(false);
  };

  const handleSelectHistory = async (meeting) => {
    setSelectedMeeting(meeting);
    try {
      const [txRes, chatRes] = await Promise.all([
        meetingsApi.getTranscript(meeting.id),
        meetingsApi.getChatHistory(meeting.id),
      ]);
      setSelectedTranscripts(txRes.data);
      setSelectedChat(chatRes.data);
    } catch (e) {
      console.error("[App] load history error", e);
    }
  };

  return (
    <div style={styles.root}>
      <RecordingControls
        currentMeeting={currentMeeting}
        isRecording={isRecording}
        onMeetingStart={handleMeetingStart}
        onMeetingEnd={handleMeetingEnd}
      />

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(tab === TAB_LIVE ? styles.tabActive : {}) }}
          onClick={() => setTab(TAB_LIVE)}
        >
          Cuộc họp hiện tại
        </button>
        <button
          style={{ ...styles.tab, ...(tab === TAB_HISTORY ? styles.tabActive : {}) }}
          onClick={() => setTab(TAB_HISTORY)}
        >
          Lịch sử
        </button>
        {wsStatus && wsStatus !== "idle" && (
          <span style={styles.wsStatus}>WS: {wsStatus}</span>
        )}
      </div>

      <div style={styles.content}>
        {tab === TAB_LIVE ? (
          <>
            <div style={styles.panel}>
              <TranscriptPanel transcripts={transcripts} isRecording={isRecording} />
            </div>
            <div style={styles.panel}>
              <ChatPanel
                meetingId={currentMeeting?.id}
                initialHistory={chatHistory}
              />
            </div>
          </>
        ) : (
          <>
            <div style={{ ...styles.panel, maxWidth: 320, minWidth: 240 }}>
              <MeetingList
                onSelect={handleSelectHistory}
                selectedId={selectedMeeting?.id}
              />
            </div>
            <div style={styles.panel}>
              <TranscriptPanel
                transcripts={selectedTranscripts}
                isRecording={false}
              />
            </div>
            <div style={styles.panel}>
              <ChatPanel
                meetingId={selectedMeeting?.id}
                initialHistory={selectedChat}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#11111b",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  tabs: {
    display: "flex",
    gap: 0,
    padding: "8px 16px 0",
    background: "#181825",
    borderBottom: "1px solid #313244",
    alignItems: "center",
  },
  tab: {
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#6c7086",
    fontSize: 14,
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: 500,
  },
  tabActive: {
    color: "#89b4fa",
    borderBottomColor: "#89b4fa",
  },
  wsStatus: {
    marginLeft: "auto",
    fontSize: 12,
    color: "#6c7086",
  },
  content: {
    flex: 1,
    display: "flex",
    gap: 12,
    padding: 12,
    overflow: "hidden",
  },
  panel: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
};
