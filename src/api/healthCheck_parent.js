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

export const getHealthConsentByParent = async (parentId) => {
  try {
    const response = await apiClient.get(`/health-consent/parent/${parentId}`);
    console.log('Health Consent by Parent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching health consent by parent:', error);
    throw error;
  }
};

export const getHealthConsentByFormId = async (formId) => {
  try {
    const response = await apiClient.get(`/health-consent/${formId}`);
    console.log('Health Consent by Form ID:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching health consent by form ID:', error);
    throw error;
  }
};

export const updateHealthConsent = async (formId, isAgreed, notes = '') => {
  try {
    const response = await apiClient.put(`/health-consent/${formId}`,null,
      {
        params: {
          isAgreed,
          notes
        }
      }
    );

    console.log('Updated Health Consent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating health consent:', error);
    throw error;
  }
};


export const getHealthCheckResultsByStudent = async (studentId) => {
  try {
    const response = await apiClient.get(`/health-check-results/student/${studentId}`);
    console.log('Health Check Results by Student:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching health check results by student:', error);
    throw error;
  }
};