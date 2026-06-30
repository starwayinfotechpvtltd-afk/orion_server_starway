import express from "express";
import { verifyToken, isAdminOrHr } from "../Middlewares/AuthMiddleware.js";
import {
  getSheets,
  createSheet,
  updateSheet,
  deleteSheet,
} from "../Controllers/SheetController.js";

const router = express.Router();

router.get("/", verifyToken, isAdminOrHr, getSheets);
router.post("/", verifyToken, isAdminOrHr, createSheet);
router.put("/:id", verifyToken, isAdminOrHr, updateSheet);
router.delete("/:id", verifyToken, isAdminOrHr, deleteSheet);

export default router;
