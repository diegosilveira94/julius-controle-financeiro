import axios from "axios";

let accessToken = null;
let refreshing = null;

export function setAccessToken(token) {
  accessToken = token;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

export function refreshSession() {
  refreshing ??= api
    .post("/auth/refresh")
    .then(({ data }) => {
      setAccessToken(data.token);
      return data;
    })
    .finally(() => {
      refreshing = null;
    });

  return refreshing;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const path = window.location.pathname;

    if (
      response?.status === 401 &&
      !config._retry &&
      !config.url.startsWith("/auth/")
    ) {
      config._retry = true;
      try {
        await refreshSession();
        return api(config);
      } catch {
        setAccessToken(null);
        if (path !== "/login" && path !== "/register") {
          window.location.assign("/login");
        }
      }
    }

    const message =
      response?.data?.error ||
      response?.data?.message ||
      error.message ||
      "Erro inesperado. Tente novamente.";

    return Promise.reject(new Error(message));
  }
);

export default api;
