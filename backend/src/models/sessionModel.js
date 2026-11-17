import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Session extends Model {
  isValid() {
    return !this.revokedAt && this.expiresAt > new Date() && this.User?.isActive;
  }
}

Session.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.TEXT,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revokedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "Session",
  },
);

export default Session;
