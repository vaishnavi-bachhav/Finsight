import api from "./axiosClient.js";

const CATEGORY_URL = `/category`;

// -----------------------------
// GET: all categories
// -----------------------------
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

// -----------------------------
// POST: add new category
// payload example:
// { name: "Grocery", icon: "<base64 string>", type: "expense" }
// -----------------------------
export const addCategory = async (category) => {
  try {
    const res = await api.post(CATEGORY_URL, category);
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

// -----------------------------
// DELETE: remove category
// -----------------------------
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