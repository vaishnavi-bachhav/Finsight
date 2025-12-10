// src/api/cryptoApi.js
import axios from "axios";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

// ids example: ["bitcoin", "ethereum", "dogecoin"]
export const fetchCryptoPrices = async (ids = ["bitcoin"], vsCurrency = "usd") => {
  const res = await axios.get(`${COINGECKO_BASE}/simple/price`, {
    params: {
      ids: ids.join(","),
      vs_currencies: vsCurrency,
      include_24hr_change: true,
    },
  });

  // Example response:
  // {
  //   "bitcoin": { "usd": 44200, "usd_24h_change": -1.23 },
  //   "ethereum": { "usd": 2280, "usd_24h_change": 0.45 }
  // }
  return res.data;
};

export const fetchCryptoMarketChart = async (
  id = "bitcoin",
  vsCurrency = "usd",
  days = 30
) => {
  const res = await axios.get(`${COINGECKO_BASE}/coins/${id}/market_chart`, {
    params: {
      vs_currency: vsCurrency,
      days,
      interval: "daily",
    },
  });

  // Example: { prices: [[timestamp, price], ...], ... }
  return res.data;
};
