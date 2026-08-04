const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Application = require("../models/Application");
const Drive = require("../models/Drive");

router.post("/", auth, async (req, res) => {
  const { driveId } = req.body;
  const drive = await Drive.findById(driveId);
  if (!drive) return res.status(404).json({ message: "Drive not found" });
  if (drive.status === "closed") return res.status(400).json({ message: "Drive is closed" });

  const exists = await Application.findOne({ student: req.user.id, drive: driveId });
  if (exists) return res.status(400).json({ message: "Already applied" });

  const app = await Application.create({
    student: req.user.id,
    drive:   driveId,
    company: drive.company,
    role:    drive.role,
    status:  "applied",
  });
  res.status(201).json(app);
});

router.get("/", auth, async (req, res) => {
  const apps = await Application.find({ student: req.user.id }).sort("-createdAt");
  res.json(apps);
});

module.exports = router;