import axios from 'axios';

const BASE_URL_Vaccine = 'http://localhost:8080/api/vaccinebatches';
const BASE_URL_HealthCheck = 'http://localhost:8080/api/health-check-schedule';

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

// Lấy danh sách các lô vaccine
export const getVaccineBatches = async () => {
  try {
    const response = await apiClient.get('/vaccinebatches');
    return response.data;
  } catch (error) {
    console.error('Error fetching vaccine batches:', error);
    throw error;
  }
};

// Cập nhật trạng thái form
export const updateConsentFormStatus = async (id, status) => {
  try {
    const response = await apiClient.put(`/vaccinebatches/admin/consent-forms/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating consent form status:', error);
    throw error;
  }
};

// Lấy thông tin loại vaccine theo ID
export const getVaccineTypeById = async (id) => {
  try {
    const response = await apiClient.get(`/vaccine_types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vaccine type by ID:', error);
    throw error;
  }
};

// Lấy danh sách tất cả lịch khám sức khỏe
export const getAllHealthCheck = async () => {
  try {
    const response = await apiClient.get('/health-check-schedule');
    return response.data;
  } catch (error) {
    console.error('Error fetching all health check schedules:', error);
    throw error;
  }
};

// Cập nhật trạng thái khám sức khỏe
export const updateHealthCheckStatus = async (id, status) => {
  try {
    const response = await apiClient.put(`/health-check-schedule/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating health check status:', error);
    throw error;
  }
};