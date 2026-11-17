import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import allowFields from "../middlewares/allowFields.js";
import { requirePermission } from "../middlewares/accessControl.js";
import CategoryView from "../views/categoryView.js";

const router = express.Router();
const canManageCategories = [authMiddleware, requirePermission("categories")];
const categoryFields = allowFields("name", "description");

router.get("/categories", authMiddleware, CategoryView.getAll);
router.get("/categories/:id", authMiddleware, CategoryView.getById);
router.post(
  "/categories",
  canManageCategories,
  categoryFields,
  CategoryView.create,
);
router.patch(
  "/categories/:id",
  canManageCategories,
  categoryFields,
  CategoryView.update,
);
router.delete("/categories/:id", canManageCategories, CategoryView.delete);

export default router;
