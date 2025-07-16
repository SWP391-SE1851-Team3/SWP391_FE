import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/admin/users';

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

// Lấy danh sách tài khoản theo roleId (API dashboard)
export const fetchUsersByRole = async (roleId) => {
  try {
    const response = await apiClient.get(`/admin/dashboard/full-account/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
};

// Thêm tài khoản mới
export const createUser = async (userData) => {
  try {
    const response = await apiClient.post('/admin/users/createUser', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Cập nhật tài khoản
export const updateUser = async (id, roleId, userData) => {
  try {
    const response = await apiClient.put(`/admin/users/updateUser/${id}/${roleId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Xóa tài khoản
export const deleteUser = async (id, roleId) => {
  try {
    const response = await apiClient.delete(`/admin/users/deleteUser/${id}/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Import học sinh từ file Excel
export const importStudentsFromExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/excel/import-students', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing students from Excel:', error);
    throw error;
  }
};