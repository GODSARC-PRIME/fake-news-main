import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach auth token to every request that has one
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Helper — backend returns { error: "..." }, not { detail: "..." }
// This handles both shapes plus any plain message key
const extractError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  return data.error || data.detail || data.message || fallback;
};

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export const login = async (username, password) => {
  try {
    const response = await api.post("/api/auth/login/", { username, password });
    return response.data;
  } catch (error) {
    throw new Error(extractError(error, "Login failed"));
  }
};

export const logout = async () => {
  try {
    await api.post("/api/auth/logout/");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// FIX #1: was /api/auth/admin-check/ — backend route is /api/auth/check-admin/
export const checkAdminStatus = async () => {
  try {
    const response = await api.get("/api/auth/check-admin/");
    return response.data;
  } catch (error) {
    throw new Error("Failed to check admin status");
  }
};

// ─────────────────────────────────────────────
// Token / user storage
// ─────────────────────────────────────────────

export const getAuthToken = () => localStorage.getItem("authToken");
export const setAuthToken  = (token) => localStorage.setItem("authToken", token);
export const removeAuthToken = () => localStorage.removeItem("authToken");

export const getAuthUser = () => {
  const user = localStorage.getItem("authUser");
  return user ? JSON.parse(user) : null;
};
export const setAuthUser    = (user) => localStorage.setItem("authUser", JSON.stringify(user));
export const removeAuthUser = () => localStorage.removeItem("authUser");

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

/**
 * Submit content for fake-news analysis.
 *
 * Accepts a plain object: { text?, url?, audio?: File, video?: File }
 * Builds FormData internally so Axios sets the correct multipart boundary.
 * Never pass a pre-built FormData — Axios can't read its fields.
 */
export const submitValidation = async (data) => {
  try {
    const formData = new FormData();

    // Field names must match the backend ValidationCreateSerializer
    if (data.text)  formData.append("text",  data.text.trim());
    if (data.url)   formData.append("url",   data.url.trim());
    if (data.audio) formData.append("audio", data.audio);
    if (data.video) formData.append("video", data.video);

    // Do NOT set Content-Type header — Axios sets multipart/form-data + boundary automatically
    const response = await api.post("/api/validate/", formData);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error, "Validation submission failed"));
  }
};

export const getValidationResult = async (submissionId) => {
  try {
    const response = await api.get(`/api/result/${submissionId}/`);
    return response.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to fetch result"));
  }
};

export const getRecentValidations = async () => {
  try {
    const response = await api.get("/api/recent/");
    return response.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to fetch recent validations"));
  }
};

// ─────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────

export const getAdminStats = async () => {
  try {
    const response = await api.get("/api/admin/stats/");
    return response.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to fetch admin stats"));
  }
};

// FIX #3: backend uses limit/offset pagination, not page number
export const getAdminSubmissions = async (page = 1, limit = 50) => {
  try {
    const offset = (page - 1) * limit;
    const response = await api.get(
      `/api/admin/submissions/?limit=${limit}&offset=${offset}`
    );
    // Backend returns { total, limit, offset, results: [...] }
    // Return results array directly so existing components don't break
    return response.data.results ?? response.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to fetch submissions"));
  }
};

// FIX #2: was /api/admin/submissions/${id}/ — backend route ends with /delete/
export const deleteSubmission = async (submissionId) => {
  try {
    await api.delete(`/api/admin/submissions/${submissionId}/delete/`);
  } catch (error) {
    throw new Error(extractError(error, "Failed to delete submission"));
  }
};

export const getAdminTrends = async () => {
  try {
    const response = await api.get("/api/admin/trends/");
    return response.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to fetch trends"));
  }
};

export const getAdminActivity = async () => {
  try {
    const response = await api.get("/api/admin/activity/");
    return response.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to fetch activity"));
  }
};

export const getAdminSuspiciousWords = async () => {
  try {
    const response = await api.get("/api/admin/suspicious-words/");
    return response.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to fetch suspicious words"));
  }
};

export const getAdminSystemUsage = async () => {
  try {
    const response = await api.get("/api/admin/system-usage/");
    return response.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to fetch system usage"));
  }
};

export default api;
