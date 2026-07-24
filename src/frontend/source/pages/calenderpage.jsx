import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import axios from "axios";
import { FiDownload, FiChevronLeft, FiChevronRight, FiCheck, FiX, FiClock, FiSun } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Extend dayjs with plugins
dayjs.extend(isToday);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Constants
const STATUS_OPTIONS = [
  { value: "Full Day", label: "Full Day", icon: <FiCheck className="text-green-500" /> },
  { value: "Half Day", label: "Half Day", icon: <FiClock className="text-yellow-500" /> },
  { value: "Absent", label: "Absent", icon: <FiX className="text-red-500" /> },
  { value: "Holiday", label: "Holiday", icon: <FiSun className="text-blue-500" /> }
];

const STATUS_COLORS = {
  "Full Day": {
    bg: "bg-green-100",
    text: "text-green-800",
    ring: "ring-green-300",
    icon: <FiCheck className="text-green-500" />
  },
  "Half Day": {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    ring: "ring-yellow-300",
    icon: <FiClock className="text-yellow-500" />
  },
  "Absent": {
    bg: "bg-red-100",
    text: "text-red-800",
    ring: "ring-red-300",
    icon: <FiX className="text-red-500" />
  },
  "Holiday": {
    bg: "bg-blue-100",
    text: "text-blue-800",
    ring: "ring-blue-300",
    icon: <FiSun className="text-blue-500" />
  },
  "": {
    bg: "bg-gray-50",
    text: "text-gray-600",
    ring: "ring-gray-200",
    icon: null
  }
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarPage() {
  // User and state management
  const userId = localStorage.getItem("userId");
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [status, setStatus] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [stats, setStats] = useState(null);
  const modalRef = useRef(null);

  // Memoized calendar days calculation
  const days = useMemo(() => {
    const start = currentMonth.startOf("month").startOf("week");
    const end = currentMonth.endOf("month").endOf("week");
    const daysArray = [];
    let date = start.clone();

    while (date.isSameOrBefore(end, "day")) {
      daysArray.push(date);
      date = date.add(1, "day");
    }

    return daysArray;
  }, [currentMonth]);

  // Calculate monthly statistics
  const calculateStats = useCallback((data) => {
    const monthStart = currentMonth.startOf("month").format("YYYY-MM-DD");
    const monthEnd = currentMonth.endOf("month").format("YYYY-MM-DD");

    const monthData = data.filter(record => 
      dayjs(record.date).isSameOrAfter(monthStart) && 
      dayjs(record.date).isSameOrBefore(monthEnd)
    );

    const counts = monthData.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});

    const workingDays = (counts["Full Day"] || 0) + (counts["Half Day"] || 0) + (counts["Absent"] || 0);
    const attendancePercentage = workingDays > 0 
      ? ((counts["Full Day"] || 0) + (counts["Half Day"] || 0) * 0.5) / workingDays * 100 
      : 0;

    setStats({
      counts,
      workingDays,
      attendancePercentage: attendancePercentage.toFixed(1),
      markedDays: monthData.length
    });
  }, [currentMonth]);

  // Fetch attendance data
  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`https://attendance-tracker-bktf.onrender.com/api/attendance/${userId}`);
      setAttendance(res.data);
      calculateStats(res.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, calculateStats]);

  // Download report
  const downloadReport = useCallback(async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    
    try {
      const response = await fetch("https://attendance-tracker-bktf.onrender.com/api/attendance/report", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Attendance_Report_${currentMonth.format('MMM-YYYY')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  // Handle date selection
  const handleDateClick = useCallback((date, event) => {
    const dateStr = date.format("YYYY-MM-DD");
    setSelectedDate(dateStr);
    const record = attendance.find(a => a.date === dateStr);
    setStatus(record?.status || "");

    const rect = event.currentTarget.getBoundingClientRect();
    setModalPosition({
      top: rect.top + window.scrollY + rect.height / 2,
      left: rect.left + window.scrollX + rect.width / 2,
    });
    setShowStatusModal(true);
  }, [attendance]);

  // Handle status change
  const handleStatusChange = useCallback(async (newStatus) => {
    setStatus(newStatus);
    try {
      await axios.post("https://attendance-tracker-bktf.onrender.com/api/attendance/mark", {
        userId,
        date: selectedDate,
        status: newStatus,
      });
      fetchAttendance();
      setShowStatusModal(false);
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  }, [userId, selectedDate, fetchAttendance]);

  // Month navigation
  const changeMonth = useCallback((months) => {
    setCurrentMonth(prev => prev.add(months, "month"));
    setShowStatusModal(false);
  }, []);

  // Get status for a date
  const getStatusForDate = useCallback((dateStr) => {
    const record = attendance.find(a => a.date === dateStr);
    return record?.status || "";
  }, [attendance]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowStatusModal(false);
      }
    };

    if (showStatusModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusModal]);

  // Initial data fetch
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Chart data
  const chartData = useMemo(() => ({
    labels: STATUS_OPTIONS.map(opt => opt.label),
    datasets: [{
      data: STATUS_OPTIONS.map(opt => stats?.counts[opt.value] || 0),
      backgroundColor: [
        '#10B981', // green
        '#F59E0B', // yellow
        '#EF4444', // red
        '#3B82F6'  // blue
      ],
      borderColor: [
        '#047857',
        '#B45309',
        '#B91C1C',
        '#1D4ED8'
      ],
      borderWidth: 1,
    }]
  }), [stats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold text-gray-800"
          >
            Attendance Calendar
          </motion.h1>
          
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadReport}
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50"
            >
              <FiDownload />
              {isLoading ? "Generating..." : "Download Report"}
            </motion.button>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FiCheck size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Present (Full)</p>
                <p className="text-xl font-bold">{stats.counts["Full Day"] || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FiClock size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Present (Half)</p>
                <p className="text-xl font-bold">{stats.counts["Half Day"] || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FiX size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-xl font-bold">{stats.counts["Absent"] || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FiSun size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Attendance</p>
                <p className="text-xl font-bold">{stats.attendancePercentage}%</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Calendar Container */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
            >
              <FiChevronLeft size={24} />
            </motion.button>
            
            <h2 className="text-2xl font-semibold">
              {currentMonth.format("MMMM YYYY")}
            </h2>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => changeMonth(1)}
              className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
            >
              <FiChevronRight size={24} />
            </motion.button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {WEEKDAYS.map(day => (
              <div key={day} className="bg-gray-100 p-3 text-center font-semibold text-gray-700 text-sm uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {days.map(date => {
              const dateStr = date.format("YYYY-MM-DD");
              const status = getStatusForDate(dateStr);
              const isCurrentMonth = date.month() === currentMonth.month();
              const isToday = date.isToday();
              const isSelected = selectedDate === dateStr;
              const statusConfig = STATUS_COLORS[status] || STATUS_COLORS[""];

              return (
                <motion.div
                  key={dateStr}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => handleDateClick(date, e)}
                  className={`min-h-24 p-3 border-b border-r border-gray-200 cursor-pointer transition-all duration-300 flex flex-col
                    ${isCurrentMonth ? "bg-white" : "bg-gray-50 opacity-75"}
                    ${isToday ? "ring-2 ring-indigo-500 z-10" : ""}
                    ${isSelected ? "ring-2 ring-purple-500 z-10" : ""}
                    ${statusConfig.bg} ${statusConfig.text} ${statusConfig.ring}
                    hover:shadow-lg hover:z-10 hover:scale-[1.03] relative group`}
                >
                  <div className={`flex justify-between items-start ${!isCurrentMonth ? "opacity-60" : ""}`}>
                    <span className={`text-sm font-medium ${isToday ? "font-bold text-indigo-600" : ""}`}>
                      {date.date()}
                    </span>
                    {isToday && (
                      <span className="text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">Today</span>
                    )}
                  </div>
                  
                  {status && (
                    <div className="mt-auto flex items-center gap-1">
                      {statusConfig.icon && (
                        <span className="text-sm">
                          {statusConfig.icon}
                        </span>
                      )}
                      <span className="text-xs font-medium">
                        {status}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats Visualization */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Attendance Distribution</h3>
              <div className="h-64">
                <Doughnut 
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const value = context.raw || 0;
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${context.label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">Monthly Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Working Days:</span>
                  <span className="font-medium">{stats.workingDays}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Days Marked:</span>
                  <span className="font-medium">{stats.markedDays}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Attendance Rate:</span>
                  <span className="font-medium">{stats.attendancePercentage}%</span>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${stats.attendancePercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Modal */}
        <AnimatePresence>
          {showStatusModal && selectedDate && (
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="fixed z-50 p-6 bg-white rounded-xl shadow-2xl border border-gray-200"
              style={{
                top: modalPosition.top,
                left: modalPosition.left,
                transform: "translate(-50%, -50%)",
                minWidth: "280px"
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {dayjs(selectedDate).format("ddd, MMM D")}
                </h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map(option => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleStatusChange(option.value)}
                      className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all
                        ${status === option.value ? 
                          `${STATUS_COLORS[option.value].bg} ${STATUS_COLORS[option.value].ring} ring-2` : 
                          "bg-gray-50 hover:bg-gray-100"}`}
                    >
                      {option.icon}
                      <span className="text-sm font-medium">{option.label}</span>
                    </motion.button>
                  ))}
                </div>

                {status && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium 
                        ${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text}`}>
                        Current: {status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CalendarPage;
