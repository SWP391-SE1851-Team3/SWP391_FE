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

export const updateMedicationStatus = async (submissionId, status, reason, evidence) => {
  try {
    // Lấy nurseId từ localStorage
    const nurseId = localStorage.getItem('nurseId') || localStorage.getItem('nurseID') || '';
    const body = { status, nurseId };
    if (reason) body.reason = reason;
    if (evidence) body.evidence = evidence;
    const response = await apiClient.put(`/medication-confirmations/${submissionId}/status`, body);
    return response.data;
  } catch (error) {
    console.error('Error updating medication status:', error);
    throw error;
  }
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
