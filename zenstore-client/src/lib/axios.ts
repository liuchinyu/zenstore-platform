import axios, { AxiosInstance, AxiosError } from "axios";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080/api/client",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 🔒 只負責通知，不負責執行跳轉
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
export { axios };
