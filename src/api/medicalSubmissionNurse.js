import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/medication-submission';

export const getMedicationSubmissions = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/submissions-info`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medication submissions:', error);
    throw error;
  }
};

export const updateMedicationStatus = async (submissionId, status, reason) => {
  try {
    const body = { status };
    if (reason) body.reason = reason;
    const response = await axios.put(`http://localhost:8080/api/medication-confirmations/${submissionId}/status`, body);
    return response.data;
  } catch (error) {
    console.error('Error updating medication status:', error);
    throw error;
  }
};

export const getMedicationSubmissionDetails = async (submissionId) => {
  try {
    const response = await axios.get(`${BASE_URL}/submissions/${submissionId}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medication submission details:', error);
    throw error;
  }
};
