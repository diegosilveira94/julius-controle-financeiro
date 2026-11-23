import Expense from "./expenseModel.js";
import Category from "./categoryModel.js";
import User from "./userModel.js";
import Attachment from "./attachmentModel.js";

Category.hasMany(Expense, { foreignKey: "categoryId" });
Expense.belongsTo(Category, { foreignKey: "categoryId" });

User.hasMany(Expense, { foreignKey: "userId" });
Expense.belongsTo(User, { foreignKey: "userId" });

Expense.hasMany(Attachment, { foreignKey: "expenseId", onDelete: "CASCADE" });
Attachment.belongsTo(Expense, { foreignKey: "expenseId" });

User.hasMany(Attachment, { foreignKey: "userId" });
Attachment.belongsTo(User, { foreignKey: "userId" });
