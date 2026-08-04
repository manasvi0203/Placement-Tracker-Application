const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const Drive   = require("../models/Drive");

// Get all drives (students see all, filtered client-side)
router.get("/", auth, async (req, res) => {
  const drives = await Drive.find().sort("date");
  res.json(drives);
});

// Get only upcoming open drives
router.get("/upcoming", auth, async (req, res) => {
  const drives = await Drive.find({ status: "open", date: { $gte: new Date() } }).sort("date").limit(5);
  res.json(drives);
});

module.exports = router;