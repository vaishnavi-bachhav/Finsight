import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

// Attach Bearer token for every request
api.interceptors.request.use(async (config) => {
  // If Clerk hasn't loaded yet, just continue (public endpoints will work)
  const clerk = window?.Clerk;
  const token = await clerk?.session?.getToken?.();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
