import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

export const getHealthConsentByParent = async (parentId) => {
  const response = await axios.get(`${BASE_URL}/api/health-consent/parent/${parentId}`);
  return response.data;
};

export const getHealthConsentByFormId = async (formId) => {
  const response = await axios.get(`${BASE_URL}/api/health-consent/${formId}`);
  return response.data;
};

export const updateHealthConsent = async (formId, formData) => {
  const response = await axios.put(`${BASE_URL}/api/health-consent/${formId}`, null, {
    params: formData
  });
  return response.data;
};

export const getHealthCheckResultsByStudent = async (studentId) => {
  const response = await axios.get(`${BASE_URL}/api/health-check-results/student/${studentId}`);
  return response.data;
};