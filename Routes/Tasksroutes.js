// import express from "express";
// import {
//   getProjectTasks,
//   createTask,
//   updateTask,
//   markTaskComplete,
//   deleteTask,
//   getProjectCompletions,
// } from "../Controllers/TaskController.js";
// import { verifyToken } from "../Middlewares/AuthMiddleware.js"; // adjust path

// const router = express.Router();

// // All task routes require authentication
// router.use(verifyToken);


// router.post("/:projectId", verifyToken, createTask);
// router.put("/:projectId/:taskId", verifyToken, updateTask);
// router.post("/:projectId/:taskId/complete", verifyToken, markTaskComplete);
// router.delete("/:projectId/:taskId", verifyToken, deleteTask);
// router.get("/:projectId/completions", verifyToken, getProjectCompletions);
// router.get("/:projectId", verifyToken, getProjectTasks);
// export default router;

// // ─────────────────────────────────────────────────────────────────────────────
// // In your main app.js / server.js, register this router:
// //
// //   import taskRoutes from "./Routes/taskRoutes.js";
// //   app.use("/api/tasks", taskRoutes);
// // ─────────────────────────────────────────────────────────────────────────────






import express from "express";
import {
  getProjectTasks,
  createTask,
  updateTask,
  markTaskComplete,
  deleteTask,
  getProjectCompletions,
} from "../Controllers/TaskController.js";
import {
  getComments,
  createComment,
  deleteComment,
} from "../Controllers/Commentcontroller.js";
import { verifyToken } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// ── Task CRUD ─────────────────────────────────────────────────────────────────
router.get("/:projectId/completions", getProjectCompletions); // must come BEFORE /:projectId/:taskId
router.get("/:projectId", getProjectTasks);
router.post("/:projectId", createTask);
router.put("/:projectId/:taskId", updateTask);
router.delete("/:projectId/:taskId", deleteTask);
router.post("/:projectId/:taskId/complete", markTaskComplete);

// ── Comment routes ────────────────────────────────────────────────────────────
router.get("/:projectId/:taskId/comments", getComments);
router.post("/:projectId/:taskId/comments", createComment);
router.delete("/:projectId/:taskId/comments/:commentId", deleteComment);

export default router;

// ─────────────────────────────────────────────────────────────────────────────
// Register in app.js / server.js:
//   import taskRoutes from "./Routes/taskRoutes.js";
//   app.use("/api/tasks", taskRoutes);
// ─────────────────────────────────────────────────────────────────────────────