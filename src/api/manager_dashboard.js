import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/admin/dashboard';

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

// Thống kê tiêm chủng
export const getVaccinationStats = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard/vaccination');
    return response.data;
  } catch (error) {
    console.error('Error fetching vaccination stats:', error);
    throw error;
  }
};

// Thống kê tổng quan hệ thống
export const getSystemStats = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard/system-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching system stats:', error);
    throw error;
  }
};

// Thống kê gửi thuốc
export const getMedicationStats = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard/medication');
    return response.data;
  } catch (error) {
    console.error('Error fetching medication stats:', error);
    throw error;
  }
};

// Thống kê sự kiện y tế
export const getMedicalEvents = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard/medical-events');
    return response.data;
  } catch (error) {
    console.error('Error fetching medical events:', error);
    throw error;
  }
};

export const getHealthStatus = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard/health');
    return response.data;
  } catch (error) {
    console.error('Error fetching health status:', error);
    throw error;
  }
};

export const getHealthCheckStats = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard/health-check');
    return response.data;
  } catch (error) {
    console.error('Error fetching health check stats:', error);
    throw error;
  }
};

export const getFullReport = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/dashboard/full-report', { params });
    return response;
  } catch (error) {
    console.error('Error fetching full report:', error);
    throw error;
  }
};

// Export all functions as an object for convenience
export const dashboardApi = {
  getVaccinationStats,
  getSystemStats,
  getMedicationStats,
  getMedicalEvents,
  getHealthStatus,
  getHealthCheckStats,
  getFullReport
};