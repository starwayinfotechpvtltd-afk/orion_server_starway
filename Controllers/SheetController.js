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
  const { name, columns, rows } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Sheet name is required" });
  }
  try {
    const newSheet = new Sheet({
      name: name.trim(),
      columns: columns || ["Column A", "Column B", "Column C"],
      rows: rows || [],
      createdBy: req.user.id,
    });
    await newSheet.save();
    res.status(201).json(newSheet);
  } catch (error) {
    res.status(500).json({ message: "Error creating sheet", error });
  }
};

export const updateSheet = async (req, res) => {
  const { name, columns, rows } = req.body;
  try {
    const updated = await Sheet.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { name, columns, rows },
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
