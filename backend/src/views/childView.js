import ChildController from "../controllers/childController.js";

class ChildView {
  static async getAll(req, res) {
    try {
      const children = await ChildController.getAll(req.user.id);
      res.json(children);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { name, email, password, permissions } = req.body || {};

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ error: "Name, email and password are required" });
      }

      const child = await ChildController.create(req.user.id, {
        name,
        email,
        password,
        permissions,
      });
      res.status(201).json(child);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { name, password, permissions, isActive } = req.body || {};
      const child = await ChildController.update(req.user.id, req.params.id, {
        name,
        password,
        permissions,
        isActive,
      });

      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }

      res.json(child);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const deleted = await ChildController.delete(req.user.id, req.params.id);

      if (!deleted) {
        return res.status(404).json({ error: "Child not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSummary(req, res) {
    try {
      const summary = await ChildController.getSummary(
        req.user.id,
        req.params.id,
      );

      if (!summary) {
        return res.status(404).json({ error: "Child not found" });
      }

      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default ChildView;
