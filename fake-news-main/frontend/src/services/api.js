import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Auth functions
export const login = async (username, password) => {
  try {
    const response = await api.post("/api/auth/login/", {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Login failed");
  }
};

export const logout = async () => {
  try {
    await api.post("/api/auth/logout/");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export const checkAdminStatus = async () => {
  try {
    const response = await api.get("/api/auth/admin-check/");
    return response.data;
  } catch (error) {
    throw new Error("Failed to check admin status");
  }
};

// Token management
export const getAuthToken = () => localStorage.getItem("authToken");
export const setAuthToken = (token) => localStorage.setItem("authToken", token);
export const removeAuthToken = () => localStorage.removeItem("authToken");

export const getAuthUser = () => {
  const user = localStorage.getItem("authUser");
  return user ? JSON.parse(user) : null;
};

export const setAuthUser = (user) =>
  localStorage.setItem("authUser", JSON.stringify(user));
export const removeAuthUser = () => localStorage.removeItem("authUser");

// Validation endpoints
export const submitValidation = async (data) => {
  try {
    // Convert to FormData for multipart/form-data submission
    const formData = new FormData();
    
    // Add text content if provided (matches backend serializer field name)
    if (data.text) formData.append("text", data.text);
    
    // Add URL if provided (matches backend serializer field name)
    if (data.url) formData.append("url", data.url);
    
    // Add audio file if provided (matches backend serializer field name)
    if (data.audio) formData.append("audio", data.audio);
    
    // Add video file if provided (matches backend serializer field name)
    if (data.video) formData.append("video", data.video);
    
    // Send FormData - Axios auto-detects and sets multipart/form-data with boundary
    const response = await api.post("/api/validate/", formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Validation submission failed");
  }
};

export const getValidationResult = async (submissionId) => {
  try {
    const response = await api.get(`/api/result/${submissionId}/`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch validation result");
  }
};

export const getRecentValidations = async () => {
  try {
    const response = await api.get("/api/recent/");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch recent validations");
  }
};

// Admin endpoints
export const getAdminStats = async () => {
  try {
    const response = await api.get("/api/admin/stats/");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch admin stats");
  }
};

export const getAdminSubmissions = async (page = 1) => {
  try {
    const response = await api.get(`/api/admin/submissions/?page=${page}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch submissions");
  }
};

export const deleteSubmission = async (submissionId) => {
  try {
    await api.delete(`/api/admin/submissions/${submissionId}/`);
  } catch (error) {
    throw new Error("Failed to delete submission");
  }
};

export const getAdminTrends = async () => {
  try {
    const response = await api.get("/api/admin/trends/");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch trends");
  }
};

export const getAdminActivity = async () => {
  try {
    const response = await api.get("/api/admin/activity/");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch activity");
  }
};

export const getAdminSuspiciousWords = async () => {
  try {
    const response = await api.get("/api/admin/suspicious-words/");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch suspicious words");
  }
};

export const getAdminSystemUsage = async () => {
  try {
    const response = await api.get("/api/admin/system-usage/");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch system usage");
  }
};

export default api;
