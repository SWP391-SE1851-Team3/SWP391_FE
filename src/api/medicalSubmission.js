import axios from 'axios';
import { message } from 'antd';
import { Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';


export const getStudentHealthProfiles = (parentId) => {
    return axios.get(`http://localhost:8080/api/students/Parents/${parentId}`);
};

export const submitMedicationForm = async (data) => {
  try {
    const response = await axios.post('http://localhost:8080/api/medication-submission/submit', data);
    return response.data;
  } catch (error) {
    console.error("Error submitting medication form:", error);
    throw error;
  }
};

export const getMedicationSubmissionsByParentId = (parentId) => {
  return axios.get(`http://localhost:8080/api/medication-submission/submissions/${parentId}`);
};

// Lấy chi tiết đơn thuốc theo submissionId
export const getMedicationSubmissionDetails = (submissionId) => {
  return axios.get(`http://localhost:8080/api/medication-submission/submissions/${submissionId}/details`);
};
