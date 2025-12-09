// src/api/categoryApi.js
import axios from "axios";

//const API_BASE = process.env.VITE_API_BASE_URL || "http://localhost:3001";

const API_BASE =  "http://localhost:3000";
const CATEGORY_URL = `${API_BASE}/category`;

// -----------------------------
// GET: all categories
// -----------------------------
export const fetchCategories = async () => {
    const response = await axios.get(CATEGORY_URL);
    return response.data;
};

// -----------------------------
// POST: add new category
// payload example:
// { name: "Grocery", icon: "<base64 string>", type: "expense" }
// -----------------------------
export const addCategory = async (category) => {
  try {
    const res = await axios.post(CATEGORY_URL, category);
    // If your backend returns the inserted document or result:
    return res.data;
  } catch (error) {
    console.error("Failed to add category:", error);

    // Optional: throw a more friendly error for UI
    throw (
      error.response?.data ||
      new Error("Unable to add category. Please try again later.")
    );
  }
};


// -----------------------------
// PUT: update category
// updates example:
// { name: "Food", icon: "...", type: "expense" }
// -----------------------------
export const updateCategory = async (id, updates) => {
  try {
    const res = await axios.put(`${CATEGORY_URL}/${id}`, updates);
    return res.data;
  } catch (error) {
    console.error("Failed to update category:", error);
    throw (
      error.response?.data ||
      new Error("Unable to update category. Please try again later.")
    );
  }
};

// -----------------------------
// DELETE: remove category
// -----------------------------
export const deleteCategory = async (id) => {
  try {
    const res = await axios.delete(`${CATEGORY_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error("Failed to delete category:", error);
    throw (
      error.response?.data ||
      new Error("Unable to delete category. Please try again later.")
    );
  }
};