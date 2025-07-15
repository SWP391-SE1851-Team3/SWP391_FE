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

export const getStudentHealthProfiles = async (parentId) => {
  try {
    const response = await apiClient.get(`/students/Parents/${parentId}`);
    console.log('Student Health Profiles:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching student health profiles:', error);
    throw error;
  }
};

export const submitMedicationForm = async (data) => {
  try {
    const response = await apiClient.post('/medication-submission/submit', data);
    console.log('Submitted Medication Form:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting medication form:', error);
    throw error;
  }
};

export const uploadMedicineImage = async (submissionId, file, saveAsBase64 = true) => {
  if (!file) throw new Error('Không có file để upload');

  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(
    '/medication-submission/upload-medicine-image',
    formData,
    {
      params: {
        submissionId,
        saveAsBase64,
      },
    }
  );
  return response.data;
};

export const getMedicationSubmissionsByParentId = async (parentId) => {
  try {
    const response = await apiClient.get(`/medication-submission/submissions-info/parent/${parentId}`);
    console.log(`Medication Submissions for Parent ${parentId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching medication submissions by parent ID:', error);
    throw error;
  }
};

export const getMedicationSubmissionDetails = async (submissionId) => {
  try {
    const response = await apiClient.get(`/medication-submission/submissions/${submissionId}/details`);
    console.log(`Medication Submission Details for ${submissionId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching medication submission details:', error);
    throw error;
  }
};
