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
  const response = await apiClient.get(`/medication-submission/medicine-image/${submissionId}`, {
    responseType: 'text'
  });
  if (!response.data || response.data.length === 0) {
    throw new Error('Empty response from server');
  }
  return response.data;
};

// Lấy chi tiết xác nhận của nhân viên y tế theo submissionId
export const getMedicationConfirmationBySubmission = async (submissionId) => {
  const response = await apiClient.get(`/medication-confirmations/by-submission/${submissionId}`);
  return response.data;
};

// Upload evidence image
export const uploadEvidenceImage = async (file, confirmId, saveAsBase64 = true) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('confirmId', confirmId);
  formData.append('saveAsBase64', saveAsBase64);

  const response = await apiClient.post('/medication-confirmations/evidence-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// THÊM MỚI: Get evidence image
export const getEvidenceImage = async (confirmId) => {
  const response = await apiClient.get(`/medication-confirmations/evidence-image/${confirmId}`, {
    responseType: 'text'
  });
  if (!response.data || response.data.length === 0) {
    throw new Error('Empty response from server');
  }
  return response.data;
};