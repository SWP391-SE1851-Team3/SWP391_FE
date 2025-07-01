import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Tạo axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      throw new Error(`HTTP ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
      throw new Error('Network Error: Unable to connect to server');
    } else {
      throw new Error(error.message);
    }
  }
);

// Export const functions
export const getHealthConsentByParent = async (parentId) => {
  const response = await api.get(`/api/health-consent/parent/${parentId}`);
  return response.data;
};

export const getHealthConsentByFormId = async (formId) => {
  const response = await api.get(`/api/health-consent/${formId}`);
  return response.data;
};

export const updateHealthConsent = async (formId, formData) => {
  const response = await api.put(`/api/health-consent/${formId}`, formData);
  return response.data;
};

export const getHealthCheckResultsByStudent = async (studentId) => {
  const response = await api.get(`/api/health-check-results/student/${studentId}`);
  return response.data;
};