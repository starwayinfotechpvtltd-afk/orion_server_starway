import Project from "../Models/ProjectModel.js";
import { Task, TaskCompletion } from "../Models/Tasksmodel.js";
import UserModel from "../Models/UserModel.js";

export const getDeveloperDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // 1. Determine which projects this user is allowed to see
        let projectQuery = {};
        if (userRole !== "admin") {
            // Get username to check if they are the creator
            const user = await UserModel.findById(userId).select("username").lean();
            const username = user?.username || "";

            projectQuery = {
                $or: [
                    { createdBy: username },
                    { "assignedDeveloper.id": userId }
                ]
            };
        }

        // 2. Fetch Projects
        const projects = await Project.find(projectQuery).lean();
        const projectIds = projects.map(p => p._id);

        // 3. Fetch Tasks & Completions concurrently for ONLY those projects
        const [tasks, completions] = await Promise.all([
            Task.find({ projectId: { $in: projectIds } }).lean(),
            TaskCompletion.find({ projectId: { $in: projectIds } }).lean()
        ]);

        // 4. Map the project name to the tasks (since your frontend expects this)
        const projectMap = {};
        projects.forEach(p => {
            projectMap[p._id.toString()] = p.projectName || "Unknown";
        });

        const formattedTasks = tasks.map(t => ({
            ...t,
            projectName: projectMap[t.projectId?.toString()] || "Unknown"
        }));

        // 5. Send one single JSON payload back
        res.status(200).json({
            projects,
            tasks: formattedTasks,
            completions
        });

    } catch (error) {
        console.error("Dashboard Data error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};