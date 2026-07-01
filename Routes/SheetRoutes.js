import express from "express";
import { verifyToken, isAdminOrHr } from "../Middlewares/AuthMiddleware.js";
import {
  getSheets,
  createSheet,
  updateSheet,
  deleteSheet,
  getProjectSheets,
  createProjectSheet,
  updateProjectSheet,
  deleteProjectSheet,
} from "../Controllers/SheetController.js";

const router = express.Router();

// Global HR sheets (Restricted to Admin/HR)
router.get("/", verifyToken, isAdminOrHr, getSheets);
router.post("/", verifyToken, isAdminOrHr, createSheet);
router.put("/:id", verifyToken, isAdminOrHr, updateSheet);
router.delete("/:id", verifyToken, isAdminOrHr, deleteSheet);

// Project-specific sheets (Admin/HR or authorized assigned developer)
router.get("/project/:projectId", verifyToken, getProjectSheets);
router.post("/project/:projectId", verifyToken, createProjectSheet);
router.put("/project/:projectId/:id", verifyToken, updateProjectSheet);
router.delete("/project/:projectId/:id", verifyToken, deleteProjectSheet);

export default router;
