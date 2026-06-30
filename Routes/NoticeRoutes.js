import express from "express";
import { verifyToken, isAdminOrHr } from "../Middlewares/AuthMiddleware.js";
import {
  createNotice,
  getMyNotices,
  getAllNotices,
  deleteNotice
} from "../Controllers/NoticeController.js";

const router = express.Router();

router.post("/", verifyToken, isAdminOrHr, createNotice);
router.get("/my", verifyToken, getMyNotices);
router.get("/all", verifyToken, isAdminOrHr, getAllNotices);
router.delete("/:id", verifyToken, isAdminOrHr, deleteNotice);

export default router;
