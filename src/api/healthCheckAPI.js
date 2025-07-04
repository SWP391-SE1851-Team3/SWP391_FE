import axios from 'axios';

// Lấy danh sách đợt kiểm tra sức khỏe
export const getHealthCheckSchedules = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/health-check-schedule');
    console.log('Health Check Schedules:', response.data); // Ghi log dữ liệu trả về
    return response.data;
  } catch (error) {
    console.error('Error fetching health check schedules:', error);
    throw error;
  }
};

// Tạo mới đợt kiểm tra sức khỏe
export const createHealthCheckSchedule = async (data) => {
  try {
    const response = await axios.post('http://localhost:8080/api/health-check-schedule', data);
    console.log('Created Health Check Schedule:', response.data); // Ghi log dữ liệu trả về
    return response.data;
  } catch (error) {
    console.error('Error creating health check schedule:', error);
    throw error;
  }
};
 
// Cập nhật đợt kiểm tra sức khỏe
export const updateHealthCheck = async (health_ScheduleID, data) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/health-check-schedule/${health_ScheduleID}`, data);
    console.log('Updated Health Check Schedule:', response.data); // Ghi log dữ liệu trả về
    return response.data;
  } catch (error) {
    console.error('Error updating health check schedule:', error);
    throw error;
  }
};

// Lấy danh sách phiếu xác nhận
export const getAllHealthConsents = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/health-consent/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching health consents:', error);
    throw error;
  }
};

// Tạo phiếu xác nhận cho lớp
export const createHealthConsentForClass = async (data) => {
  try {
    const response = await axios.post('http://localhost:8080/api/health-consent/create-for-class', data);
    return response.data;
  } catch (error) {
    console.error('Error creating health consent for class:', error);
    throw error;
  }
};

// Tạo phiếu xác nhận cho nhiều lớp
export const createHealthConsentForMultipleClasses = async (data) => {
  try {
    const response = await axios.post('http://localhost:8080/api/health-consent/create-for-multiple-classes', data);
    return response.data;
  } catch (error) {
    console.error('Error creating health consent for multiple classes:', error);
    throw error;
  }
};

// Lấy danh sách hồ sơ khám sức khỏe
export const getAllHealthCheckResults = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/health-check-results/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching health check results:', error);
    throw error;
  }
};

// Lấy chi tiết hồ sơ khám sức khỏe của học sinh theo ID
export const getHealthCheckResultsByStudentID = async (studentID) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/health-check-results/student/${studentID}`);
    console.log('Health Check Results for Student:', response.data); // Ghi log dữ liệu trả về
    return response.data;
  } catch (error) {
    console.error('Error fetching health check results for student:', error);
    throw error;
  }
};

// Tạo mới hồ sơ khám sức khỏe
export const createHealthCheckResult = async (data) => {
  try {
    const response = await axios.post('http://localhost:8080/api/health-check-results/create', data);
    console.log('API trả về:', response.data); // Log dữ liệu trả về từ API
    return response.data; // Đảm bảo trả về đúng dữ liệu
  } catch (error) {
    console.error('Error creating health check result:', error);
    throw error;
  }
};

// Cập nhật hồ sơ khám sức khỏe
export const updateHealthCheckResult = async (checkID, nurseId, data) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/health-check-results/${checkID}?nurseID=${nurseId}`, data);
    console.log('Updated Health Check Result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating health check result:', error);
    throw error;
  }
};

// Lấy danh sách tư vấn y tế của học sinh
export const getAllHealthConsultations = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/health-consultation/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching health consultations:', error);
    throw error;
  }
};

// Cập nhật tư vấn y tế
export const updateHealthConsultation = async (consultID, data) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/health-consultation/${consultID}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating health consultation:', error);
    throw error;
  }
};
