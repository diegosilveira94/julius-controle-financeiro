import api from "./api";

export const attachmentService = {
  list: (expenseId) =>
    api.get(`/expenses/${expenseId}/attachments`).then((r) => r.data),
  // Envia um arquivo por requisição para ter progresso individual.
  upload: (expenseId, file, onProgress) => {
    const data = new FormData();
    data.append("files", file);
    return api
      .post(`/expenses/${expenseId}/attachments`, data, {
        onUploadProgress: (e) => {
          if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100));
        },
      })
      .then((r) => r.data[0]);
  },
  // O arquivo exige o token JWT, então é baixado como Blob (não dá para usar
  // a URL direto num <img>).
  getBlob: (id) =>
    api
      .get(`/attachments/${id}/file`, { responseType: "blob" })
      .then((r) => r.data),
  remove: (id) => api.delete(`/attachments/${id}`).then((r) => r.data),
};
