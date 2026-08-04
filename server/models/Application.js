const mongoose = require("mongoose");

const AppSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drive",
    },
    company:   { type: String, required: true },
    role:      { type: String, required: true },
    type:      { type: String, default: "" },
    status: {
      type: String,
      enum: ["applied", "interview", "selected", "rejected"],
      default: "applied",
    },
    driveDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", AppSchema);