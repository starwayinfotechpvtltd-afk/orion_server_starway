import mongoose from "mongoose";

const { Schema, model } = mongoose;

const TeamSchema = new Schema({
  teamName: { type: String, required: true, unique: true },
  manager: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true // Must be an 'admin' or 'manager'
  },
  members: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" // Specifically 'caller' roles
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

export default model("Team", TeamSchema);