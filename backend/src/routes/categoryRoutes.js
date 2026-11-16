import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/accessControl.js";
import CategoryView from "../views/categoryView.js";

const router = express.Router();
const canManageCategories = [authMiddleware, requirePermission("categories")];

router.get("/categories", authMiddleware, CategoryView.getAll);
router.get("/categories/:id", authMiddleware, CategoryView.getById);
router.post("/categories", canManageCategories, CategoryView.create);
router.patch("/categories/:id", canManageCategories, CategoryView.update);
router.delete("/categories/:id", canManageCategories, CategoryView.delete);

export default router;
