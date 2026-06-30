import express from "express";
import { verifyToken, isAdminOrHr } from "../Middlewares/AuthMiddleware.js";
import {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication
} from "../Controllers/ApplicationController.js";

const router = express.Router();

router.post("/", verifyToken, isAdminOrHr, createApplication);
router.get("/", verifyToken, isAdminOrHr, getApplications);
router.put("/:id", verifyToken, isAdminOrHr, updateApplication);
router.delete("/:id", verifyToken, isAdminOrHr, deleteApplication);

export default router;
