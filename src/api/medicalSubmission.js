
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/medication-submission';

export const getAllMedicationSubmissions = () => {
  return axios.get(`${BASE_URL}/submissions`);
};

export const addMedicationSubmission = (payload) => {
  return axios.post(`${BASE_URL}/add`, payload);
};
