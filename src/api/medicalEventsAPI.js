import axios from 'axios';
import { message } from 'antd';

const API_BASE = 'http://localhost:8080/api/medical-events';
const API_BASE1 = `http://localhost:8080/getAll`
// Create new emergency medical event
export const createEmergencyEvent = async (eventData) => {
  try {
    console.log("📦 Sending to /emergency:", eventData);
    const response = await axios.post(`${API_BASE}/emergency`, eventData);
    return response.data;
  } catch (error) {
    console.error("❌ Error from /emergency:", error.response?.data || error.message);
    throw error;
  }
};

// Update medical event
export const updateMedicalEvent = async (eventId, eventTypeId, eventData) => {
  try {
    const response = await axios.put(
      `${API_BASE}/${eventId}?eventTypeId=${eventTypeId}`,
      eventData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all medical events
export const getAllMedicalEvents = async () => {
  try {
    const response = await axios.get(API_BASE1);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy danh sách học sinh theo lớp
export const fetchStudentsByClass = async (className) => {
  try {
    const response = await axios.get(`${API_BASE}/${className}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students by class:', error);
    throw error;
  }
};

// Lấy chi tiết sự kiện theo endpoint mới
export const getEventDetailsByEndpoint = async (eventId, setLoading) => {
  try {
    setLoading?.(true);
    const res = await axios.get(`${API_BASE}/viewDetails/${eventId}`, {
      params: { eventId }
    });
    return res.data;
  } catch (err) {
    console.error('Lỗi khi tải chi tiết sự kiện:', err);
    message.error('Không thể tải chi tiết sự kiện');
    throw err;
  } finally {
    setLoading?.(false);
  }
};

// Get all event names
export const getEventNames = async () => {
  try {
    const response = await axios.get(`${API_BASE}/all`);
    // Transform the response to match the expected structure
    const formattedData = response.data.map(item => ({
      eventTypeId: item.eventTypeId || 0,
      typeName: item.typeName || ''
    }));
    return formattedData;
  } catch (error) {
    console.error('Error fetching event names:', error);
    throw error;
  }
};


