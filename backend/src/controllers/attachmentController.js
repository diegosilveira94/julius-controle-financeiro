import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import Attachment from "../models/attachmentModel.js";
import Expense from "../models/expenseModel.js";
import uploadConfig from "../config/upload.js";

export class AttachmentError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function absolutePath(storageKey) {
  return path.join(uploadConfig.dir, storageKey);
}

async function removeFile(storageKey) {
  try {
    await fs.unlink(absolutePath(storageKey));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

class AttachmentController {
  static async listByExpense({ expenseId, userId }) {
    const expense = await Expense.findOne({ where: { id: expenseId, userId } });
    if (!expense) return null;

    return await Attachment.findAll({
      where: { expenseId, userId },
      order: [["createdAt", "ASC"]],
    });
  }

  static async create({ expenseId, userId, files }) {
    const expense = await Expense.findOne({ where: { id: expenseId, userId } });
    if (!expense) return null;

    if (!files?.length) {
      throw new AttachmentError("No files sent.");
    }

    const existing = await Attachment.count({ where: { expenseId } });
    if (existing + files.length > uploadConfig.maxFilesPerExpense) {
      throw new AttachmentError(
        `An expense can have at most ${uploadConfig.maxFilesPerExpense} attachments.`,
      );
    }

    // Valida todos os arquivos antes de gravar qualquer um.
    const prepared = [];
    for (const file of files) {
      const type = await fileTypeFromBuffer(file.buffer);
      if (!type || !uploadConfig.allowedMimeTypes.includes(type.mime)) {
        throw new AttachmentError(
          `"${file.originalname}" is not a supported file type.`,
        );
      }
      prepared.push({
        file,
        mimeType: type.mime,
        storageKey: `${userId}/${randomUUID()}.${type.ext}`,
      });
    }

    await fs.mkdir(path.join(uploadConfig.dir, userId), { recursive: true });

    const written = [];
    try {
      for (const item of prepared) {
        await fs.writeFile(absolutePath(item.storageKey), item.file.buffer);
        written.push(item.storageKey);
      }

      const created = await Attachment.bulkCreate(
        prepared.map((item) => ({
          expenseId,
          userId,
          originalName: item.file.originalname,
          mimeType: item.mimeType,
          size: item.file.size,
          storageKey: item.storageKey,
        })),
      );

      return created.map((attachment) => {
        const { storageKey, ...rest } = attachment.get({ plain: true });
        return rest;
      });
    } catch (error) {
      await Promise.all(written.map(removeFile));
      throw error;
    }
  }

  // Retorna o registro com o caminho absoluto do arquivo, só para o dono.
  static async getFile({ id, userId }) {
    const attachment = await Attachment.unscoped().findOne({
      where: { id, userId },
    });
    if (!attachment) return null;

    return { attachment, filePath: absolutePath(attachment.storageKey) };
  }

  static async delete({ id, userId }) {
    const attachment = await Attachment.unscoped().findOne({
      where: { id, userId },
    });
    if (!attachment) return null;

    await attachment.destroy();
    await removeFile(attachment.storageKey);
    return attachment;
  }

  // Usado ao excluir uma despesa: o banco remove os registros em cascata,
  // mas os arquivos no disco precisam ser apagados aqui.
  static async storageKeysForExpense({ expenseId, userId }) {
    const attachments = await Attachment.unscoped().findAll({
      where: { expenseId, userId },
      attributes: ["storageKey"],
    });
    return attachments.map((a) => a.storageKey);
  }

  static async removeFiles(storageKeys) {
    await Promise.all(storageKeys.map(removeFile));
  }
}

export default AttachmentController;
