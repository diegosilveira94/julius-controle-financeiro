import { DataTypes, Model, Sequelize } from "sequelize";
import { sequelize } from "../config/database.js";

class Category extends Model {
  static async getAll() {
    return await Category.findAll();
  }

  static async getById(id) {
    return await Category.findByPk(id, [{ include: Expense }]);
  }

  static async createCategory({ name, description }) {
    if (!name) {
      throw new Error("The name field is required.");
    }

    return await Category.create({
      name,
      description,
    });
  }

  static async updateCategory({ id, name, description }) {
    if (!name) {
      throw new Error("The name field is required.");
    }

    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error("Category not found.");
    }

    return await category.update({
      name,
      description,
    });
  }

  static async deleteCategory(id) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error("Category not found.");
    }
    return await category.destroy();
  }
}

Category.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Category",
  },
);

export default Category;
