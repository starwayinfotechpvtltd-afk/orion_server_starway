import mongoose from "mongoose";
const { Schema, model } = mongoose;

const RoleTimingSchema = new Schema({
  role: { type: String, required: true, unique: true },
  requiredWorkHours: { type: Number, default: 480 }, // Default: 8 hours (in minutes)
  allottedBreakTime: { type: Number, default: 60 }   // Default: 1 hour (in minutes)
});

export default model("RoleTiming", RoleTimingSchema);