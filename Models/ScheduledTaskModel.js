import mongoose from "mongoose";

const ScheduledTaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    scheduledDates: { type: [Date], required: true },

    deadlineOffset: { type: Number, default: 0 },

    assignedTo: {
      id: { type: String, required: true },
      username: { type: String, required: true },
    },

    createdBy: {
      id: { type: String, required: true },
      username: { type: String, required: true },
    },

    status: {
      type: String,
      enum: ["scheduled", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ScheduledTask", ScheduledTaskSchema);
