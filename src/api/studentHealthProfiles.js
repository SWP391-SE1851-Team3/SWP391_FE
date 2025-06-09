import axios from 'axios';

export const getStudentHealthProfiles = (parentId) => {
    return axios.get(`http://localhost:8080/api/students/Parents/${parentId}`);
};

export const getStudentHealthProfileByStudentId = (studentId) => {
    return axios.get(`http://localhost:8080/api/StudentHealthProfiles/byStudentId/${studentId}`);
};

export const createStudentHealthProfile = (data) => {
    return axios.post('http://localhost:8080/api/StudentHealthProfiles', data);
};

export const updateStudentHealthProfile = (data) => {
    return axios.put('http://localhost:8080/api/StudentHealthProfiles/edit_profile_studentname', data);
};


