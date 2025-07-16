import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor đính token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('[Interceptor] Using token:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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

export const viewConsentForm = async (studentId) => {
  try {
    const response = await apiClient.get(`/Consent_forms/byStudentId/${studentId}`);
    console.log('Consent Form for Student:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching consent form:', error);
    throw error;
  }
};

export const submitConsentForm = async (formData, id) => {
  try {
    const response = await apiClient.put(`/api/Consent_forms/Consent_forms/parent-response/${id}`, formData);
    console.log('Submitted Consent Form:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting consent form:', error);
    throw error;
  }
};