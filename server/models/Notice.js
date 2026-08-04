const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  message:    { type: String, required: true },
  department: { type: String, required: true },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Notice", NoticeSchema);