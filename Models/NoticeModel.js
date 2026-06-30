import mongoose from "mongoose";

const { Schema, model } = mongoose;

const NoticeSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    targetType: { 
      type: String, 
      enum: ["all", "role", "user"], 
      default: "all" 
    },
    targetValue: { type: String }, // stores role name or user ID
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default model("Notice", NoticeSchema);
