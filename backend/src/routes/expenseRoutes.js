import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import allowFields from "../middlewares/allowFields.js";
import { requirePermission } from "../middlewares/accessControl.js";
import ExpenseView from "../views/expenseView.js";

const router = express.Router();
const canUseExpenses = [authMiddleware, requirePermission("expenses")];
const expenseFields = allowFields(
  "description",
  "amount",
  "date",
  "status",
  "categoryId",
);

router.get("/expenses", canUseExpenses, ExpenseView.getAll);
router.get("/expenses/:id", canUseExpenses, ExpenseView.getById);
router.post("/expenses", canUseExpenses, expenseFields, ExpenseView.create);
router.put(
  "/expenses/:id",
  canUseExpenses,
  expenseFields,
  ExpenseView.updateAllFields,
);
router.patch("/expenses/:id", canUseExpenses, expenseFields, ExpenseView.update);
router.delete("/expenses/:id", canUseExpenses, ExpenseView.delete);

export default router;
