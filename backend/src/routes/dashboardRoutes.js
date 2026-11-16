import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/accessControl.js";
import DashboardView from "../views/dashboardView.js";

const router = express.Router();
const canUseExpenses = [authMiddleware, requirePermission("expenses")];

router.get(
  "/dashboard/total-expenses",
  canUseExpenses,
  DashboardView.getTotalExpenses,
);
router.get(
  "/dashboard/expenses-count",
  canUseExpenses,
  DashboardView.getExpensesCount,
);
router.get(
  "/dashboard/expenses-by-category",
  canUseExpenses,
  DashboardView.getExpensesByCategory,
);

export default router;
