const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: String,
  status: { type: String, enum: ["Full Day", "Half Day", "Absent", "Holiday"] },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
