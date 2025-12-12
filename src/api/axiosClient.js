// src/api/axiosClient.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE; // your Express backend

console.log(API_BASE);
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // 🔐 send Clerk cookies to backend
});

export default api;
