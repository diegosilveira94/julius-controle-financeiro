import multer from "multer";
import uploadConfig from "../config/upload.js";

// Mantém os arquivos em memória: o tipo real é conferido pela assinatura
// (magic bytes) no controller antes de qualquer coisa ir para o disco.
const upload = multer({
  storage: multer.memoryStorage(),
  defParamCharset: "utf8",
  limits: {
    fileSize: uploadConfig.maxFileSize,
    files: uploadConfig.maxFilesPerExpense,
  },
}).array("files", uploadConfig.maxFilesPerExpense);

const LIMIT_MESSAGES = {
  LIMIT_FILE_SIZE: `File too large. Max size is ${uploadConfig.maxFileSize / 1024 / 1024} MB.`,
  LIMIT_FILE_COUNT: `Too many files. Max is ${uploadConfig.maxFilesPerExpense} per expense.`,
  LIMIT_UNEXPECTED_FILE: `Too many files. Max is ${uploadConfig.maxFilesPerExpense} per expense.`,
};

export default function uploadMiddleware(req, res, next) {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .send({ error: LIMIT_MESSAGES[err.code] || err.message });
    }
    if (err) return next(err);
    return next();
  });
}
