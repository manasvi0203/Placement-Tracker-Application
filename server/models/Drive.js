const mongoose = require("mongoose");
const DriveSchema = new mongoose.Schema(
  {
    company: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        required: true 
    },
    type: {
      type: String,
      enum: ["FTE", "Intern", "Intern+FTE"],
      required: true,
    },
    ctc: { 
        type: String, 
        required: true 
    },
    date: { 
        type: Date, 
        required: true 
    },
    minCGPA: { 
        type: Number, 
        required: true 
    },
    branches: 
    [{ type: String }],
    slots: { 
        type: Number, 
        default: 0 
    },
    status: { 
        type: String, 
        enum: ["open", "closed"], 
        default: "open" 
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Drive", DriveSchema);
