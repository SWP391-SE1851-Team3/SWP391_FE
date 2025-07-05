import axios from 'axios';
const BASE_URL_Vaccine = "http://localhost:8080/api/vaccinebatches";
const BASE_URL_HealthCheck = "http://localhost:8080/api/health-check-schedule";

// Lấy danh sách các lô vaccine
export async function getVaccineBatches() {
  const res = await axios.get(BASE_URL_Vaccine);
  return res.data;
}

// Cập nhật trạng thái form
export async function updateConsentFormStatus(id, status) {
  const url = `${BASE_URL_Vaccine}/admin/consent-forms/${id}/status`;
  const res = await axios.put(url, { status });
  return res.data;
}

export async function getVaccineTypeById(id) {
  const res = await axios.get(`http://localhost:8080/api/vaccine_types/${id}`);
  return res.data;
}

export async function getAllHealthCheck() {
  const res = await axios.get(BASE_URL_HealthCheck);
  return res.data;
}

export async function updateHealthCheckStatus(id, status) {
  const url = `${BASE_URL_Vaccine}/${id}/status`;
  const res = await axios.put(url, { status });
  return res.data;
}