import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000"
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

export const generateSummary = async (filename, token) => {
  const res = await fetch(
    `http://127.0.0.1:8000/generate-summary/${filename}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.json();
};

export default API;

// this allows react to communicate the fastAPI backend.