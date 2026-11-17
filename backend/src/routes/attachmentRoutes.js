import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import AttachmentView from "../views/attachmentView.js";

const router = express.Router();

router.get(
  "/expenses/:id/attachments",
  authMiddleware,
  AttachmentView.listByExpense,
);
router.post(
  "/expenses/:id/attachments",
  authMiddleware,
  uploadMiddleware,
  AttachmentView.create,
);
router.get("/attachments/:id/file", authMiddleware, AttachmentView.getFile);
router.delete("/attachments/:id", authMiddleware, AttachmentView.delete);

export default router;
