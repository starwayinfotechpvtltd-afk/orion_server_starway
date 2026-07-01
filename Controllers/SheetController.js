import Sheet from "../Models/SheetModel.js";

export const getSheets = async (req, res) => {
  try {
    const list = await Sheet.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sheets", error });
  }
};

export const createSheet = async (req, res) => {
  const { name, columns, rows, metadata } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Sheet name is required" });
  }
  try {
    const newSheet = new Sheet({
      name: name.trim(),
      columns: columns || ["Column A", "Column B", "Column C"],
      rows: rows || [],
      metadata: metadata || {},
      createdBy: req.user.id,
    });
    await newSheet.save();
    res.status(201).json(newSheet);
  } catch (error) {
    res.status(500).json({ message: "Error creating sheet", error });
  }
};

export const updateSheet = async (req, res) => {
  const { name, columns, rows, metadata } = req.body;
  try {
    const updated = await Sheet.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { name, columns, rows, metadata },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Sheet not found" });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating sheet", error });
  }
};

export const deleteSheet = async (req, res) => {
  try {
    const deleted = await Sheet.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!deleted) {
      return res.status(404).json({ message: "Sheet not found" });
    }
    res.json({ message: "Sheet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting sheet", error });
  }
};

// Project specific sheets controllers
import mongoose from "mongoose";

export const getProjectSheets = async (req, res) => {
  const { projectId } = req.params;
  try {
    const ProjectModel = mongoose.model("Project");
    const project = await ProjectModel.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isAdmin = req.user.role === "admin" || req.user.role === "hr";
    const isAuthorizedDev = project.assignedDeveloper?.some(d => d.id === req.user.id) && 
                            (project.excelAuthorizedDevelopers || []).includes(req.user.id);

    if (!isAdmin && !isAuthorizedDev) {
      return res.status(403).json({ message: "Not authorized to access spreadsheet features for this project" });
    }

    const list = await Sheet.find({ projectId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sheets", error });
  }
};

export const createProjectSheet = async (req, res) => {
  const { projectId } = req.params;
  const { name, columns, rows, metadata } = req.body;
  if (!name) return res.status(400).json({ message: "Sheet name is required" });
  try {
    const ProjectModel = mongoose.model("Project");
    const project = await ProjectModel.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isAdmin = req.user.role === "admin" || req.user.role === "hr";
    const isAuthorizedDev = project.assignedDeveloper?.some(d => d.id === req.user.id) && 
                            (project.excelAuthorizedDevelopers || []).includes(req.user.id);

    if (!isAdmin && !isAuthorizedDev) {
      return res.status(403).json({ message: "Not authorized to create sheets in this project" });
    }

    const newSheet = new Sheet({
      name: name.trim(),
      columns: columns || ["Column A", "Column B", "Column C"],
      rows: rows || [],
      metadata: metadata || {},
      projectId,
      createdBy: req.user.id,
    });
    await newSheet.save();
    res.status(201).json(newSheet);
  } catch (error) {
    res.status(500).json({ message: "Error creating sheet", error });
  }
};

export const updateProjectSheet = async (req, res) => {
  const { projectId, id } = req.params;
  const { name, columns, rows, metadata } = req.body;
  console.log("updateProjectSheet id:", id, "projectId:", projectId);
  console.log("updateProjectSheet body name:", name, "metadata keys:", metadata ? Object.keys(metadata) : "none");
  try {
    const ProjectModel = mongoose.model("Project");
    const project = await ProjectModel.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isAdmin = req.user.role === "admin" || req.user.role === "hr";
    const isAuthorizedDev = project.assignedDeveloper?.some(d => d.id === req.user.id) && 
                            (project.excelAuthorizedDevelopers || []).includes(req.user.id);

    if (!isAdmin && !isAuthorizedDev) {
      return res.status(403).json({ message: "Not authorized to update sheets in this project" });
    }

    const updated = await Sheet.findOneAndUpdate(
      { _id: id, projectId },
      { name, columns, rows, metadata },
      { new: true }
    );
    console.log("updateProjectSheet successfully updated sheet. metadata workbookData sheets:", updated?.metadata?.workbookData?.length);
    if (!updated) return res.status(404).json({ message: "Sheet not found" });
    res.json(updated);
  } catch (error) {
    console.error("updateProjectSheet error:", error);
    res.status(500).json({ message: "Error updating sheet", error });
  }
};

export const deleteProjectSheet = async (req, res) => {
  const { projectId, id } = req.params;
  try {
    const ProjectModel = mongoose.model("Project");
    const project = await ProjectModel.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isAdmin = req.user.role === "admin" || req.user.role === "hr";
    const isAuthorizedDev = project.assignedDeveloper?.some(d => d.id === req.user.id) && 
                            (project.excelAuthorizedDevelopers || []).includes(req.user.id);

    if (!isAdmin && !isAuthorizedDev) {
      return res.status(403).json({ message: "Not authorized to delete sheets in this project" });
    }

    const deleted = await Sheet.findOneAndDelete({ _id: id, projectId });
    if (!deleted) return res.status(404).json({ message: "Sheet not found" });
    res.json({ message: "Sheet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting sheet", error });
  }
};
