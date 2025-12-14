// src/api/fxApi.js
// Client for fetching foreign exchange rates

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE; // Backend base URL

// Fetch FX rate for given base and target currency
export const fetchFxRate = async ({ base = "USD", symbols = "INR" }) => {
  const res = await axios.get(`${API_BASE}/currency/rate`, {
    params: { base, symbols },
  });

  return res.data; // { base, date, rates: { INR: 83.21 } }
};