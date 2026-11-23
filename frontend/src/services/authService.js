import api from "./api";

export const authService = {
  login: (credentials) => api.post("/auth/login", credentials).then((r) => r.data),
  logout: () => api.post("/auth/logout"),
  register: (data) => api.post("/users", data).then((r) => r.data),
};
