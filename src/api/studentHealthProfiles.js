import axios from 'axios';

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

export const getStudentHealthProfiles = (parentId) => {
    return apiClient.get(`/students/Parents/${parentId}`);
};

export const getStudentHealthProfileByStudentId = (studentId) => {
    return apiClient.get(`/StudentHealthProfiles/byStudentId/${studentId}`);
};

export const createStudentHealthProfile = (data) => {
    return apiClient.post('/StudentHealthProfiles', data);
};

export const updateStudentHealthProfile = (data) => {
    return apiClient.put('/StudentHealthProfiles/edit_profile_studentname', data);
};


