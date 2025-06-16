import axios from 'axios';
import { message } from 'antd';
import { Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api/medication-submission';
const TIMEOUT = 15000; // 15 seconds timeout

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
  }
});

// Request interceptor
apiClient.interceptors.request.use(config => {
  // Add loading indicator if needed
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor
apiClient.interceptors.response.use(response => {
  return response.data;
}, error => {
  return Promise.reject(error);
});

/**
 * Handles API errors consistently
 * @param {Error} error - The error object
 * @param {string} customMessage - Optional custom error message
 */
const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);
  
  let errorMessage = customMessage || 'Đã xảy ra lỗi';
  
  if (error.response) {
    // Server responded with error status
    const serverMessage = error.response.data?.message;
    if (serverMessage) {
      errorMessage = serverMessage;
    }
  } else if (error.request) {
    // No response received
    errorMessage = 'Không thể kết nối đến máy chủ';
  }
  
  message.error(errorMessage);
  return { error: true, message: errorMessage };
};

// API Services
const MedicationService = {
  /**
   * Submit new medication for a student
   * @param {Object} data - Medication data
   * @param {number} data.studentId - Student ID
   * @param {Array} data.medications - List of medications
   * @returns {Promise<{success: boolean, data?: any, error?: boolean}>}
   */
  async submitMedication(data) {
    try {
      const response = await apiClient.post('/submit', data);
      message.success('Gửi thuốc thành công!');
      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error, 'Gửi thuốc thất bại');
    }
  },

  /**
   * Get all medication submissions for parent
   * @param {number} parentId - Parent ID
   * @returns {Promise<{success: boolean, data?: Array, error?: boolean}>}
   */
  async getSubmissionsByParent(parentId) {
    try {
      const response = await apiClient.get(`/submissions/${parentId}`);
      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error, 'Không thể tải danh sách thuốc');
    }
  },

  /**
   * Get list of children for parent
   * @param {number} parentId - Parent ID
   * @returns {Promise<{success: boolean, data?: Array, error?: boolean}>}
   */
  async getChildrenByParent(parentId) {
    try {
      const response = await apiClient.get(`/children/${parentId}`);
      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error, 'Không thể tải danh sách học sinh');
    }
  },

  /**
   * Cancel medication submission
   * @param {number} submissionId - Submission ID
   * @returns {Promise<{success: boolean, error?: boolean}>}
   */
  async cancelSubmission(submissionId) {
    try {
      await apiClient.post('/submissions/cancel', { submissionId });
      message.success('Đã hủy yêu cầu gửi thuốc');
      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Hủy yêu cầu thất bại');
    }
  },

  /**
   * Get medication dashboard data
   * @returns {Promise<{success: boolean, data?: any, error?: boolean}>}
   */
  async getDashboard() {
    try {
      const response = await apiClient.get('/medication-dashboard');
      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error, 'Không thể tải dashboard');
    }
  },

  /**
   * Confirm medication has been taken
   * @param {number} submissionId - Submission ID
   * @returns {Promise<{success: boolean, error?: boolean}>}
   */
  async confirmMedicationTaken(submissionId) {
    try {
      await apiClient.post('/medication-taken', { submissionId });
      message.success('Đã xác nhận học sinh uống thuốc');
      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Xác nhận thất bại');
    }
  }
};

export default MedicationService;