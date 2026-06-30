import express from "express";
import { verifyToken } from "../Middlewares/AuthMiddleware.js";
import {
  getReminders,
  createReminder,
  markReminderRead,
  deleteReminder,
} from "../Controllers/ReminderController.js";

const router = express.Router();

router.get("/", verifyToken, getReminders);
router.post("/", verifyToken, createReminder);
router.put("/:id/read", verifyToken, markReminderRead);
router.delete("/:id", verifyToken, deleteReminder);

export default router;
