// src/api/categoryApi.js
import axios from "axios";

//const API_BASE = process.env.VITE_API_BASE_URL || "http://localhost:3001";

const API_BASE =  "http://localhost:3001";

export const fetchCategories = async () => {
    const response = await axios.get(`${API_BASE}/category`);
    return response.data;
};
