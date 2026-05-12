import express from "express";
import TeamModel from "../Models/TeamModel.js";
import { verifyToken, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Create a Team
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { teamName, managerId, memberIds } = req.body;
  try {
    const newTeam = new TeamModel({
      teamName,
      manager: managerId,
      members: memberIds,
    });
    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ message: "Error creating team", error });
  }
});

// Get all teams (populated with names)
router.get("/", verifyToken, async (req, res) => {
  try {
    const teams = await TeamModel.find()
      .populate("manager", "username email")
      .populate("members", "username email");
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teams" });
  }
});

// Update Team (Edit Name, Manager, or Members)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  const { teamName, managerId, memberIds } = req.body;
  try {
    const updatedTeam = await TeamModel.findByIdAndUpdate(
      req.params.id,
      { teamName, manager: managerId, members: memberIds },
      { new: true }
    );
    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

// Delete Team
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await TeamModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;