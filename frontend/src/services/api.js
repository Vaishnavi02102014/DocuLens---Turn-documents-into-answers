import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

/* ADD TOKEN TO EVERY REQUEST */

API.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});

/* AUTH */

export const signup = (data) => API.post("/auth/signup", data);

export const login = (data) => API.post("/auth/login", data);

/* PDF */

export const uploadPDF = (file) => {

  const formData = new FormData();
  formData.append("file", file);

  return API.post("/upload-pdf", formData);

};

export const getDocuments = () => API.get("/list-pdfs");

export const deleteDocument = (filename) =>
  API.delete(`/delete-pdf/${encodeURIComponent(filename)}`);

export default API;

// this allows react to communicate the fastAPI backend.