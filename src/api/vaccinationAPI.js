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

// Tạo đợt tiêm chủng mới
export const createVaccinationBatch = async (data) => {
  try {
    console.log('🚀 [Vaccination API] Bắt đầu tạo đợt tiêm chủng:', {
      timestamp: new Date().toISOString(),
      data: data
    });
    
    const response = await apiClient.post('/vaccinebatches', data);
    
    console.log('✅ [Vaccination API] Tạo đợt tiêm chủng thành công:', {
      timestamp: new Date().toISOString(),
      status: response.status,
      data: response.data
    });
    
    return response;
  } catch (error) {
    console.error('❌ [Vaccination API] Lỗi khi tạo đợt tiêm chủng:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
      requestData: data
    });
    
    throw error;
  }
   
  // return axios.post('http://localhost:8080/api/vaccinebatches', data);
};

// Lấy danh sách các đợt tiêm chủng
export const getVaccinationBatches = async () => {
  try {
    console.log('🚀 [Vaccination API] Bắt đầu lấy danh sách đợt tiêm chủng...', {
      timestamp: new Date().toISOString()
    });
    
    const response = await apiClient.get('/vaccinebatches');
    
    console.log('✅ [Vaccination API] Lấy danh sách đợt tiêm chủng thành công:', {
      timestamp: new Date().toISOString(),
      count: response.data.length
    });
    
    return response;
  } catch (error) {
    console.error('❌ [Vaccination API] Lỗi khi lấy danh sách đợt tiêm chủng:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

// Lấy vaccineType theo tên vaccine
export const getVaccineTypeByName = async (vaccineName) => {
  return apiClient.get(`/vaccine_types/getByVacinesName`, {
    params: { name: vaccineName }
  });
};

// Cập nhật đợt tiêm chủng theo ID
export const updateVaccinationBatch = async (batchId, data) => {
  try {
    // Ensure batchId is a number
    const numericBatchId = Number(batchId);
    
    console.log('🚀 [Vaccination API] Bắt đầu cập nhật đợt tiêm chủng:', {
      timestamp: new Date().toISOString(),
      batchId: numericBatchId,
      data: data
    });
    
    const response = await apiClient.put(`/vaccinebatches/editByVaccinebatch/${numericBatchId}`, data);
    
    console.log('✅ [Vaccination API] Cập nhật đợt tiêm chủng thành công:', {
      timestamp: new Date().toISOString(),
      status: response.status,
      data: response.data
    });
    
    return response;
  } catch (error) {
    console.error('❌ [Vaccination API] Lỗi khi cập nhật đợt tiêm chủng:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
      batchId: batchId,
      requestData: data
    });
    
    throw error;
  }
};

// Gửi phiếu đồng ý theo className
export const sendConsentFormByClassName = async (data) => {
  try {
    console.log('🚀 [Vaccination API] Gửi phiếu đồng ý theo className:', data);
    const response = await apiClient.post('/Consent_forms/send-consent', data);
    console.log('✅ [Vaccination API] Gửi phiếu đồng ý thành công:', response.data);
    return response;
  } catch (error) {
    console.error('❌ [Vaccination API] Lỗi khi gửi phiếu đồng ý:', error);
    throw error;
  }
};

// Lấy danh sách phiếu đồng ý cho y tá
export const getConsentForms = async () => {
  try {
    console.log('🚀 [Vaccination API] Bắt đầu lấy danh sách phiếu đồng ý...');
    const response = await apiClient.get('/Consent_forms/viewNurse');
    console.log('✅ [Vaccination API] Lấy danh sách phiếu đồng ý thành công:', response.data);
    return response;
  } catch (error) {
    console.error('❌ [Vaccination API] Lỗi khi lấy danh sách phiếu đồng ý:', error);
    throw error;
  }
};

// Lấy chi tiết phiếu đồng ý theo consent_form_id
export const getConsentFormDetail = async (consentFormId) => {
  try {
    console.log('🚀 [Vaccination API] Lấy chi tiết phiếu đồng ý:', consentFormId);
    const response = await apiClient.get(`/Consent_forms/consent-info`, {
      params: { consent_form_id: consentFormId }
    });
    console.log('✅ [Vaccination API] Lấy chi tiết phiếu đồng ý thành công:', response.data);
    return response;
  } catch (error) {
    console.error('❌ [Vaccination API] Lỗi khi lấy chi tiết phiếu đồng ý:', error);
    throw error;
  }
};
  export const geVaccinationRecords = async () => {
    try {
      console.log('🚀 [Vaccination API] Lấy danh sách hồ sơ:');
      const response = await apiClient.get(`/vaccination_records`, {
        
      });
      console.log('✅ [Vaccination API] Lấy hồ sơ thành công:', response.data);
      return response;
    } catch (error) {
      console.error('❌ [Vaccination API] Lỗi khi lấy hồ sơ:', error);
      throw error;
    }
};

// Lấy chi tiết hồ sơ tiêm chủng theo id
export const getVaccinationRecordDetail = async (id) => {
  try {
    console.log('🚀 [Vaccination API] Lấy chi tiết hồ sơ tiêm chủng:', id);
    const response = await apiClient.get(`/vaccination_records/${id}`);
    console.log('✅ [Vaccination API] Lấy chi tiết hồ sơ tiêm chủng thành công:', response.data);
    return response;
  } catch (error) {
    console.error('❌ [Vaccination API] Lỗi khi lấy chi tiết hồ sơ tiêm chủng:', error);
    throw error;
  }
};

// Ghi nhận tiêm chủng và gửi email
export const createVaccinationRecord = async (data) => {
  try {
    console.log('🚀 [Vaccination API] Ghi nhận tiêm chủng và gửi email:', data);
    const response = await apiClient.post('/vaccination_records/vaccination-records/send-email', data);
    console.log('✅ [Vaccination API] Ghi nhận tiêm chủng và gửi email thành công:', response.data);
    return response;
  } catch (error) {
    console.error('❌ [Vaccination API] Lỗi khi ghi nhận tiêm chủng và gửi email:', error);
    throw error;
  }
};

// Cập nhật lại hồ sơ tiêm chủng (resend)
export const updateVaccinationRecord = async (vaccinationRecordID, data) => {
  try {
    console.log('🚀 [Vaccination API] Gửi lại hồ sơ tiêm chủng:', vaccinationRecordID, data);
    const response = await apiClient.put(`/vaccination_records/vaccination-records/resend/${vaccinationRecordID}`, data);
    console.log('✅ [Vaccination API] Gửi lại hồ sơ tiêm chủng thành công:', response.data);
    return response;
  } catch (error) {
    console.error('❌ [Vaccination API] Lỗi khi gửi lại hồ sơ tiêm chủng:', error);
    throw error;
  }
};

// Cập nhật hồ sơ tiêm chủng theo vaccinationRecordID
    export const updateVaccinationRecordById = async (vaccinationRecordID, data) => {
      try {
        console.log('🚀 [Vaccination API] Gửi lại hồ sơ tiêm chủng:', vaccinationRecordID, data);
        const response = await apiClient.put(`/vaccination_records/editVaccineRecord/${vaccinationRecordID}`, data);
        console.log('✅ [Vaccination API] Gửi lại hồ sơ tiêm chủng thành công:', response.data);
        return response;
      } catch (error) {
        console.error('❌ [Vaccination API] Lỗi khi gửi lại hồ sơ tiêm chủng:', error);
        throw error;
      }
    };

// Lấy danh sách hồ sơ theo dõi sau tiêm của học sinh theo y tá
export const getStudentVaccinationRecordsFollowedByNurse = async () => {
  try {
    console.log('🚀 [Vaccination API] Bắt đầu lấy danh sách hồ sơ theo dõi sau tiêm của học sinh...', {
      timestamp: new Date().toISOString()
    });
    
    const response = await apiClient.get('/vaccination_records/StudentFollowedbyNurse');
    
    console.log('✅ [Vaccination API] Lấy danh sách hồ sơ theo dõi sau tiêm thành công:', {
      timestamp: new Date().toISOString(),
      count: response.data.length,
      data: response.data
    });
    return response;
  } catch (error) {
    console.error('❌ [Vaccination API] Lỗi khi lấy danh sách hồ sơ theo dõi sau tiêm:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    throw error;
  }
};

// Cập nhật phản ứng sau tiêm cho học sinh
export async function updateStudentFollowedByNurse(vaccinationRecordID, data) {
  const response = await fetch(`/api/vaccination_records/updateStudentFollowedbyNurse/${vaccinationRecordID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // Thêm Authorization nếu cần
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Cập nhật phản ứng sau tiêm thất bại');
  }
  return await response.json();
}

