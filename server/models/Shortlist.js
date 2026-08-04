const mongoose = require("mongoose");

const ShortlistSchema = new mongoose.Schema({
  roundId:      { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
  driveId:      { type: mongoose.Schema.Types.ObjectId, ref: "Drive" },
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  enrollmentNo: { type: String },
  studentName:  { type: String },
  company:      { type: String },
  roundNo:      { type: Number },
  status:       { type: String, enum: ["shortlisted", "rejected", "selected"], default: "shortlisted" },
}, { timestamps: true });

module.exports = mongoose.model("Shortlist", ShortlistSchema);