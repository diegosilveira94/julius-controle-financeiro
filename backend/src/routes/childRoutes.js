import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import allowFields from "../middlewares/allowFields.js";
import { requireOwner } from "../middlewares/accessControl.js";
import ChildView from "../views/childView.js";

const router = express.Router();
const ownerOnly = [authMiddleware, requireOwner];

router.get("/children", ownerOnly, ChildView.getAll);
router.post(
  "/children",
  ownerOnly,
  allowFields("name", "email", "password", "permissions"),
  ChildView.create,
);
router.patch(
  "/children/:id",
  ownerOnly,
  allowFields("name", "password", "permissions", "isActive"),
  ChildView.update,
);
router.delete("/children/:id", ownerOnly, ChildView.delete);
router.get("/children/:id/summary", ownerOnly, ChildView.getSummary);

export default router;
