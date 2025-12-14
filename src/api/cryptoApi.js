// src/api/cryptoApi.js
// Lightweight client for CoinGecko public APIs

import axios from "axios";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

// Fetch latest prices (and 24h change) for one or more cryptocurrencies
export const fetchCryptoPrices = async (
  ids = ["bitcoin"],
  vsCurrency = "usd"
) => {
  const res = await axios.get(`${COINGECKO_BASE}/simple/price`, {
    params: {
      ids: ids.join(","),          // e.g. "bitcoin,ethereum"
      vs_currencies: vsCurrency,   // e.g. "usd"
      include_24hr_change: true,
    },
  });

  return res.data;
};

// Fetch historical market chart data (used for graphs)
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

  return res.data;
};