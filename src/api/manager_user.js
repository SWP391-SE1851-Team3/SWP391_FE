import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/admin/users'; 

/**
 * ❌ API này KHÔNG TỒN TẠI trên server của bạn
 * Bạn cần thêm API này vào backend hoặc loại bỏ chức năng này
 */
export const getAllUsers = () => {
  // Tạm thời return empty array để tránh lỗi
  return Promise.resolve({ data: [] });
  
  // Hoặc throw error để báo chức năng chưa có
  // throw new Error('API getAllUsers chưa được implement trên server');
};

/**
 * ✅ API này TỒN TẠI
 * GET /api/admin/users/getAllRole
 */
export const getAllRoles = () => {
  return axios.get(`${API_BASE_URL}/getAllRole`);
};

/**
 * ✅ API này TỒN TẠI  
 * POST /api/admin/users/createUser
 */
export const createUser = (userData) => {
  const formattedUserData = {
    userType: userData.userType || "",
    userName: userData.userName || "",
    password: userData.password || "",
    fullName: userData.fullName || "",
    phone: userData.phone || "",
    email: userData.email || "",
    isActive: typeof userData.isActive === 'number' ? userData.isActive : 1073741824,
    roleId: typeof userData.roleId === 'number' ? userData.roleId : 1073741824,
    occupation: userData.occupation || "",
    relationship: userData.relationship || "",
    certification: userData.certification || "",
    specialisation: userData.specialisation || ""
  };
  
  console.log('Creating user with data:', formattedUserData);
  return axios.post(`${API_BASE_URL}/createUser`, formattedUserData);
};

/**
 * ✅ API này TỒN TẠI
 * PUT /api/admin/users/updateUser/{id}
 */
export const updateUser = (id, userData) => {
  const formattedUserData = {
    ...userData,
    ...(userData.isActive !== undefined && { isActive: typeof userData.isActive === 'number' ? userData.isActive : parseInt(userData.isActive) }),
    ...(userData.roleId !== undefined && { roleId: typeof userData.roleId === 'number' ? userData.roleId : parseInt(userData.roleId) })
  };
  
  console.log(`Updating user ${id} with data:`, formattedUserData);
  return axios.put(`${API_BASE_URL}/updateUser/${id}`, formattedUserData);
};

/**
 * ✅ API này TỒN TẠI
 * DELETE /api/admin/users/deleteUser/{id}/{roleId}
 */
export const deleteUser = (id, roleId) => {
  console.log(`Deleting user ${id} with roleId ${roleId}`);
  return axios.delete(`${API_BASE_URL}/deleteUser/${id}/${roleId}`);
};

/**
 * Validates user data before sending to API
 */
export const validateUserData = (userData, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate) {
    if (!userData.userType?.trim()) errors.push('Loại người dùng là bắt buộc');
    if (!userData.userName?.trim()) errors.push('Tên đăng nhập là bắt buộc');
    if (!userData.password?.trim()) errors.push('Mật khẩu là bắt buộc');
    if (!userData.fullName?.trim()) errors.push('Họ và tên là bắt buộc');
    if (!userData.email?.trim()) errors.push('Email là bắt buộc');
  }
  
  if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email.trim())) {
    errors.push('Định dạng email không hợp lệ');
  }
  
  if (userData.phone && userData.phone.trim()) {
    const phoneDigits = userData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      errors.push('Số điện thoại phải có từ 10-15 chữ số');
    }
  }
  
  if (userData.userName && userData.userName.trim()) {
    if (userData.userName.includes(' ')) {
      errors.push('Tên đăng nhập không được chứa khoảng trắng');
    }
    if (userData.userName.length < 3) {
      errors.push('Tên đăng nhập phải có ít nhất 3 ký tự');
    }
  }
  
  if (!isUpdate && userData.password) {
    if (userData.password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Test API connection
 */
export const testConnection = async () => {
  try {
    await axios.get(`${API_BASE_URL}/getAllRole`);
    console.log('API connection successful');
    return true;
  } catch (error) {
    console.error('API connection failed:', error);
    return false;
  }
};

// Axios interceptors
axios.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status, response.statusText);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.statusText);
    console.error('Error details:', error.response?.data);
    return Promise.reject(error);
  }
);