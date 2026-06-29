// import bcryptjs from "bcryptjs";
// import mongoose from "mongoose";

// const { Schema, model } = mongoose;

// const UserSchema = new Schema({
//   username: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: {
//     type: String,
//     enum: ["caller", "developer", "admin", "manager"],
//     default: "caller",
//   },
//     avatar: { 
//     type: String, 
//     default: "https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8=" 
//   },
//   joiningDate: { type: Date, default: Date.now },
//   leaveBalance: { type: Number, default: 0 },
//   leaveRecords: [
//     {
//       startDate: { type: Date, required: false },
//       endDate: { type: Date, required: false },
//       type: { type: String, enum: ["full", "half"], default: "full" },
//       note: { type: String, required: false },
//       createdAt: { type: Date, default: Date.now },
//     },
//   ],
// });

// // hash password
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next;
//   try {
//     const salting = await bcryptjs.genSalt(10);
//     this.password = await bcryptjs.hash(this.password, salting);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // password compare
// UserSchema.methods.comparePassword = async function (password) {
//   return await bcryptjs.compare(password, this.password);
// };

// export default model("User", UserSchema);














import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["caller", "developer", "admin", "manager"],
    default: "caller",
  },
  avatar: { 
    type: String, 
    default: "https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8=" 
  },
  joiningDate: { type: Date, default: Date.now },
  leaveBalance: { type: Number, default: 0 },
  leaveRecords: [
    {
      startDate: { type: Date, required: false },
      endDate: { type: Date, required: false },
      type: { type: String, enum: ["full", "half"], default: "full" },
      note: { type: String, required: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  // --- NEW: User Exceptions for Attendance ---
  customWorkHours: { type: Number, default: null }, // In minutes (e.g. 480 for 8 hours)
  customBreakTime: { type: Number, default: null }, // In minutes
});

// hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;
  try {
    const salting = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salting);
    next();
  } catch (error) {
    next(error);
  }
});

// password compare
UserSchema.methods.comparePassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

export default model("User", UserSchema);