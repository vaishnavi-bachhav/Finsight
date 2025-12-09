// src/api/transactionApi.js
import axios from "axios";

const API_BASE = "http://localhost:3000";
const TRANSACTION_URL = `${API_BASE}/transaction`;

// GET: grouped transactions
export const fetchTransactions = async () => {
  const response = await axios.get(TRANSACTION_URL);
  // returns [{ month, transactions: [...] }, ...]
  return response.data;
};

// POST
export const addTransaction = async (transaction) => {
  try {
    const res = await axios.post(TRANSACTION_URL, transaction);
    return res.data;
  } catch (error) {
    console.error("Failed to add transaction:", error);
    throw (
      error.response?.data ||
      new Error("Unable to add transaction. Please try again later.")
    );
  }
};

// PUT
export const updateTransaction = async (id, updates) => {
  try {
    const res = await axios.put(`${TRANSACTION_URL}/${id}`, updates);
    return res.data;
  } catch (error) {
    console.error("Failed to update transaction:", error);
    throw (
      error.response?.data ||
      new Error("Unable to update transaction. Please try again later.")
    );
  }
};

// DELETE
export const deleteTransaction = async (id) => {
  try {
    const res = await axios.delete(`${TRANSACTION_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    throw (
      error.response?.data ||
      new Error("Unable to delete transaction. Please try again later.")
    );
  }
};
