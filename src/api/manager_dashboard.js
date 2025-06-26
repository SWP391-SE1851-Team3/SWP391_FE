import axios from 'axios';

// Base URL configuration
const BASE_URL = 'http://localhost:8080/api/admin/dashboard';

// Thống kê tiêm chủng
export const getVaccinationStats = () => {
    return axios.get(`${BASE_URL}/vaccination`);
};

// Thống kê tổng quan hệ thống
export const getSystemStats = () => {
    return axios.get(`${BASE_URL}/system-stats`);
};

// Thống kê gửi thuốc
export const getMedicationStats = () => {
    return axios.get(`${BASE_URL}/medication`);
};

// Thống kê sự kiện y tế
export const getMedicalEvents = () => {
    return axios.get(`${BASE_URL}/medical-events`);
};

// Kiểm tra service
export const getHealthStatus = () => {
    return axios.get(`${BASE_URL}/health`);
};

// Thống kê khám sức khỏe
export const getHealthCheckStats = () => {
    return axios.get(`${BASE_URL}/health-check`);
};

// Lấy toàn bộ báo cáo dashboard
export const getFullReport = () => {
    return axios.get(`${BASE_URL}/full-report`);
};

// Optional: Export all functions as an object for convenience
export const dashboardApi = {
    getVaccinationStats,
    getSystemStats,
    getMedicationStats,
    getMedicalEvents,
    getHealthStatus,
    getHealthCheckStats,
    getFullReport
};