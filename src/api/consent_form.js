import axios from 'axios';

export const getStudentsByParent = async (parentId) => {
    return axios.get(`http://localhost:8080/api/students/Parents/${parentId}`);
};

export const ViewConsentForm = (studentId) => {
  return axios.get(`http://localhost:8080/api/Consent_forms/byStudentId/${studentId}`);
};

export const submitConsentForm = (formData) => {
  return axios.post('http://localhost:8080/api/Consent_forms/consent-forms/parent-confirm', formData);
};

