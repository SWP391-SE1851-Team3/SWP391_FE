import axios from "axios";

export const API_BASE_URL = "http://localhost:8080/api/admin/users";

// Lấy danh sách tài khoản theo roleId (API dashboard)
export const fetchUsersByRole = async (roleId) => {
  // GET /api/admin/dashboard/full-account/{roleID}
  const url = `http://localhost:8080/api/admin/dashboard/full-account/${roleId}`;
  const response = await axios.get(url);
  return response.data;
};

// Thêm tài khoản mới
export const createUser = async (userData) => {
  // POST /api/admin/users/createUser
  const url = `${API_BASE_URL}/createUser`;
  const response = await axios.post(url, userData);
  return response.data;
};

// Cập nhật tài khoản
export const updateUser = async (id, roleId, userData) => {
  // PUT /api/admin/users/updateUser/{id}/{roleId}
  const url = `${API_BASE_URL}/updateUser/${id}/${roleId}`;
  const response = await axios.put(url, userData);
  return response.data;
};

// Xóa tài khoản
export const deleteUser = async (id, roleId) => {
  // DELETE /api/admin/users/deleteUser/{id}/{roleId}
  const url = `${API_BASE_URL}/deleteUser/${id}/${roleId}`;
  const response = await axios.delete(url);
  return response.data;
};