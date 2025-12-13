import api from "./axiosClient";

// backend baseURL already set in axiosClient
export const fetchInflation = async (country = "USA") => {
  const res = await api.get(`/inflation`, { params: { country } });
  return res.data; // { latest, series }
};
