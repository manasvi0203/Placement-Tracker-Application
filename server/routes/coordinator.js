const express     = require("express");
const router      = express.Router();
const auth        = require("../middleware/auth");
const isCoord     = require("../middleware/isCoordinator");
const User        = require("../models/User");
const Student     = require("../models/Student");
const Application = require("../models/Application");
const Drive       = require("../models/Drive");
const Notice      = require("../models/Notice");

router.use(auth, isCoord);

// Helper — get coordinator's department from their User doc
const getDept = async (userId) => {
  const user = await User.findById(userId);
  return user?.department || "";
};

// GET dept students only
router.get("/students", async (req, res) => {
  try {
    const dept = await getDept(req.user.id);
    const students = await Student.find({ branch: dept })
      .populate("user", "name email isDisabled")
      .sort("-createdAt");

    const withCounts = await Promise.all(students.map(async st => {
      const applicationCount = await Application.countDocuments({ student: st.user._id });
      return {
        _id:             st.user._id,
        studentId:       st._id,
        name:            st.user.name,
        email:           st.user.email,
        enrollmentNo:    st.enrollmentNo,
        isDisabled:      st.user.isDisabled,
        branch:          st.branch,
        cgpa:            st.cgpa,
        batch:           st.batch,
        backlogs:        st.backlogs,
        resume:          st.resume,
        isPlaced:        st.isPlaced,
        applicationCount,
      };
    }));
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET dept applications only
router.get("/applications", async (req, res) => {
  try {
    const dept = await getDept(req.user.id);
    const deptStudents = await Student.find({ branch: dept });
    const studentIds = deptStudents.map(s => s.user);
    const apps = await Application.find({ student: { $in: studentIds } }).sort("-createdAt");
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all drives (coordinator can view all but manage only dept-related)
router.get("/drives", async (req, res) => {
  try {
    const dept = await getDept(req.user.id);
    // Only drives that include coordinator's department
    const drives = await Drive.find({ branches: dept }).sort("date");
    res.json(drives);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET eligible students for a drive (dept only)
router.get("/drives/:driveId/eligible", async (req, res) => {
  try {
    const dept  = await getDept(req.user.id);
    const drive = await Drive.findById(req.params.driveId);
    if (!drive) return res.status(404).json({ message: "Drive not found" });

    const eligible = await Student.find({
      branch: dept,
      cgpa:   { $gte: drive.minCGPA },
    }).populate("user", "name email");

    res.json(eligible);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update student profile (verify/correct details)
router.put("/students/:userId", async (req, res) => {
  try {
    const dept    = await getDept(req.user.id);
    const student = await Student.findOne({ user: req.params.userId });
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.branch !== dept) return res.status(403).json({ message: "Not your department" });

    const { branch, cgpa, batch, backlogs, resume, isPlaced } = req.body;
    const updated = await Student.findOneAndUpdate(
      { user: req.params.userId },
      { branch, cgpa, batch, backlogs, resume, isPlaced },
      { returnDocument: "after"  }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update application result
router.put("/applications/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const app = await Application.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (status === "selected") {
      await Student.findOneAndUpdate({ user: app.student }, { isPlaced: true });
    }
    if (status !== "selected") {
      const other = await Application.findOne({ student: app.student, status: "selected", _id: { $ne: app._id } });
      if (!other) await Student.findOneAndUpdate({ user: app.student }, { isPlaced: false });
    }
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST send notice to dept students
router.post("/notices", async (req, res) => {
  try {
    const dept = await getDept(req.user.id);
    const { title, message } = req.body;
    const notice = await Notice.create({
      title, message,
      department:  dept,
      createdBy:   req.user.id,
    });
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET notices for dept
router.get("/notices", async (req, res) => {
  try {
    const dept = await getDept(req.user.id);
    const notices = await Notice.find({ department: dept }).sort("-createdAt");
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;