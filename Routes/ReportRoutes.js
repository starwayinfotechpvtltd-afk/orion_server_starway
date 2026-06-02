import express from "express";
import { getDeveloperDashboardData } from "../Controllers/ReportsController.js";
import { verifyToken } from "../Middlewares/AuthMiddleware.js"; 

const router = express.Router();

router.get("/dashboard", verifyToken, getDeveloperDashboardData);

export default router;