import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://skillswap-backend-rqk3.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("skillswapAccessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("skillswapUser");
      localStorage.removeItem("skillswapAccessToken");
      window.dispatchEvent(new Event("skillswap-auth-change"));
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data ||
    error.message ||
    "Could not connect to the server."
  );
}

export default api;
