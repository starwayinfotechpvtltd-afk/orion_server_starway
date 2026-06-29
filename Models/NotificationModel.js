import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["scheduled_task_live"],
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    relatedId: { type: mongoose.Schema.Types.ObjectId },

    projectName: { type: String },

    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
