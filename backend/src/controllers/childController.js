import User from "../models/userModel.js";
import UserController from "./userController.js";
import DashboardController from "./dashboardController.js";
import ExpenseController from "./expenseController.js";
import { PERMISSIONS } from "../config/permissions.js";

function validatePassword(password) {
  if (typeof password !== "string" || password.length < 6) {
    throw new Error("The password must contain at least 6 characters");
  }
}

function validatePermissions(permissions) {
  if (
    !Array.isArray(permissions) ||
    !permissions.every((permission) => PERMISSIONS.includes(permission))
  ) {
    throw new Error(`Permissions must only contain: ${PERMISSIONS.join(", ")}`);
  }

  return [...new Set(permissions)];
}

class ChildController {
  static findChild(parentId, id) {
    return User.findOne({ where: { id, parentId } });
  }

  static async getAll(parentId) {
    const children = await User.findAll({
      where: { parentId },
      order: [["name", "ASC"]],
    });

    return children.map((child) => UserController.mapUser(child));
  }

  static async create(parentId, { name, email, password, permissions = [] }) {
    validatePassword(password);

    const child = await User.build({
      name,
      email,
      password,
      role: "CHILD",
      parentId,
      permissions: validatePermissions(permissions),
    }).save();

    return UserController.mapUser(child);
  }

  static async update(parentId, id, { name, password, permissions, isActive }) {
    const child = await ChildController.findChild(parentId, id);

    if (!child) return null;

    if (name !== undefined) child.name = name;

    if (password !== undefined) {
      validatePassword(password);
      child.password = password;
    }

    if (permissions !== undefined) {
      child.permissions = validatePermissions(permissions);
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        throw new Error("isActive must be a boolean");
      }
      child.isActive = isActive;
    }

    await child.save();
    return UserController.mapUser(child);
  }

  static async delete(parentId, id) {
    return await User.destroy({ where: { id, parentId } });
  }

  static async getSummary(parentId, id) {
    const child = await ChildController.findChild(parentId, id);

    if (!child) return null;

    const userId = child.id;
    const [total, count, byCategory, expenses] = await Promise.all([
      DashboardController.total({ userId }),
      DashboardController.quantity({ userId }),
      DashboardController.expenseByCategory({ userId }),
      ExpenseController.getAll({ userId }),
    ]);

    return {
      child: UserController.mapUser(child),
      total,
      count,
      byCategory,
      expenses,
    };
  }
}

export default ChildController;
