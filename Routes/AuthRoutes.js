// import express from "express";
// import dotenv from "dotenv";
// import jwt from "jsonwebtoken";

// // FILES IMPORTS
// import UserModel from "../Models/UserModel.js";
// import { verifyToken, isAdmin } from "../Middlewares/AuthMiddleware.js";

// dotenv.config();

// const router = express.Router();

// // login
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await UserModel.findOne({ email });
//     if (!user) res.status(404).json({ message: "User Not Found" });

//     const isMatch = await user.comparePassword(password);

//     if (!isMatch) res.status(400).json({ message: "Invalid Credendials" });

//     const payload = {
//       user: {
//         id: user._id,
//         role: user.role,
//       },
//     };

//     //User ko token diya hai yaha
//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET_KEY,
//       { expiresIn: "2h" },
//       (err, token) => {
//         if (err) throw err;
//         res.json({
//           token,
//           role: user.role,
//           userId: user._id,        
//           username: user.username, 
//         });
//       }
//     );
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // Register
// router.post("/register", async (req, res) => {
//   const { username, email, password, role } = req.body;

//   try {
//     let user = await UserModel.findOne({ email });
//     if (user) return res.status(400).json({ message: "User Already Exists" });

//     user = new UserModel({ username, email, password, role });
//     await user.save();
//     res.json({ message: "User Registered Successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // Pakdo Sare Users Ko
// router.get("/users", verifyToken, isAdmin, async (req, res) => {
//   try {
//     const users = await UserModel.find(
//       {},
//       "username email role joiningDate leaveBalance leaveRecords"
//     );
//     res.json(users);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // User ko kick kar do
// router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
//   try {
//     const user = await UserModel.findByIdAndDelete(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // user update
// router.put("/users/:id", verifyToken, isAdmin, async (req, res) => {
//   const { username, role, joiningDate } = req.body;

//   try {
//     const user = await UserModel.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.username = username || user.username;
//     user.role = role || user.role;
//     user.joiningDate = joiningDate || user.joiningDate;

//     await user.save();
//     res.json({ message: "User updated successfully", user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });
// // get only users with managera and admin role
// router.get("/admins-managers", verifyToken, async (req, res) => {
//   try {
//     const users = await UserModel.find({
//       role: { $in: ["admin", "manager"] },
//     }).select("username email");
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch users" });
//   }
// });


// // get only users with developer role
// router.get("/developers", verifyToken, async (req, res) => {
//   try {
//     const developers = await UserModel.find({ role: "developer" }).select(
//       "username email"
//     );
//     res.json(developers);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch developers" });
//   }
// });

// // get only users with caller role
// router.get("/callers", verifyToken, async (req, res) => {
//   try {
//     const callers = await UserModel.find({ role: "caller" }).select(
//       "username email"
//     );
//     res.json(callers);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch callers" });
//   }
// });

// // fetches the username of the user
// router.get("/user", verifyToken, async (req, res) => {
//   try {
//     const user = await UserModel.findById(req.user.id).select("username");
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json(user);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

// // get leave history of a user
// router.get(
//   "/users/:id/leave-history",
//   verifyToken,
//   isAdmin,
//   async (req, res) => {
//     try {
//       const user = await UserModel.findById(req.params.id).select(
//         "leaveRecords leaveBalance"
//       );
//       if (!user) return res.status(404).json({ message: "User not found" });

//       res.json({
//         leaveRecords: user.leaveRecords,
//         leaveBalance: user.leaveBalance,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// );

// // add leave record function
// router.post(
//   "/users/:id/leave-records",
//   verifyToken,
//   isAdmin,
//   async (req, res) => {
//     const { startDate, endDate, type, note } = req.body;

//     if (!startDate || !endDate || !note) {
//       return res.status(400).json({
//         message: "All fields (startDate, endDate, note) are required.",
//       });
//     }

//     try {
//       const user = await UserModel.findById(req.params.id);
//       if (!user) return res.status(404).json({ message: "User not found" });

//       const leaveDuration =
//         (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
//       const leaveDays = type === "half" ? leaveDuration * 0.5 : leaveDuration;

//       user.leaveRecords.push({ startDate, endDate, type, note });

//       user.leaveBalance -= leaveDays;

//       await user.save();

//       res.json({ message: "Leave record added successfully", user });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// );

// // Uupdate leave balance function
// router.put(
//   "/users/:id/leave-balance",
//   verifyToken,
//   isAdmin,
//   async (req, res) => {
//     const { leaveBalance } = req.body;

//     if (typeof leaveBalance !== "number" || isNaN(leaveBalance)) {
//       return res
//         .status(400)
//         .json({ message: "Leave balance must be a valid number." });
//     }

//     try {
//       const user = await UserModel.findById(req.params.id);
//       if (!user) return res.status(404).json({ message: "User not found" });

//       user.leaveBalance = leaveBalance;
//       await user.save();

//       res.json({ message: "Leave balance updated successfully", user });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// );

// // delete leave record function
// router.delete(
//   "/users/:userId/leave-records/:recordId",
//   verifyToken,
//   isAdmin,
//   async (req, res) => {
//     const { userId, recordId } = req.params;

//     try {
//       const user = await UserModel.findById(userId);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       const recordIndex = user.leaveRecords.findIndex(
//         (record) => record._id.toString() === recordId
//       );

//       if (recordIndex === -1) {
//         return res.status(404).json({ message: "Leave record not found" });
//       }

//       user.leaveRecords.splice(recordIndex, 1);

//       await user.save();

//       res.json({ message: "Leave record deleted successfully", user });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// );




// export default router;

























import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// FILES IMPORTS
import UserModel from "../Models/UserModel.js";
import { verifyToken, isAdmin } from "../Middlewares/AuthMiddleware.js";

dotenv.config();

// --- CLOUDINARY & MULTER CONFIG ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store file in memory to stream directly to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });
// ----------------------------------

const router = express.Router();

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const isMatch = await user.comparePassword(password);

    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    // User ko token diya hai yaha
    jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY,
      { expiresIn: "2h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          role: user.role,
          userId: user._id,        
          username: user.username, 
          avatar: user.avatar // Send avatar on login as well
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Register
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    let user = await UserModel.findOne({ email });
    if (user) return res.status(400).json({ message: "User Already Exists" });

    user = new UserModel({ username, email, password, role });
    await user.save();
    res.json({ message: "User Registered Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Pakdo Sare Users Ko
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await UserModel.find(
      {},
      "username email role joiningDate leaveBalance leaveRecords avatar"
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// User ko kick kar do
router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// user update
router.put("/users/:id", verifyToken, isAdmin, async (req, res) => {
  const { username, role, joiningDate } = req.body;

  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.username = username || user.username;
    user.role = role || user.role;
    user.joiningDate = joiningDate || user.joiningDate;

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// get only users with manager and admin role
router.get("/admins-managers", verifyToken, async (req, res) => {
  try {
    const users = await UserModel.find({
      role: { $in: ["admin", "manager"] },
    }).select("username email avatar");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// get only users with developer role
router.get("/developers", verifyToken, async (req, res) => {
  try {
    const developers = await UserModel.find({ role: "developer" }).select(
      "username email avatar"
    );
    res.json(developers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch developers" });
  }
});

// get only users with caller role
router.get("/callers", verifyToken, async (req, res) => {
  try {
    const callers = await UserModel.find({ role: "caller" }).select(
      "username email avatar"
    );
    res.json(callers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch callers" });
  }
});

// fetches the username and avatar of the user
router.get("/user", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("username avatar");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// --- NEW ROUTE: Upload/Update Avatar ---
router.put("/user/avatar", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { imageUrl } = req.body;
    let finalUrl = "";

    // If user uploaded a File
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, { folder: "user_avatars" });
      finalUrl = result.secure_url;
    } 
    // If user provided a URL string
    else if (imageUrl) {
      // Upload the external URL directly to Cloudinary
      const result = await cloudinary.uploader.upload(imageUrl, { folder: "user_avatars" });
      finalUrl = result.secure_url;
    }

    if (!finalUrl) {
      return res.status(400).json({ message: "No image file or URL provided" });
    }

    // Update user in DB
    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      { avatar: finalUrl },
      { new: true }
    ).select("username avatar");

    res.json({ message: "Avatar updated successfully", avatar: user.avatar });
  } catch (error) {
    console.error("Avatar Upload Error:", error);
    res.status(500).json({ message: "Failed to upload avatar" });
  }
});

// get leave history of a user
router.get(
  "/users/:id/leave-history",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const user = await UserModel.findById(req.params.id).select(
        "leaveRecords leaveBalance"
      );
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({
        leaveRecords: user.leaveRecords,
        leaveBalance: user.leaveBalance,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// add leave record function
router.post(
  "/users/:id/leave-records",
  verifyToken,
  isAdmin,
  async (req, res) => {
    const { startDate, endDate, type, note } = req.body;

    if (!startDate || !endDate || !note) {
      return res.status(400).json({
        message: "All fields (startDate, endDate, note) are required.",
      });
    }

    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const leaveDuration =
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
      const leaveDays = type === "half" ? leaveDuration * 0.5 : leaveDuration;

      user.leaveRecords.push({ startDate, endDate, type, note });
      user.leaveBalance -= leaveDays;

      await user.save();

      res.json({ message: "Leave record added successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Update leave balance function
router.put(
  "/users/:id/leave-balance",
  verifyToken,
  isAdmin,
  async (req, res) => {
    const { leaveBalance } = req.body;

    if (typeof leaveBalance !== "number" || isNaN(leaveBalance)) {
      return res
        .status(400)
        .json({ message: "Leave balance must be a valid number." });
    }

    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.leaveBalance = leaveBalance;
      await user.save();

      res.json({ message: "Leave balance updated successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// delete leave record function
router.delete(
  "/users/:userId/leave-records/:recordId",
  verifyToken,
  isAdmin,
  async (req, res) => {
    const { userId, recordId } = req.params;

    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const recordIndex = user.leaveRecords.findIndex(
        (record) => record._id.toString() === recordId
      );

      if (recordIndex === -1) {
        return res.status(404).json({ message: "Leave record not found" });
      }

      user.leaveRecords.splice(recordIndex, 1);
      await user.save();

      res.json({ message: "Leave record deleted successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default router;