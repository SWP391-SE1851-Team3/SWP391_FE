import axios from 'axios';
import { message } from 'antd';



// Create axios instance with authentication
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Create new emergency medical event
export const createEmergencyEvent = async (eventData) => {
  try {
    console.log("📦 Sending to /emergency:", eventData);
    const response = await apiClient.post('/api/medical-events/emergency', eventData);
    return response.data;
  } catch (error) {
    console.error("❌ Error from /emergency:", error.response?.data || error.message);
    throw error;
  }
};

// Update medical event by eventDetailsId (kiểu dữ liệu mới)
export const updateMedicalEvent = async (eventDetailsId, eventData) => {
  console.log('Calling:', `/api/medical-events/${eventDetailsId}`, eventData);
  const response = await apiClient.put(
    `/api/medical-events/${eventDetailsId}`,
    eventData
  );
  return response.data;
};

// Get all medical events
export const getAllMedicalEvents = async () => {
  const response = await apiClient.get('/getAll');
  return response.data;
};

// Lấy danh sách học sinh theo lớp (hỗ trợ nhiều lớp)
export const fetchStudentsByClass = async (classNames) => {
  try {
    let url = '/api/medical-events/className';
    if (Array.isArray(classNames)) {
      const params = classNames.map(c => `className=${encodeURIComponent(c)}`).join('&');
      url += `?${params}`;
    } else if (typeof classNames === 'string') {
      url += `?className=${encodeURIComponent(classNames)}`;
    }
    const response = await apiClient.get(url);
    console.log('Kết quả fetchStudentsByClass:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching students by class:', error);
    throw error;
  }
};

// Lấy chi tiết sự kiện theo eventDetailsId (kiểu dữ liệu mới)
export const getEventDetailsByEndpoint = async (eventDetailsId, setLoading) => {
  try {
    setLoading?.(true);
    // Gọi endpoint với eventDetailsId
    const res = await apiClient.get(`/api/medical-events/viewDetails/${eventDetailsId}`);
    return res.data; // Đảm bảo trả về đúng kiểu dữ liệu mới
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
    const response = await apiClient.get('/api/medical-events/getAllEventTypeName');
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

//Lấy vật tư y tế 
export const getMedicalSupplies = async () => {
  try{
    const response = await apiClient.get('/api/medical-supplies');
    console.log('Kết quả getMedicalSupplies:', response.data);
    return response.data;
  }catch (error) {
    console.error('Error fetching medical supplies:', error);
    throw error;
  }
};


