import path from "node:path";

export default {
  dir: path.resolve(process.env.UPLOAD_DIR || "uploads"),
  maxFileSize: 5 * 1024 * 1024,
  maxFilesPerExpense: 3,
  allowedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
};
