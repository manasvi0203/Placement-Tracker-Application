const express  = require("express");
const router   = express.Router();
const path     = require("path");
const auth     = require("../middleware/auth");
const upload   = require("../middleware/upload");
const User     = require("../models/User");
const Student  = require("../models/Student");
const Application = require("../models/Application");

// GET profile — merge user + student data
router.get("/profile", auth, async (req, res) => {
  try {
    const user    = await User.findById(req.user.id).select("-password");
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    res.json({
      _id:      user._id,
      name:     user.name,
      email:    user.email,
      role:     user.role,
      branch:   student.branch,
      cgpa:     student.cgpa,
      batch:    student.batch,
      backlogs: student.backlogs,
      resume:   student.resume,
      isPlaced: student.isPlaced,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT profile — update user name + student fields separately
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, branch, cgpa, batch, backlogs, resume } = req.body;

    // Update name in User
    await User.findByIdAndUpdate(req.user.id, { name });

    // Update student fields
    const student = await Student.findOneAndUpdate(
      { user: req.user.id },
      { branch, cgpa, batch, backlogs, resume },
      { returnDocument: "after", upsert: true } // upsert creates if not exists
    );

    const user = await User.findById(req.user.id).select("-password");
    res.json({
      _id:      user._id,
      name:     user.name,
      email:    user.email,
      role:     user.role,
      enrollmentNo: student.enrollmentNo,
      branch:   student.branch,
      cgpa:     student.cgpa,
      batch:    student.batch,
      backlogs: student.backlogs,
      resume:   student.resume,
      isPlaced: student.isPlaced,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST upload resume
router.post("/upload-resume", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const resumeUrl = `/uploads/${req.file.filename}`;
    await Student.findOneAndUpdate({ user: req.user.id }, { resume: resumeUrl });
    res.json({ resumeUrl });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
});

// GET applications
router.get("/applications", auth, async (req, res) => {
  try {
    const apps = await Application.find({ student: req.user.id }).sort("-createdAt");
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;