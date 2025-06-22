import axios from 'axios';

// Tạo đợt tiêm chủng mới
export const createVaccinationBatch = async (data) => {
  try {
    console.log('🚀 [Vaccination API] Bắt đầu tạo đợt tiêm chủng:', {
      timestamp: new Date().toISOString(),
      data: data
    });
    
    const response = await axios.post('http://localhost:8080/api/vaccinebatches', data);
    
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
    
    const response = await axios.get('http://localhost:8080/api/vaccinebatches');
    
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
  return axios.get(`http://localhost:8080/api/vaccine_types/getByVacinesName`, {
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
    
    const response = await axios.put(`http://localhost:8080/api/vaccinebatches/editByVaccinebatch/${numericBatchId}`, data);
    
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
    const response = await axios.post('http://localhost:8080/api/Consent_forms/consent-forms/send-by-classname', data);
    console.log('✅ [Vaccination API] Gửi phiếu đồng ý thành công:', response.data);
    return response;
  } catch (error) {
    console.error('❌ [Vaccination API] Lỗi khi gửi phiếu đồng ý:', error);
    throw error;
  }
};
