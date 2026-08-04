const express     = require("express");
const router      = express.Router();
const bcrypt      = require("bcryptjs");
const auth        = require("../middleware/auth");
const isAdmin     = require("../middleware/isAdmin");
const User        = require("../models/User");
const Student     = require("../models/Student"); 
const upload      = require("../middleware/upload");
const Drive       = require("../models/Drive");
const Application = require("../models/Application");
const Company = require("../models/Company");
const Interview = require("../models/Interview");
const Shortlist = require("../models/Shortlist");

router.use(auth, isAdmin); // every route below requires TPO role

// Dashboard stats
router.get("/stats", async (req, res) => {
  const totalStudents  = await User.countDocuments({ role: "student" });
  const activeDrives   = await Drive.countDocuments({ status: "open" });
  const placedStudents = await User.countDocuments({ role: "student", isPlaced: true });
  const placementRate  = totalStudents ? Math.round((placedStudents / totalStudents) * 100) : 0;
  res.json({ totalStudents, activeDrives, placedStudents, placementRate });
});

// Students list with application counts
router.get("/students", async (req, res) => {
  try {
    const students = await Student.find()
      .populate("user", "name email isDisabled")
      .sort("-createdAt");

    const withCounts = await Promise.all(students.map(async st => {
      const applicationCount = await Application.countDocuments({ student: st.user._id });

      // Build full resume URL if it exists
      const resumeUrl = st.resume
        ? st.resume.startsWith("/uploads")
          ? `http://localhost:5000${st.resume}`  // already a path
          : st.resume  // already a full URL or filename
        : null;

      return {
        _id:            st.user._id,
        studentId:      st._id,
        name:           st.user.name,
        email:          st.user.email,
        enrollmentNo:   st.enrollmentNo,
        isDisabled:     st.user.isDisabled,
        branch:         st.branch,
        cgpa:           st.cgpa,
        batch:          st.batch,
        backlogs:       st.backlogs,
        resume:         resumeUrl,       
        isPlaced:       st.isPlaced,
        applicationCount,
      };
    }));

    res.json(withCounts);
  } catch (err) {
    console.error("GET /admin/students error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get a single student's applications
router.get("/students/:id/applications", async (req, res) => {
  try {
    const apps = await Application.find({ student: req.params.id }).sort("-createdAt");
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All applications — needed for reports
router.get("/applications", async (req, res) => {
  try {
    const apps = await Application.find().sort("-createdAt");
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create drive
router.post("/drives", async (req, res) => {
  const drive = await Drive.create(req.body);
  res.status(201).json(drive);
});

// Update drive
router.put("/drives/:id", async (req, res) => {
  const drive = await Drive.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(drive);
});


// Delete drive
router.delete("/drives/:id", async (req, res) => {
  await Drive.findByIdAndDelete(req.params.id);
  res.json({ message: "Drive deleted" });
});


// Create coordinator (TPO only)
router.post("/coordinators", async (req, res) => {
  const { name, email, password, department } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, role: "coordinator",
      password: hashed,
      department, // e.g. "CS", "IT", "EC"
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all coordinators
router.get("/coordinators", async (req, res) => {
  try {
    const coordinators = await User.find({ role: "coordinator" }).select("-password");
    res.json(coordinators);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Reset password
router.put("/users/:id/reset-password", async (req, res) => {
  const { newPassword } = req.body;
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.params.id, { password: hashed });
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Enable / Disable account
router.put("/users/:id/toggle-status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isDisabled = !user.isDisabled;
    await user.save();
    res.json({ message: `Account ${user.isDisabled ? "disabled" : "enabled"}`, isDisabled: user.isDisabled });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete account
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update application status (coordinator updates results)
router.put("/applications/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // If selected, mark student as placed
    if (status === "selected") {
      await User.findByIdAndUpdate(app.student, { isPlaced: true });
    }

    // If rejected/moved back, check if student has any other selected apps
    if (status !== "selected") {
      const otherSelected = await Application.findOne({
        student: app.student,
        status: "selected",
        _id: { $ne: app._id }
      });
      if (!otherSelected) {
        await User.findByIdAndUpdate(app.student, { isPlaced: false });
      }
    }

    res.json(app);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



// GET all companies
router.get("/companies", async (req, res) => {
  try {
    const companies = await Company.find().sort("-createdAt");
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create company
router.post("/companies", async (req, res) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update company
router.put("/companies/:id", async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE company
router.delete("/companies/:id", async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: "Company deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Interview CRUD
router.get("/interviews", async (req, res) => {
  try {
    const interviews = await Interview.find().sort("date");
    res.json(interviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/interviews", async (req, res) => {
  try {
    const interview = await Interview.create(req.body);
    res.status(201).json(interview);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/interviews/:id", async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(interview);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/interviews/:id", async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all shortlisted
router.get("/shortlisted", async (req, res) => {
  try {
    const list = await Shortlist.find().sort("-createdAt");
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Upload shortlist CSV
router.post("/shortlisted/upload", upload.single("file"), async (req, res) => {
  try {
    const { roundId, driveId } = req.body;
    const round = await Interview.findById(roundId);
    // Parse CSV — in real app use csv-parser or xlsx package
    // For now return success
    res.json({ message: "Shortlist uploaded" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});



module.exports = router;