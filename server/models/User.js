const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    role:       { type: String, enum: ["student", "tpo", "coordinator"], required: true },
    password:   { type: String, required: true },

    //Student and Coordinator both
    department: { type: String, default: "" },
    // Admin controls
    isDisabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);