import express from "express";
import { verifyToken, isAdminOrHr } from "../Middlewares/AuthMiddleware.js";
import {
  getDesignations,
  createDesignation,
  deleteDesignation,
} from "../Controllers/DesignationController.js";

const router = express.Router();

router.get("/", verifyToken, getDesignations);
router.post("/", verifyToken, isAdminOrHr, createDesignation);
router.delete("/:id", verifyToken, isAdminOrHr, deleteDesignation);

export default router;
