import axios from 'axios';

// Create axios instance with authentication
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
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

export const getStudentsByParent = async (parentId) => {
  try {
    const response = await apiClient.get(`/students/Parents/${parentId}`);
    console.log('Students by Parent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching students by parent:', error);
    throw error;
  }
};

export const getMedicalEventsDetail = async (parentId, studentId) => {
  try {
    const response = await apiClient.get(`/medical-events/getMedicalEventsDetailParent?parentId=${parentId}&studentID=${studentId}`);
    console.log('Medical Events Detail Parent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching medical events detail parent:', error);
    throw error;
  }
};