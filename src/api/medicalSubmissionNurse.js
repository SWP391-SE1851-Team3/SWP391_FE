import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/medication-submission';

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

export const getMedicationSubmissions = async () => {
  try {
    const response = await apiClient.get('/medication-submission/submissions-info');
    return response.data;
  } catch (error) {
    console.error('Error fetching medication submissions:', error);
    throw error;
  }
};

// Cập nhật tình trạng xác nhận thuốc
export const updateMedicationStatus = async (confirmId, { status, reason, nurseId, evidence }) => {
  const response = await apiClient.put(`/medication-confirmations/${confirmId}/status`, {
    status,
    reason,
    nurseId,
    evidence
  });
  return response.data;
};

export const getMedicationSubmissionDetails = async (submissionId) => {
  try {
    const response = await apiClient.get(`/medication-submission/submissions/${submissionId}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medication submission details:', error);
    throw error;
  }
};

export const getMedicationImage = async (submissionId) => {
  try {
    console.log('=== DETAILED REQUEST DEBUG ===');
    console.log('submissionId:', submissionId);
    console.log('apiClient.defaults.baseURL:', apiClient.defaults.baseURL);
    
    const fullUrl = `${apiClient.defaults.baseURL}/medicine-image/${submissionId}`;
    console.log('Full URL will be:', fullUrl);
    
    // Kiểm tra headers sẽ được gửi
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 30) + '...' : 'No token');
    
    const response = await apiClient.get(`/medicine-image/${submissionId}`, {
      responseType: 'blob'
    });
    
    console.log('Response status:', response.status);
    console.log('Response data size:', response.data.size);
    
    if (response.data.size === 0) {
      throw new Error('Empty response from server');
    }
    
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('=== DETAILED ERROR ===');
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request method:', error.config?.method);
    console.error('Request headers:', error.config?.headers);
    throw error;
  }
};

// Lấy chi tiết xác nhận của nhân viên y tế theo submissionId
export const getMedicationConfirmationBySubmission = async (submissionId) => {
  const response = await apiClient.get(`/medication-confirmations/by-submission/${submissionId}`);
  return response.data;
};
