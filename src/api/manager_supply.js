import axios from 'axios';
const BASE_URL = 'http://localhost:8080/api/medical-supplies';

// Lấy danh sách tất cả vật tư y tế
export async function getAllMedicalSupplies() {
  const res = await axios.get('http://localhost:8080/api/admin/dashboard/reportMedicalSupply');
  return res.data;
}

// Lấy thông tin vật tư y tế theo ID
export async function getMedicalSupplyById(id) {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
}

// Thêm mới vật tư y tế
export async function createMedicalSupply(data) {
  const res = await axios.post(BASE_URL, data);
  return res.data;
}

// Cập nhật thông tin vật tư y tế theo ID
export async function updateMedicalSupply(id, data) {
  const res = await axios.put(`${BASE_URL}/${id}`, data);
  return res.data;
}

// Xóa vật tư y tế theo ID
export async function deleteMedicalSupply(id) {
  const res = await axios.delete(`${BASE_URL}/${id}`);
  return res.data;
}

// Tìm kiếm vật tư y tế theo tên
export async function searchMedicalSuppliesByName(name) {
  const res = await axios.get(`${BASE_URL}/search`, { params: { name } });
  return res.data;
}

// Tìm kiếm vật tư y tế theo ID danh mục
export async function searchMedicalSuppliesByCategoryId(categoryId) {
  const res = await axios.get(`${BASE_URL}/search/category-id`, { params: { categoryId } });
  return res.data;
}