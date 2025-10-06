import axios from "axios";

const API = axios.create({
  baseURL: "https://digimonnaie.netlify.app/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // token admin
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
