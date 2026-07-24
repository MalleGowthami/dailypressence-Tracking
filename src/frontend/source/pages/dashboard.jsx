import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCalendar, FiCheckCircle, FiClock, FiXCircle, FiSun } from "react-icons/fi";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const userId = localStorage.getItem("userId");
  const [summary, setSummary] = useState({
    fullDays: 0,
    halfDays: 0,
    absentDays: 0,
    holidays: 0,
    totalMarked: 0,
    percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateSummary = (data) => {
    let full = 0, half = 0, absent = 0, holiday = 0;

    data.forEach(rec => {
      if (rec.status === "Full Day") full++;
      else if (rec.status === "Half Day") half++;
      else if (rec.status === "Absent") absent++;
      else if (rec.status === "Holiday") holiday++;
    });

    const presentEquivalent = full + (half * 0.5);
    const workingDays = full + half + absent;

    const percentage = workingDays === 0 ? 0 : (presentEquivalent / workingDays) * 100;

    setSummary({
      fullDays: full,
      halfDays: half,
      absentDays: absent,
      holidays: holiday,
      totalMarked: data.length,
      percentage: percentage.toFixed(2),
    });
    setIsLoading(false);
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`https://attendance-tracker-bktf.onrender.com/api/attendance/${userId}`);
        calculateSummary(res.data);
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const data = {
    labels: ['Full Days', 'Half Days', 'Absent', 'Holidays'],
    datasets: [
      {
        data: [summary.fullDays, summary.halfDays, summary.absentDays, summary.holidays],
        backgroundColor: [
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#3B82F6'
        ],
        borderColor: [
          '#047857',
          '#B45309',
          '#B91C1C',
          '#1D4ED8'
        ],
        borderWidth: 1,
      },
    ],
  };

  const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${color}-500 transition-all hover:shadow-md`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600 mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold">{isLoading ? "--" : value}</h3>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Attendance Dashboard
          </h1>
          <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
            <FiCalendar className="text-gray-500 mr-2" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={<FiCheckCircle size={20} />} 
                title="Full Days" 
                value={summary.fullDays} 
                color="green" 
              />
              <StatCard 
                icon={<FiClock size={20} />} 
                title="Half Days" 
                value={summary.halfDays} 
                color="yellow" 
              />
              <StatCard 
                icon={<FiXCircle size={20} />} 
                title="Absent" 
                value={summary.absentDays} 
                color="red" 
              />
              <StatCard 
                icon={<FiSun size={20} />} 
                title="Holidays" 
                value={summary.holidays} 
                color="blue" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Attendance Distribution</h2>
                <div className="h-64">
                  <Doughnut 
                    data={data} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                      },
                    }} 
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-center">
                <h2 className="text-xl font-semibold mb-4">Overall Attendance</h2>
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-48 mb-4">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-indigo-600"
                        strokeWidth="10"
                        strokeDasharray={`${summary.percentage}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">{summary.percentage}%</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-center">
                    {summary.totalMarked} days marked this period
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Attendance Summary</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Present (Full Days)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{summary.fullDays}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {summary.totalMarked > 0 ? ((summary.fullDays / summary.totalMarked) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Present (Half Days)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{summary.halfDays}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {summary.totalMarked > 0 ? ((summary.halfDays / summary.totalMarked) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Absent</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{summary.absentDays}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {summary.totalMarked > 0 ? ((summary.absentDays / summary.totalMarked) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Holidays</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{summary.holidays}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {summary.totalMarked > 0 ? ((summary.holidays / summary.totalMarked) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
