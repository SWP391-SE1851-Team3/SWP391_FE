import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/medical-supplies';

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

// Lấy danh sách tất cả vật tư y tế
export const getAllMedicalSupplies = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard/reportMedicalSupply');
    return response.data;
  } catch (error) {
    console.error('Error fetching all medical supplies:', error);
    throw error;
  }
};

// Lấy thông tin vật tư y tế theo ID
export const getMedicalSupplyById = async (id) => {
  try {
    const response = await apiClient.get(`/medical-supplies/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medical supply by ID:', error);
    throw error;
  }
};

// Thêm mới vật tư y tế
export const createMedicalSupply = async (data) => {
  try {
    const response = await apiClient.post('/medical-supplies', data);
    return response.data;
  } catch (error) {
    console.error('Error creating medical supply:', error);
    throw error;
  }
};

// Cập nhật thông tin vật tư y tế theo ID
export const updateMedicalSupply = async (id, data) => {
  try {
    const response = await apiClient.put(`/medical-supplies/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating medical supply:', error);
    throw error;
  }
};

// Xóa vật tư y tế theo ID
export const deleteMedicalSupply = async (id) => {
  try {
    const response = await apiClient.delete(`/medical-supplies/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting medical supply:', error);
    throw error;
  }
};

// Tìm kiếm vật tư y tế theo tên
export const searchMedicalSuppliesByName = async (name) => {
  try {
    const response = await apiClient.get('/medical-supplies/search', { params: { name } });
    return response.data;
  } catch (error) {
    console.error('Error searching medical supplies by name:', error);
    throw error;
  }
};

// Tìm kiếm vật tư y tế theo ID danh mục
export const searchMedicalSuppliesByCategoryId = async (categoryId) => {
  try {
    const response = await apiClient.get('/medical-supplies/search/category-id', { params: { categoryId } });
    return response.data;
  } catch (error) {
    console.error('Error searching medical supplies by category ID:', error);
    throw error;
  }
};