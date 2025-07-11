// Import axios
import axios from "axios";

// Base API URL

// const API_BASE_URL = "http://192.168.1.42:3000";

const API_BASE_URL = "http://216.10.251.239:3000";

// Helper to get token from localStorage (or any storage)
const getToken = () => localStorage.getItem("accessToken");

// Axios instance with token
const axiosWithToken = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to request if available
axiosWithToken.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Axios instance without token
const axiosWithoutToken = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// CRUD Operations with token
export const apiGet = (url, config = {}) => axiosWithToken.get(url, config);

export const apiPost = (url, data = {}, config = {}) =>
  axiosWithToken.post(url, data, config);

export const apiPut = (url, data = {}, config = {}) =>
  axiosWithToken.put(url, data, config);

export const apiDelete = (url, config = {}) =>
  axiosWithToken.delete(url, config);

// CRUD Operations without token
export const apiGetWithoutToken = (url, config = {}) =>
  axiosWithoutToken.get(url, config);

export const apiPostWithoutToken = (url, data = {}, config = {}) =>
  axiosWithoutToken.post(url, data, config);

// File upload with token (multipart/form-data)
export const apiUploadFile = (
  url,
  file,
  fieldName = "file",
  extraData = {},
  config = {}
) => {
  const formData = new FormData();
  formData.append(fieldName, file);
  Object.entries(extraData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return axiosWithToken.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
};

// File upload without token (multipart/form-data)
export const apiUploadFileWithoutToken = (
  url,
  file,
  fieldName = "file",
  extraData = {},
  config = {}
) => {
  const formData = new FormData();
  formData.append(fieldName, file);
  Object.entries(extraData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return axiosWithoutToken.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
};
