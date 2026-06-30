import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ApplicationSchema = new Schema(
  {
    candidateName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    position: { type: String, required: true },
    resumeUrl: { type: String },
    status: {
      type: String,
      enum: ["Applied", "Screening", "Interview", "Offered", "Hired", "Rejected", "Future"],
      default: "Applied"
    },
    notes: { type: String },
    interviewDate: { type: Date }
  },
  { timestamps: true }
);

export default model("Application", ApplicationSchema);
