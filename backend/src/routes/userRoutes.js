import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { requireOwner, requireSelf } from "../middlewares/accessControl.js";
import UserView from "../views/userView.js";

const router = express.Router();

router.post("/auth/login", UserView.login);
router.post("/users", UserView.create);
router.get("/users", authMiddleware, UserView.getAll);
router.get("/users/:id", authMiddleware, requireSelf, UserView.getById);
router.put("/users/:id", authMiddleware, requireSelf, UserView.update);
router.delete(
  "/users/:id",
  authMiddleware,
  requireSelf,
  requireOwner,
  UserView.delete,
);

export default router;
