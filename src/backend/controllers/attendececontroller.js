const PDFDocument = require("pdfkit");
const Attendance = require("../models/attendanceModel");

const generateAttendanceReport = async (req, res) => {
  const userId = req.user._id;

  try {
    const attendanceRecords = await Attendance.find({ user: userId });

    const doc = new PDFDocument();
    let filename = `Attendance_Report_${Date.now()}.pdf`;
    filename = encodeURIComponent(filename);

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(20).text("Attendance Report", { align: "center" });
    doc.moveDown();

    attendanceRecords.forEach((entry, index) => {
      doc
        .fontSize(12)
        .text(
          `${index + 1}. Date: ${entry.date.toDateString()} - Status: ${entry.status}`
        );
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};

module.exports = { generateAttendanceReport };
