import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Attachment extends Model {}

Attachment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Caminho relativo dentro de UPLOAD_DIR. Nunca é exposto ao cliente.
    storageKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Attachment",
    defaultScope: {
      attributes: { exclude: ["storageKey"] },
    },
  },
);

export default Attachment;
