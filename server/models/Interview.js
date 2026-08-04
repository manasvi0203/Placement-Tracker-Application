const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  driveId:   { type: mongoose.Schema.Types.ObjectId, ref: "Drive", required: true },
  company:   { type: String, required: true },
  role:      { type: String, required: true },
  roundNo:   { type: Number, required: true },
  type:      { type: String, required: true },
  date:      { type: String, required: true },
  time:      { type: String, required: true },
  venue:     { type: String, default: "" },
  isOnline:  { type: Boolean, default: false },
  link:      { type: String, default: "" },
  completed: { type: Boolean, default: false },
  shortlistedCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Interview", InterviewSchema);