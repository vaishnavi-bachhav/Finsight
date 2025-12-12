import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE; // adjust for prod if needed

export const fetchFxRate = async ({ base = "USD", symbols = "INR" }) => {
  const res = await axios.get(`${API_BASE}/currency/rate`, {
    params: { base, symbols },
  });
  return res.data; // { base, date, rates: { INR: 83.21 } }
};