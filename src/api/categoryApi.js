// src/api/categoryApi.js
// Category-related API calls

import api from "./axiosClient.js";

const CATEGORY_URL = `/category`;

// Fetch all categories for the logged-in user
export const fetchCategories = async () => {
  try {
    const response = await api.get(CATEGORY_URL);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw (
      error.response?.data ||
      new Error("Unable to load categories. Please try again later.")
    );
  }
};

// Add a new category
export const addCategory = async (category) => {
  try {
    const res = await api.post(CATEGORY_URL, category);
    return res.data;
  } catch (error) {
    console.error("Failed to add category:", error);
    throw (
      error.response?.data ||
      new Error("Unable to add category. Please try again later.")
    );
  }
};

// Update an existing category
export const updateCategory = async (id, updates) => {
  try {
    const res = await api.put(`${CATEGORY_URL}/${id}`, updates);
    return res.data;
  } catch (error) {
    console.error("Failed to update category:", error);
    throw (
      error.response?.data ||
      new Error("Unable to update category. Please try again later.")
    );
  }
};

// Delete a category
export const deleteCategory = async (id) => {
  try {
    const res = await api.delete(`${CATEGORY_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error("Failed to delete category:", error);
    throw (
      error.response?.data ||
      new Error("Unable to delete category. Please try again later.")
    );
  }
};