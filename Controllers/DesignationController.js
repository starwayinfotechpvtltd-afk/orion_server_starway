import Designation from "../Models/DesignationModel.js";

export const getDesignations = async (req, res) => {
  try {
    const list = await Designation.find().sort({ title: 1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching designations", error });
  }
};

export const createDesignation = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }
  try {
    const existing = await Designation.findOne({ title: title.trim() });
    if (existing) {
      return res.status(400).json({ message: "Designation already exists" });
    }
    const newDesg = new Designation({
      title: title.trim(),
      createdBy: req.user.id,
    });
    await newDesg.save();
    res.status(201).json(newDesg);
  } catch (error) {
    res.status(500).json({ message: "Error creating designation", error });
  }
};

export const deleteDesignation = async (req, res) => {
  try {
    const deleted = await Designation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Designation not found" });
    }
    res.json({ message: "Designation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting designation", error });
  }
};
