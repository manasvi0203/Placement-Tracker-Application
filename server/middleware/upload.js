const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const Student = require("../models/Student");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: async (req, file, cb) => {
    try {
      // Fetch student profile to get enrollment number and name
      const student = await Student.findOne({ user: req.user.id });
      const enroll  = student?.enrollmentNo || req.user.id;
      const name    = file.originalname
        .replace(path.extname(file.originalname), "") // strip extension
        .toLowerCase()
        .replace(/\s+/g, "_");
      const fileName = `${enroll}_${name}${path.extname(file.originalname)}`;
      cb(null, fileName);
    } catch {
      // Fallback if student not found
      cb(null, `${req.user.id}_resume${path.extname(file.originalname)}`);
    }
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;