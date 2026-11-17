import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import allowFields from "../middlewares/allowFields.js";
import { requireOwner, requireSelf } from "../middlewares/accessControl.js";
import UserView from "../views/userView.js";

const router = express.Router();
const userFields = allowFields("name", "email", "password");

router.post("/auth/login", allowFields("email", "password"), UserView.login);
router.post("/users", userFields, UserView.create);
router.get("/users", authMiddleware, UserView.getAll);
router.get("/users/:id", authMiddleware, requireSelf, UserView.getById);
router.put(
  "/users/:id",
  authMiddleware,
  requireSelf,
  userFields,
  UserView.update,
);
router.delete(
  "/users/:id",
  authMiddleware,
  requireSelf,
  requireOwner,
  UserView.delete,
);

export default router;
