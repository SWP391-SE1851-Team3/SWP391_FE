
import axios from 'axios';

export const loginByRole = (role, email, password) => {
  return axios.post("http://localhost:8080/api/auth/sign-in", { 
    emailName: email, 
    password,
    role 
  });
};