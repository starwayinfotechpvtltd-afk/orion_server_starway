import Application from "../Models/ApplicationModel.js";

// Create candidate application (HR only or public submission)
export const createApplication = async (req, res) => {
  const { candidateName, email, phoneNumber, position, resumeUrl, notes } = req.body;
  if (!candidateName || !email || !phoneNumber || !position) {
    return res.status(400).json({ message: "Name, email, phone, and position are required." });
  }

  try {
    const app = new Application({
      candidateName,
      email,
      phoneNumber,
      position,
      resumeUrl,
      notes
    });
    await app.save();
    res.status(201).json({ message: "Application submitted successfully.", application: app });
  } catch (error) {
    console.error("createApplication error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all applications (HR & admin only)
export const getApplications = async (req, res) => {
  try {
    const apps = await Application.find({}).sort({ createdAt: -1 }).lean();
    res.status(200).json(apps);
  } catch (error) {
    console.error("getApplications error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update candidate application status or details (HR & admin only)
export const updateApplication = async (req, res) => {
  const { candidateName, email, phoneNumber, position, resumeUrl, status, notes } = req.body;
  try {
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: "Application not found." });
    }

    app.candidateName = candidateName || app.candidateName;
    app.email = email || app.email;
    app.phoneNumber = phoneNumber || app.phoneNumber;
    app.position = position || app.position;
    app.resumeUrl = resumeUrl || app.resumeUrl;
    app.status = status || app.status;
    app.notes = notes !== undefined ? notes : app.notes;

    await app.save();
    res.status(200).json({ message: "Application updated successfully.", application: app });
  } catch (error) {
    console.error("updateApplication error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete application (HR & admin only)
export const deleteApplication = async (req, res) => {
  try {
    const app = await Application.findByIdAndDelete(req.params.id);
    if (!app) {
      return res.status(404).json({ message: "Application not found." });
    }
    res.status(200).json({ message: "Application deleted successfully." });
  } catch (error) {
    console.error("deleteApplication error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
