import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const meetingsApi = {
  create: (payload) => client.post("/meetings/", payload),
  list: () => client.get("/meetings/"),
  get: (id) => client.get(`/meetings/${id}`),
  end: (id) => client.patch(`/meetings/${id}/end`),
  getTranscript: (id) => client.get(`/meetings/${id}/transcript`),
  getChatHistory: (id) => client.get(`/meetings/${id}/chat`),
};

export const chatApi = {
  ask: (meetingId, content) => client.post(`/chat/${meetingId}`, { content }),
};

export default client;
