import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach authentication token to every request
api.interceptors.request.use(
  (config) => {
    // localStorage only exists in the browser
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("authToken");

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Centralized response/error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  }
);

export default api;