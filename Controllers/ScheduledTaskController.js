import ScheduledTask from "../Models/ScheduledTaskModel.js";
import { Task } from "../Models/Tasksmodel.js";
import Notification from "../Models/NotificationModel.js";
import Project from "../Models/ProjectModel.js";
import UserModel from "../Models/UserModel.js";

// ── Fetch the current user's username from DB ────────────────────────────────
const getUserFromToken = async (userId) => {
  const user = await UserModel.findById(userId).select("username").lean();
  if (!user) throw new Error("User not found");
  return user.username;
};

// ── POST /api/scheduled-tasks ─────────────────────────────────────────────────
export const createScheduledTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, priority, scheduledDates, deadlineOffset, projectId, assignedTo } =
      req.body;

    // Validations
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!scheduledDates || !Array.isArray(scheduledDates) || scheduledDates.length === 0) {
      return res.status(400).json({ message: "At least one scheduled date is required" });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    for (const d of scheduledDates) {
      const dateVal = new Date(d);
      dateVal.setHours(0, 0, 0, 0);
      if (dateVal < todayStart) {
        return res.status(400).json({ message: "All scheduled dates must be today or in the future" });
      }
    }

    const username = await getUserFromToken(userId);

    const scheduledTask = new ScheduledTask({
      userId,
      projectId,
      title,
      description: description || "",
      priority: priority || "Medium",
      scheduledDates,
      deadlineOffset: deadlineOffset || 0,
      assignedTo: assignedTo || { id: userId, username },
      createdBy: { id: userId, username },
    });

    const saved = await scheduledTask.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("createScheduledTask error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── GET /api/scheduled-tasks ──────────────────────────────────────────────────
export const getScheduledTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = { userId, status: "scheduled" };

    if (req.query.projectId) {
      query.projectId = req.query.projectId;
    }

    const tasks = await ScheduledTask.find(query)
      .sort({ "scheduledDates.0": 1 })
      .lean();

    // Populate project name
    const projectIds = [...new Set(tasks.map((t) => t.projectId?.toString()).filter(Boolean))];
    if (projectIds.length > 0) {
      const projects = await Project.find({ _id: { $in: projectIds } })
        .select("projectName")
        .lean();
      const projectMap = {};
      projects.forEach((p) => (projectMap[p._id.toString()] = p.projectName));

      tasks.forEach((t) => {
        t.projectName = projectMap[t.projectId?.toString()] || null;
      });
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error("getScheduledTasks error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── GET /api/scheduled-tasks/upcoming ─────────────────────────────────────────
export const getUpcomingScheduledTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const tasks = await ScheduledTask.find({
      userId,
      status: "scheduled",
      scheduledDates: { $gte: todayStart },
    })
      .sort({ "scheduledDates.0": 1 })
      .lean();

    // Populate project name
    const projectIds = [...new Set(tasks.map((t) => t.projectId?.toString()).filter(Boolean))];
    if (projectIds.length > 0) {
      const projects = await Project.find({ _id: { $in: projectIds } })
        .select("projectName")
        .lean();
      const projectMap = {};
      projects.forEach((p) => (projectMap[p._id.toString()] = p.projectName));

      tasks.forEach((t) => {
        t.projectName = projectMap[t.projectId?.toString()] || null;
      });
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error("getUpcomingScheduledTasks error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── PUT /api/scheduled-tasks/:id ──────────────────────────────────────────────
export const updateScheduledTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const scheduledTask = await ScheduledTask.findOne({ _id: id, userId });
    if (!scheduledTask) {
      return res.status(404).json({ message: "Scheduled task not found" });
    }

    const offsetHeader = req.headers["x-timezone-offset"];
    const offset = offsetHeader !== undefined ? parseInt(offsetHeader) : 0;

    const clientNow = new Date(new Date().getTime() - offset * 60 * 1000);
    const clientTodayStart = new Date(clientNow);
    clientTodayStart.setHours(0, 0, 0, 0);

    const clientTomorrow = new Date(clientNow);
    clientTomorrow.setDate(clientTomorrow.getDate() + 1);
    clientTomorrow.setHours(0, 0, 0, 0);

    const hasEditableDate = scheduledTask.scheduledDates.some((d) => {
      const clientDateVal = new Date(new Date(d).getTime() - offset * 60 * 1000);
      clientDateVal.setHours(0, 0, 0, 0);
      return clientDateVal >= clientTomorrow;
    });

    if (!hasEditableDate) {
      return res
        .status(403)
        .json({ message: "Cannot edit — all scheduled dates are too close or have passed" });
    }

    const { title, description, deadlineOffset, scheduledDates, priority } = req.body;

    if (title !== undefined) scheduledTask.title = title;
    if (description !== undefined) scheduledTask.description = description;
    if (deadlineOffset !== undefined) scheduledTask.deadlineOffset = deadlineOffset;
    if (priority !== undefined) scheduledTask.priority = priority;

    // Only allow future/today dates when updating scheduledDates
    if (scheduledDates !== undefined) {
      const futureDates = scheduledDates.filter((d) => {
        const clientDateVal = new Date(new Date(d).getTime() - offset * 60 * 1000);
        clientDateVal.setHours(0, 0, 0, 0);
        return clientDateVal >= clientTodayStart;
      });
      if (futureDates.length === 0) {
        return res.status(400).json({ message: "At least one scheduled date must be today or in the future" });
      }
      scheduledTask.scheduledDates = futureDates;
      scheduledTask.markModified("scheduledDates");
    }

    const updated = await scheduledTask.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error("updateScheduledTask error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── DELETE /api/scheduled-tasks/:id ───────────────────────────────────────────
export const deleteScheduledTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const scheduledTask = await ScheduledTask.findOne({ _id: id, userId });
    if (!scheduledTask) {
      return res.status(404).json({ message: "Scheduled task not found" });
    }

    const offsetHeader = req.headers["x-timezone-offset"];
    const offset = offsetHeader !== undefined ? parseInt(offsetHeader) : 0;

    const clientNow = new Date(new Date().getTime() - offset * 60 * 1000);
    const clientTomorrow = new Date(clientNow);
    clientTomorrow.setDate(clientTomorrow.getDate() + 1);
    clientTomorrow.setHours(0, 0, 0, 0);

    const hasFutureDate = scheduledTask.scheduledDates.some((d) => {
      const clientDateVal = new Date(new Date(d).getTime() - offset * 60 * 1000);
      clientDateVal.setHours(0, 0, 0, 0);
      return clientDateVal >= clientTomorrow;
    });

    if (!hasFutureDate) {
      return res
        .status(403)
        .json({ message: "Cannot delete — all scheduled dates are too close or have passed" });
    }

    await scheduledTask.deleteOne();
    res.status(200).json({ message: "Scheduled task deleted" });
  } catch (error) {
    console.error("deleteScheduledTask error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── GET /api/scheduled-tasks/process-live ─────────────────────────────────────
export const processGoLiveTasks = async (req, res) => {
  try {
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Find all scheduled tasks with at least one scheduledDate <= today
    const scheduledTasks = await ScheduledTask.find({
      status: "scheduled",
      scheduledDates: { $lte: todayEnd },
    });

    let processedCount = 0;

    for (const st of scheduledTasks) {
      const datesToProcess = [];
      const remainingDates = [];

      for (const d of st.scheduledDates) {
        if (new Date(d) <= todayEnd) {
          datesToProcess.push(d);
        } else {
          remainingDates.push(d);
        }
      }

      // Look up project name for notifications
      let projectName = null;
      if (st.projectId) {
        const project = await Project.findById(st.projectId).select("projectName").lean();
        if (project) projectName = project.projectName;
      }

      for (const scheduledDate of datesToProcess) {
        // Calculate deadline
        const deadline = new Date(scheduledDate);
        deadline.setDate(deadline.getDate() + (st.deadlineOffset || 0));

        // Create a real Task
        const newTask = await Task.create({
          projectId: st.projectId,
          title: st.title,
          description: st.description,
          priority: st.priority,
          deadline,
          assignedTo: st.assignedTo,
          createdBy: st.createdBy,
          status: "Todo",
        });

        // Create a Notification for the assignee
        await Notification.create({
          userId: st.assignedTo.id,
          type: "scheduled_task_live",
          title: "Scheduled Task Live",
          message: `"${st.title}" is now live`,
          relatedId: newTask._id,
          projectName,
        });

        processedCount++;
      }

      // Update the scheduled task
      if (remainingDates.length === 0) {
        st.status = "cancelled";
        st.scheduledDates = [];
      } else {
        st.scheduledDates = remainingDates;
      }

      await st.save();
    }

    res.status(200).json({ processed: processedCount });
  } catch (error) {
    console.error("processGoLiveTasks error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── GET /api/scheduled-tasks/notifications ────────────────────────────────────
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.status(200).json(notifications);
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── PUT /api/scheduled-tasks/notifications/read ───────────────────────────────
export const markNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("markNotificationsRead error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
