import express from "express";
import { verifyToken } from "../Middlewares/AuthMiddleware.js";
import {
  createScheduledTask,
  getScheduledTasks,
  getUpcomingScheduledTasks,
  updateScheduledTask,
  deleteScheduledTask,
  processGoLiveTasks,
  getNotifications,
  markNotificationsRead,
} from "../Controllers/ScheduledTaskController.js";

const router = express.Router();
router.use(verifyToken);

router.post("/", createScheduledTask);
router.get("/", getScheduledTasks);
router.get("/upcoming", getUpcomingScheduledTasks);
router.get("/process-live", processGoLiveTasks);
router.get("/notifications", getNotifications);
router.put("/notifications/read", markNotificationsRead);
router.put("/:id", updateScheduledTask);
router.delete("/:id", deleteScheduledTask);

export default router;
