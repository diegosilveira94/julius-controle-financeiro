import api from "./api";

export const childService = {
  list: () => api.get("/children").then((r) => r.data),
  create: (data) => api.post("/children", data).then((r) => r.data),
  update: (id, data) => api.patch(`/children/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/children/${id}`).then((r) => r.data),
  summary: (id) => api.get(`/children/${id}/summary`).then((r) => r.data),
};
