import Reminder from "../Models/ReminderModel.js";

export const getReminders = async (req, res) => {
  try {
    const list = await Reminder.find({ userId: req.user.id }).sort({ remindAt: 1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reminders", error });
  }
};

export const createReminder = async (req, res) => {
  const { title, remindAt } = req.body;
  if (!title || !remindAt) {
    return res.status(400).json({ message: "Title and remindAt date are required." });
  }
  try {
    const newReminder = new Reminder({
      title,
      remindAt: new Date(remindAt),
      userId: req.user.id,
    });
    await newReminder.save();
    res.status(201).json(newReminder);
  } catch (error) {
    res.status(500).json({ message: "Error creating reminder", error });
  }
};

export const markReminderRead = async (req, res) => {
  try {
    const updated = await Reminder.findByIdAndUpdate(
      req.params.id,
      { isSent: true },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating reminder", error });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const deleted = await Reminder.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting reminder", error });
  }
};
