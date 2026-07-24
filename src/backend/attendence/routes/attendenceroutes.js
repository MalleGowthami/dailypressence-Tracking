const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const express = require("express");
const { generateAttendanceReport } = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");


router.get("/report", protect, generateAttendanceReport);


router.post("/mark", async (req, res) => {
  const { userId, date, status } = req.body;
  try {
    const record = await Attendance.findOneAndUpdate(
      { userId, date },
      { status },
      { upsert: true, new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.params.userId });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
