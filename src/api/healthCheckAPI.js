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
