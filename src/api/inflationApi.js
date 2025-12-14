import api from "./axiosClient";

// Fetch inflation data for a given country (default: USA)
export const fetchInflation = async (country = "USA") => {
  const res = await api.get(`/inflation`, { params: { country } });
  return res.data; // Returns { latest, series }
};