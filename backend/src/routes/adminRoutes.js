import express from "express";
import { getAdminDashboard } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getAdminDashboard);

export default router;
