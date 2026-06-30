import Notice from "../Models/NoticeModel.js";
import User from "../Models/UserModel.js";
import Notification from "../Models/NotificationModel.js";

// Create Notice (HR only)
export const createNotice = async (req, res) => {
  const { title, content, targetType, targetValue } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  try {
    const notice = new Notice({
      title,
      content,
      targetType,
      targetValue,
      createdBy: req.user.id
    });
    await notice.save();

    // Create notifications for targeted users
    let targetUsers = [];
    if (targetType === "all") {
      targetUsers = await User.find({}, "_id").lean();
    } else if (targetType === "role") {
      targetUsers = await User.find({ role: targetValue }, "_id").lean();
    } else if (targetType === "user") {
      targetUsers = [{ _id: targetValue }];
    }

    const notifications = targetUsers.map(user => ({
      userId: user._id,
      type: "notice",
      title: `Notice: ${title}`,
      message: content,
      relatedId: notice._id
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ message: "Notice published successfully.", notice });
  } catch (error) {
    console.error("createNotice error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get targeted notices for current user
export const getMyNotices = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const notices = await Notice.find({
      $or: [
        { targetType: "all" },
        { targetType: "role", targetValue: userRole },
        { targetType: "user", targetValue: userId }
      ]
    }).sort({ createdAt: -1 }).lean();

    res.status(200).json(notices);
  } catch (error) {
    console.error("getMyNotices error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all notices (HR & admin only)
export const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find({})
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(notices);
  } catch (error) {
    console.error("getAllNotices error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete notice
export const deleteNotice = async (req, res) => {
  try {
    const noticeId = req.params.id;
    const notice = await Notice.findByIdAndDelete(noticeId);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found." });
    }

    // Delete related notifications
    await Notification.deleteMany({ relatedId: noticeId });

    res.status(200).json({ message: "Notice deleted successfully." });
  } catch (error) {
    console.error("deleteNotice error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
