import AttachmentController from "../controllers/attachmentController.js";

class AttachmentView {
  static async listByExpense(req, res) {
    try {
      const attachments = await AttachmentController.listByExpense({
        expenseId: req.params.id,
        userId: req.user.id,
      });

      if (!attachments) {
        return res.status(404).send({ error: "No expense found." });
      }

      res.status(200).send(attachments);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const attachments = await AttachmentController.create({
        expenseId: req.params.id,
        userId: req.user.id,
        files: req.files,
      });

      if (!attachments) {
        return res.status(404).send({ error: "No expense found." });
      }

      res.status(201).send(attachments);
    } catch (error) {
      res.status(error.statusCode || 500).send({ error: error.message });
    }
  }

  static async getFile(req, res) {
    try {
      const result = await AttachmentController.getFile({
        id: req.params.id,
        userId: req.user.id,
      });

      if (!result) {
        return res.status(404).send({ error: "No attachment found." });
      }

      const { attachment, filePath } = result;
      const disposition = req.query.download ? "attachment" : "inline";

      res.type(attachment.mimeType);
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader(
        "Content-Disposition",
        `${disposition}; filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
      );
      res.sendFile(filePath, (error) => {
        if (error && !res.headersSent) {
          res.status(404).send({ error: "File not found." });
        }
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const attachment = await AttachmentController.delete({
        id: req.params.id,
        userId: req.user.id,
      });

      if (!attachment) {
        return res.status(404).send({ error: "No attachment found." });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
}

export default AttachmentView;
