// src/api/transactionApi.js
import axios from "axios";

// const API_BASE = process.env.VITE_API_BASE_URL || "http://localhost:3001";

const API_BASE = "http://localhost:3000";
const TRANSACTION_URL = `${API_BASE}/transaction`;

// -----------------------------
// GET: all transactions
// -----------------------------
export const fetchTransactions = async () => {
  const response = await axios.get(TRANSACTION_URL);
  return response.data;
};

// -----------------------------
// POST: add new transaction
// payload example:
// {
//   date: "2023-12-28",
//   type: "income",
//   amount: 1500,
//   note: "Salary"
// }
// -----------------------------
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

// -----------------------------
// PUT: update transaction
// -----------------------------
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

// -----------------------------
// DELETE: remove transaction
// -----------------------------
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
