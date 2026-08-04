const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    enrollmentNo: {
      type: String,
      required: "true",
      unique: "true",
    },
    branch: { type: String, default: "" },
    cgpa: { type: Number, default: 0 },
    batch: { type: String, default: "" },
    backlogs: { type: Number, default: 0 },
    resume: { type: String, default: "" },
    isPlaced: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", StudentSchema);
