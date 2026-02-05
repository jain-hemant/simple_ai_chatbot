import axios from 'axios';

const API_URL = 'api/chat';

// Get or Create Session ID
export const getSessionId = () => {
  let sessionId = localStorage.getItem('chatSessionId');
  if (!sessionId) {
    // We let the backend generate the UUID, but we need to store it once received.
    // For the first request, we send null, backend returns a new ID.
    return null; 
  }
  return sessionId;
};

export const saveSessionId = (id) => {
  localStorage.setItem('chatSessionId', id);
};

export const sendMessage = async (message) => {
  const sessionId = getSessionId();
  const response = await axios.post(`${API_URL}/message`, { message, sessionId });
  
  // If this was a new session, save the ID
  if (response.data.sessionId) {
    saveSessionId(response.data.sessionId);
  }
  
  return response.data;
};

export const getHistory = async () => {
  const sessionId = getSessionId();
  if (!sessionId) return [];
  
  try {
    const response = await axios.get(`${API_URL}/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to load history", error);
    return [];
  }
};