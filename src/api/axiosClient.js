// src/api/api.js
// Centralized Axios instance for communicating with FinSight backend

import axios from "axios";

// Create an Axios instance with base API URL
// VITE_API_BASE is defined in the frontend .env file
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

// --------------------------------------------------
// Request Interceptor
// Automatically attaches Clerk Bearer token to every request
// --------------------------------------------------
api.interceptors.request.use(async (config) => {
  // Access Clerk from global window object
  // (may be undefined during initial app load)
  const clerk = window?.Clerk;

  // Retrieve current session token (if user is authenticated)
  const token = await clerk?.session?.getToken?.();

  // Attach Authorization header for protected backend routes
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Continue request
  return config;
});

export default api;