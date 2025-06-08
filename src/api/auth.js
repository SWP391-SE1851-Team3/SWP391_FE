import axios from 'axios';

const API_ENDPOINTS = {
  1: "http://localhost:8080/api/managers/login",
  2: "http://localhost:8080/api/SchoolNurses/login",
  3: "http://localhost:8080/api/parents/login"
};

export const loginByRole = (role, email, password) => {
  const endpoint = API_ENDPOINTS[role];
  return axios.post(endpoint, { email, password });
};
