import express from "express";
import allowFields from "../middlewares/allowFields.js";
import AuthView from "../views/authView.js";

const router = express.Router();

router.post("/auth/login", allowFields("email", "password"), AuthView.login);
router.post("/auth/refresh", allowFields(), AuthView.refresh);
router.post("/auth/logout", allowFields(), AuthView.logout);

export default router;
