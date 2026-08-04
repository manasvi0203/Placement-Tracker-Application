const mongoose = require("mongoose");

const HRContactSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
});

const CompanySchema = new mongoose.Schema({
  name:         { type: String, required: true },
  type:         { type: String, default: "" }, // Product, Service, Startup etc.
  location:     { type: String, default: "" },
  packageRange: { type: String, default: "" },
  website:      { type: String, default: "" },
  hrName:       { type: String, default: "" }, // primary HR
  hrEmail:      { type: String, default: "" },
  hrPhone:      { type: String, default: "" },
  hrContacts:   [HRContactSchema],             // additional HR contacts
  isVerified:   { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Company", CompanySchema);