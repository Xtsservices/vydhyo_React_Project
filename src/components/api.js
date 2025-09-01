// Import axios
import axios from "axios";

// Base API URL
// const API_BASE_URL = "http://192.168.0.105:3000";

const API_BASE_URL = "https://server.vydhyo.com";

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

export const apiDelete = (url, data = {}, config = {}) =>
  axiosWithToken.delete(url, {
    ...config,
    data, // 👈 explicitly add data field to config
  });

// CRUD Operations without token
export const apiGetWithoutToken = (url, config = {}) =>
  axiosWithoutToken.get(url, config);

export const apiPostWithoutToken = (url, data = {}, config = {}) =>
  axiosWithoutToken.post(url, data, config);


export function postKYCDetails({ file, userId, panNumber }) {
  const fd = new FormData();
  fd.append("panFile", file, file.name);           // <-- must be 'panFile'
  fd.append("userId", String(userId));
  fd.append("panNumber", String(panNumber).toUpperCase());

  return axiosWithToken.post("/users/addKYCDetails", fd, {
    // DO NOT set Content-Type manually; browser adds boundary
    transformRequest: [(data) => data],
  });
}

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
