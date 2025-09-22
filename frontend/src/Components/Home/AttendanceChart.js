// src/Components/Home/AttendanceChart.js
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import "./AttendanceChart.css";

function AttendanceChart() {
  const [records, setRecords] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateOffset, setDateOffset] = useState(0); // 0 = today, 1 = yesterday, etc.

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attendanceRes, staffRes] = await Promise.all([
        axios.get("http://localhost:5000/attendance"),
        axios.get("http://localhost:5000/staff")
      ]);
      
      setRecords(attendanceRes.data.data);
      setStaffList(staffRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load attendance data");
      setLoading(false);
    }
  };

  // Handle date navigation
  const handlePreviousDay = () => {
    setDateOffset(prev => prev + 1);
  };

  const handleNextDay = () => {
    setDateOffset(prev => Math.max(0, prev - 1));
  };

  // Calculate the date to display based on offset
  const getDisplayDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - dateOffset);
    return date;
  };

  const displayDate = getDisplayDate();
  const formattedDate = displayDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Check if we can navigate to next day (only allow if not today)
  const canGoNext = dateOffset > 0;

  // Normalize date for comparison
  const normalizeDate = (date) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Filter records for the selected date
  const selectedDateFormatted = normalizeDate(displayDate);
  const dateRecords = records.filter((r) => normalizeDate(r.date) === selectedDateFormatted);

  // Calculate counts
  let onTime = 0;
  let late = 0;

  dateRecords.forEach((r) => {
    if (r.status?.toLowerCase() === "present") onTime++;
    else if (r.status?.toLowerCase() === "late") late++;
  });

  const attended = onTime + late;
  const absent = staffList.length - attended;

  // Calculate percentages
  const total = staffList.length;
  const onTimePercentage = total > 0 ? ((onTime / total) * 100).toFixed(1) : 0;
  const latePercentage = total > 0 ? ((late / total) * 100).toFixed(1) : 0;
  const absentPercentage = total > 0 ? ((absent / total) * 100).toFixed(1) : 0;
  const attendedPercentage = total > 0 ? ((attended / total) * 100).toFixed(1) : 0;

  // Chart Data - Filter out zero values for cleaner display
  const data = [
    { name: "On Time", value: onTime, color: "#689F38" },
    { name: "Late", value: late, color: "#FBC02D" },
    { name: "Absent", value: absent, color: "#E64A19" },
  ].filter(item => item.value > 0);

  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="attendancechart-container">
        <div className="attendancechart-header">
          <div>
            <div className="attendancechart-title">Attendance Overview</div>
            <div className="attendancechart-date-display">{formattedDate}</div>
          </div>
          <div className="attendancechart-stats-box">
            <div className="attendancechart-stats-label">TOTAL STAFF</div>
            <div className="attendancechart-stats-value">{staffList.length || 0}</div>
          </div>
        </div>
        <div className="attendancechart-navigation">
          <button className="attendancechart-nav-btn" onClick={handlePreviousDay}>&lt;</button>
          <button className="attendancechart-nav-btn" onClick={handleNextDay} disabled={!canGoNext}>&gt;</button>
          <button className="attendancechart-refresh-btn" onClick={handleRefresh}>↻</button>
        </div>
        <div className="attendancechart-loading">Loading attendance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attendancechart-container">
        <div className="attendancechart-header">
          <div>
            <div className="attendancechart-title">Attendance Overview</div>
            <div className="attendancechart-date-display">{formattedDate}</div>
          </div>
          <div className="attendancechart-stats-box">
            <div className="attendancechart-stats-label">TOTAL STAFF</div>
            <div className="attendancechart-stats-value">{staffList.length || 0}</div>
          </div>
        </div>
        <div className="attendancechart-navigation">
          <button className="attendancechart-nav-btn" onClick={handlePreviousDay}>&lt;</button>
          <button className="attendancechart-nav-btn" onClick={handleNextDay} disabled={!canGoNext}>&gt;</button>
          <button className="attendancechart-refresh-btn" onClick={handleRefresh}>↻</button>
        </div>
        <div className="attendancechart-error">{error}</div>
      </div>
    );
  }

  if (!records.length || !staffList.length) {
    return (
      <div className="attendancechart-container">
        <div className="attendancechart-header">
          <div>
            <div className="attendancechart-title">Attendance Overview</div>
            <div className="attendancechart-date-display">{formattedDate}</div>
          </div>
          <div className="attendancechart-stats-box">
            <div className="attendancechart-stats-label">TOTAL STAFF</div>
            <div className="attendancechart-stats-value">{staffList.length || 0}</div>
          </div>
        </div>
        <div className="attendancechart-navigation">
          <button className="attendancechart-nav-btn" onClick={handlePreviousDay}>&lt;</button>
          <button className="attendancechart-nav-btn" onClick={handleNextDay} disabled={!canGoNext}>&gt;</button>
          <button className="attendancechart-refresh-btn" onClick={handleRefresh}>↻</button>
        </div>
        <div className="attendancechart-no-data">No attendance data available</div>
      </div>
    );
  }

  return (
    <div className="attendancechart-container">
      <div className="attendancechart-header">
        <div>
          <div className="attendancechart-title">Attendance Overview</div>
          <div className="attendancechart-date-display">{formattedDate}</div>
        </div>
        <div className="attendancechart-stats-box">
          <div className="attendancechart-stats-label">TOTAL STAFF</div>
          <div className="attendancechart-stats-value">{staffList.length}</div>
        </div>
      </div>

      <div className="attendancechart-navigation">
        <button className="attendancechart-nav-btn" onClick={handlePreviousDay}>&lt;</button>
        <button className="attendancechart-nav-btn" onClick={handleNextDay} disabled={!canGoNext}>&gt;</button>
        <button className="attendancechart-refresh-btn" onClick={handleRefresh}>↻</button>
      </div>

      <div className="attendancechart-content">
        <div className="attendancechart-area">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={60}
                innerRadius={40}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} staff`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="attendancechart-stats-details">
          <div className="attendancechart-stats-column">
            <div className="attendancechart-stat-detail-item">
              <span className="attendancechart-stat-dot present"></span>
              <div className="attendancechart-stat-detail-content">
                <div className="attendancechart-stat-detail-value">{onTime}</div>
                <div className="attendancechart-stat-detail-label">On Time</div>
                <div className="attendancechart-stat-detail-percentage">({onTimePercentage}%)</div>
              </div>
            </div>
            
            <div className="attendancechart-stat-detail-item">
              <span className="attendancechart-stat-dot late"></span>
              <div className="attendancechart-stat-detail-content">
                <div className="attendancechart-stat-detail-value">{late}</div>
                <div className="attendancechart-stat-detail-label">Late</div>
                <div className="attendancechart-stat-detail-percentage">({latePercentage}%)</div>
              </div>
            </div>
          </div>
          
          <div className="attendancechart-stats-column">
            <div className="attendancechart-stat-detail-item">
              <span className="attendancechart-stat-dot absent"></span>
              <div className="attendancechart-stat-detail-content">
                <div className="attendancechart-stat-detail-value">{absent}</div>
                <div className="attendancechart-stat-detail-label">Absent</div>
                <div className="attendancechart-stat-detail-percentage">({absentPercentage}%)</div>
              </div>
            </div>
            
            <div className="attendancechart-stat-detail-item total">
              <span className="attendancechart-stat-dot present"></span>
              <div className="attendancechart-stat-detail-content">
                <div className="attendancechart-stat-detail-value">{attended}</div>
                <div className="attendancechart-stat-detail-label">Present</div>
                <div className="attendancechart-stat-detail-percentage">({attendedPercentage}%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="attendancechart-footer">
        Updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

export default AttendanceChart;