import axios from 'axios';

export const loginByRole = (role, email, password) => {
  const API_ENDPOINTS = {
    1: "http://localhost:8080/api/parents/login",
    2: "http://localhost:8080/api/SchoolNurses/login",
    3: "http://localhost:8080/api/managers/login"
  };
  const endpoint = API_ENDPOINTS[role];
  return axios.post(endpoint, { email, password });
};
