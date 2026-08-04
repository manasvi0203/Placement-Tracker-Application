require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User        = require("./models/User");
const Student     = require("./models/Student");
const Drive       = require("./models/Drive");
const Application = require("./models/Application");

const BRANCHES    = ["CS", "IT", "EC", "ME", "Civil"];
const FIRST_NAMES = ["Rahul", "Priya", "Aman", "Sneha", "Vikram", "Ananya", "Karan", "Riya", "Arjun", "Neha", "Rohan", "Pooja", "Siddharth", "Divya", "Aditya", "Kavya", "Manish", "Isha", "Varun", "Tanya"];
const LAST_NAMES  = ["Sharma", "Verma", "Gupta", "Iyer", "Singh", "Patel", "Reddy", "Nair", "Mehta", "Joshi"];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear all collections
    await Application.deleteMany({});
    await Student.deleteMany({});
    await User.deleteMany({});
    await Drive.deleteMany({});
    console.log("Cleared existing data");

    // ─── 1. TPO Admin ───────────────────────────────────────────
    const adminPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      name:     "Dr. Suresh Kumar",
      email:    "tpo@college.edu",
      role:     "tpo",
      password: adminPassword,
    });
    console.log("Created TPO admin: tpo@college.edu / admin123");

    // ─── 2. Coordinator ─────────────────────────────────────────
      const coordPassword = await bcrypt.hash("coord123", 10);
      const coordinators = [
        { name: "Ms. Anjali Mehta",  email: "coord.cs@college.edu",    department: "CS"    },
        { name: "Mr. Rajesh Nair",   email: "coord.it@college.edu",    department: "IT"    },
        { name: "Ms. Preethi Iyer",  email: "coord.ec@college.edu",    department: "EC"    },
        { name: "Mr. Vikram Patel",  email: "coord.me@college.edu",    department: "ME"    },
        { name: "Ms. Sunita Reddy",  email: "coord.civil@college.edu", department: "Civil" },
      ];

      for (const coord of coordinators) {
        await User.create({
          name:       coord.name,
          email:      coord.email,
          role:       "coordinator",
          password:   coordPassword,
          department: coord.department,
        });
      }
      console.log(`Created ${coordinators.length} coordinators (password: coord123)`);

    // ─── 3. Students ────────────────────────────────────────────
    const studentPassword = await bcrypt.hash("student123", 10);
    const studentUsers = [];

    for (let i = 0; i < 40; i++) {
      const first  = FIRST_NAMES[i % FIRST_NAMES.length];
      const last   = LAST_NAMES[Math.floor(i / 2) % LAST_NAMES.length];
      const branch = BRANCHES[i % BRANCHES.length];
      const cgpa   = +(6 + Math.random() * 4).toFixed(2); // 6.0 – 10.0

      // Create User (auth only)
      const user = await User.create({
        name:     `${first} ${last}`,
        email:    `${first.toLowerCase()}.${last.toLowerCase()}${i}@college.edu`,
        role:     "student",
        password: studentPassword,
      });

      // Create Student profile (academic details)
      const student = await Student.create({
        user:         user._id,
        enrollmentNo: `2025${branch}${String(i + 1).padStart(3, "0")}`, // e.g. 2025CS001
        branch,
        cgpa,
        batch:    "2025",
        backlogs: Math.random() > 0.85 ? 1 : 0,
        resume:   `${first.toLowerCase()}_${last.toLowerCase()}_cv.pdf`,
        isPlaced: false,
      });
      studentUsers.push({ user, student, branch, cgpa });
    }
    console.log(`Created ${studentUsers.length} students (password: student123)`);

    // ─── 4. Drives ──────────────────────────────────────────────
    const drivesData = [
      { company: "Microsoft",   role: "SDE Intern",          type: "Intern",     ctc: "₹60,000/mo",   date: "2025-06-12", minCGPA: 7.5, branches: ["CS", "IT"],                     slots: 30,  status: "open"   },
      { company: "Google",      role: "STEP Intern",          type: "Intern",     ctc: "₹80,000/mo",   date: "2025-06-14", minCGPA: 8.0, branches: ["CS"],                            slots: 10,  status: "open"   },
      { company: "TCS Digital", role: "Digital Role",         type: "FTE",        ctc: "₹7 LPA",       date: "2025-06-18", minCGPA: 7.0, branches: ["CS", "IT", "EC"],                slots: 100, status: "open"   },
      { company: "Cognizant",   role: "Programmer Analyst",   type: "FTE",        ctc: "₹4.5 LPA",     date: "2025-06-25", minCGPA: 6.5, branches: ["CS", "IT", "EC", "ME"],          slots: 200, status: "open"   },
      { company: "Flipkart",    role: "SDE 1",                type: "FTE",        ctc: "₹18 LPA",      date: "2025-06-08", minCGPA: 8.5, branches: ["CS"],                            slots: 5,   status: "closed" },
      { company: "Accenture",   role: "ASE",                  type: "Intern+FTE", ctc: "₹4.5 LPA",     date: "2025-07-02", minCGPA: 6.0, branches: ["CS", "IT", "EC", "ME", "Civil"], slots: 500, status: "open"   },
      { company: "Amazon",      role: "SDE Intern",           type: "Intern",     ctc: "₹1,00,000/mo", date: "2025-06-20", minCGPA: 8.0, branches: ["CS", "IT"],                     slots: 15,  status: "open"   },
      { company: "Wipro",       role: "Project Engineer",     type: "FTE",        ctc: "₹3.8 LPA",     date: "2025-06-05", minCGPA: 6.0, branches: ["CS", "IT", "EC", "ME"],          slots: 150, status: "closed" },
      { company: "Infosys",     role: "Systems Engineer",     type: "FTE",        ctc: "₹4 LPA",       date: "2025-06-03", minCGPA: 6.5, branches: ["CS", "IT", "EC"],                slots: 250, status: "closed" },
      { company: "Deloitte",    role: "Analyst",              type: "FTE",        ctc: "₹6.5 LPA",     date: "2025-07-10", minCGPA: 7.0, branches: ["CS", "IT"],                     slots: 20,  status: "open"   },
    ];
    const drives = await Drive.insertMany(drivesData);
    console.log(`Created ${drives.length} drives`);

    // ─── 5. Applications ────────────────────────────────────────
    const statuses = ["applied", "interview", "selected", "rejected"];
    let applicationCount = 0;
    let placedCount = 0;

    for (const { user, student, branch, cgpa } of studentUsers) {
      const eligibleDrives = drives.filter(d => {
        const branches = d.branches.map(b => b.toString());
        return Number(cgpa) >= Number(d.minCGPA) && branches.includes(branch);
      });

      // Fallback — always give some applications for demo
      const pool = eligibleDrives.length > 0 ? eligibleDrives : drives.slice(0, 2);
      const numApplications = Math.min(pool.length, Math.floor(Math.random() * 4) + 2);
      const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, numApplications);

      for (const drive of shuffled) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        try {
          await Application.create({
            student:   user._id,   // ref to User
            drive:     drive._id,
            company:   drive.company,
            role:      drive.role,
            type:      drive.type,
            status,
            driveDate: drive.date,
          });
          applicationCount++;

          // Mark student as placed if selected
          if (status === "selected" && !student.isPlaced) {
            student.isPlaced = true;
            await student.save();
            placedCount++;
          }
        } catch (err) {
          console.error(`Failed: ${user.name} → ${drive.company}: ${err.message}`);
        }
      }
    }

    console.log(`Created ${applicationCount} applications`);
    console.log(`${placedCount} students marked as placed`);

    console.log("\n=== Seed complete ===");
    console.log("TPO login:         tpo@college.edu / admin123");
    console.log("Coordinator login: coordinator@college.edu / coord123");
    console.log("Student login:     rahul.sharma0@college.edu / student123");

    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();