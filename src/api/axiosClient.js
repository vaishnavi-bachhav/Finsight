// src/api/axiosClient.js
import axios from "axios";

const API_BASE = "http://localhost:3000"; // your Express backend

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // 🔐 send Clerk cookies to backend
});

export default api;
