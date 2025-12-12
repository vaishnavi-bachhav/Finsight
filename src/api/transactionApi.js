import api from "./axiosClient.js";

const TRANSACTION_URL = "/transaction";

// GET: grouped transactions
export const fetchTransactions = async () => {
  try {
    const response = await api.get(TRANSACTION_URL);
    return response.data;
  } catch (error) {
    console.error("Failed to get transactions:", error);
    throw new Error(
      error.response?.data?.message ||
      "Unable to get transactions. Please try again later."
    );
  }
};

// POST
export const addTransaction = async (transaction) => {
  try {
    const res = await api.post(TRANSACTION_URL, transaction);
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
    const res = await api.put(`${TRANSACTION_URL}/${id}`, updates);
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
    const res = await api.delete(`${TRANSACTION_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    throw (
      error.response?.data ||
      new Error("Unable to delete transaction. Please try again later.")
    );
  }
};
