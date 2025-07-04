import axios from 'axios';
const BASE_URL = "http://localhost:8080/api/vaccinebatches";

// Lấy danh sách các lô vaccine
export async function getVaccineBatches() {
  const res = await axios.get(BASE_URL);
  return res.data;
}

// Cập nhật trạng thái form
export async function updateConsentFormStatus(id, status) {
  const url = `${BASE_URL}/admin/consent-forms/${id}/status`;
  const res = await axios.put(url, { status });
  return res.data;
}

export async function getVaccineTypeById(id) {
  const res = await axios.get(`http://localhost:8080/api/vaccine_types/${id}`);
  return res.data;
}