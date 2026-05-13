import mongoose from "mongoose";
import { Task } from "../Models/Tasksmodel.js";
import Project from "../Models/ProjectModel.js";
import UserModel from "../Models/UserModel.js";

// ── Inline Comment schema (stored inside Task documents as a sub-collection) ──
// We use a separate Mongoose model backed by a "taskcomments" collection
// so that comments don't bloat the Task document itself.

const CommentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    text: { type: String, required: true, trim: true },
    createdBy: {
      id: { type: String, required: true },
      username: { type: String, required: true },
    },
  },
  { timestamps: true }
);

// Only create the model once (hot-reload guard)
export const Comment =
  mongoose.models.TaskComment ||
  mongoose.model("TaskComment", CommentSchema);

// ── Helpers ───────────────────────────────────────────────────────────────────
const getUserFromToken = async (userId) => {
  const user = await UserModel.findById(userId).select("username").lean();
  if (!user) throw new Error("User not found");
  return user.username;
};

const isAuthorized = async (projectId, userId, username, userRole) => {
  if (userRole === "admin") return true;
  const project = await Project.findById(projectId)
    .select("createdBy assignedDeveloper")
    .lean();
  if (!project) return false;
  const isCreator = project.createdBy === username;
  const isAssigned = project.assignedDeveloper?.some(
    (d) => d.id?.toString() === userId?.toString()
  );
  return isCreator || isAssigned;
};

// ── GET /api/tasks/:projectId/:taskId/comments ────────────────────────────────
export const getComments = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const username = await getUserFromToken(userId);
    const ok = await isAuthorized(projectId, userId, username, userRole);
    if (!ok) return res.status(403).json({ message: "Not authorized" });

    const task = await Task.findOne({ _id: taskId, projectId }).lean();
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comments = await Comment.find({ taskId, projectId }).sort({
      createdAt: 1,
    });
    res.status(200).json(comments);
  } catch (error) {
    console.error("getComments error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── POST /api/tasks/:projectId/:taskId/comments ───────────────────────────────
export const createComment = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const username = await getUserFromToken(userId);
    const ok = await isAuthorized(projectId, userId, username, userRole);
    if (!ok) return res.status(403).json({ message: "Not authorized" });

    const task = await Task.findOne({ _id: taskId, projectId }).lean();
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { text } = req.body;
    if (!text?.trim())
      return res.status(400).json({ message: "Comment text is required" });

    const comment = await Comment.create({
      taskId,
      projectId,
      text: text.trim(),
      createdBy: { id: userId, username },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("createComment error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── DELETE /api/tasks/:projectId/:taskId/comments/:commentId ─────────────────
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isOwner = comment.createdBy.id?.toString() === userId?.toString();
    if (!isOwner && userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Only the comment author can delete it" });
    }

    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error("deleteComment error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};