import mongoose from "mongoose";

const { Schema, model } = mongoose;

const LeadSchema = new Schema({
  leadName: { type: String, required: true },
  email: { type: String, required: false },
  website: { type: String, required: false },
  phoneNumber: { type: String, required: true },
  designation: { type: String, required: false },
  country: { type: String, required: true },
  packages: { type: [String], required: true },
  leadType: { type: String, required: true },
  note: { type: String, required: true },
  pitchedAmount: { type: Number, required: false },
  currencySymbol: { type: String, required: false },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  leadOwner: { type: String, required: true },
  status: { type: String, enum: ["ongoing", "closed", "dropped"], default: "ongoing" },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
  assignedAt: { type: Date },
  comments: [
    {
      text: { type: String, required: true },
      postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      postedAt: { type: Date, default: Date.now }
    }
  ],
  followUpDate: { type: Date, default: null },
});

export default model("Lead", LeadSchema);
