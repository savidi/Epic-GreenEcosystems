import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AttendanceTable.css";
import Nav from "../Nav/Nav";
import AttendanceChart from "../Home/AttendanceChart";

function AttendanceTable() {
  const [records, setRecords] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => JSON.parse(localStorage.getItem("sidebar-collapsed")) || false
  );
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [searchQuery, setSearchQuery] = useState("");

  // -------------------- Fetch Data --------------------
  useEffect(() => {
    fetchAttendance();
    fetchStaff();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, staffList, selectedDate, searchQuery]);

  // Effect to listen for sidebar collapse changes via localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setIsSidebarCollapsed(
        JSON.parse(localStorage.getItem("sidebar-collapsed")) || false
      );
    };
    window.addEventListener("storage", handleStorageChange);
    handleStorageChange(); // Initial check on component mount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/attendance");
      setRecords(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await axios.get("http://localhost:5000/staff");
      setStaffList(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const normalizeDate = (date) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // -------------------- Filter Records --------------------
  const filterRecords = () => {
    let filtered = [...records];

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((record) => {
        if (!record.staffId) return false;
        const staff = staffList.find(
          (s) => s._id === (record.staffId._id || record.staffId)
        );
        return staff?.nationalId?.toLowerCase().includes(query);
      });

      if (selectedDate) {
        filtered = filtered.filter(
          (record) => normalizeDate(record.date) === selectedDate
        );
      }
    } else if (selectedDate) {
      filtered = filtered.filter(
        (record) => normalizeDate(record.date) === selectedDate
      );
    }

    setFilteredRecords(filtered);
  };

  const getStaffNationalId = (record) => {
    if (!record.staffId) return "N/A";
    const staff = staffList.find(
      (s) => s._id === (record.staffId._id || record.staffId)
    );
    return staff?.nationalId || "N/A";
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString();

  const formatTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  };

  const clearFilters = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSearchQuery("");
  };

  // -------------------- Attendance Summary --------------------
  const getAttendanceSummary = () => {
    const totalRegistered = staffList.length;
    let onTime = 0;
    let late = 0;

    filteredRecords.forEach((record) => {
      const status = record.status?.toLowerCase();
      if (status === "present") onTime++;
      else if (status === "late") late++;
    });

    const attended = onTime + late;
    const absent = totalRegistered - attended;

    return {
      totalRegistered,
      onTime,
      late,
      attended,
      absent,
    };
  };

  const summary = getAttendanceSummary();
  const getPercentage = (count, total) =>
    total > 0 ? ((count / total) * 100).toFixed(1) : 0;

  // -------------------- PDF Generation --------------------
  const generatePDF = () => {
    if (!filteredRecords.length)
      return alert("No attendance records to export!");

    const doc = new jsPDF("landscape");
    doc.setFontSize(18);
    doc.text("Attendance Report", 14, 20);
    doc.setFontSize(12);
    doc.text(
      selectedDate
        ? `Date: ${formatDate(selectedDate)}`
        : "Date: All Records",
      14,
      28
    );

    const tableColumns = [
      "Staff Name",
      "National ID",
      "Email",
      "Department",
      "Position",
      "Date",
      "Arrival Time",
      "Leaving Time",
      "OT Hours",
      "Status",
    ];

    const tableRows = filteredRecords.map((rec) => [
      rec.staffId?.name || "",
      getStaffNationalId(rec),
      rec.staffId?.email || "",
      rec.staffId?.staffType || "",
      rec.staffId?.position || "",
      formatDate(rec.date),
      formatTime(rec.arrivalTime || rec.date),
      formatTime(rec.leavingTime),
      rec.overtimeHours || 0,
      rec.status || "",
    ]);

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 35,
      theme: "striped",
    });

    // -------------------- Summary Below Table --------------------
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Staff: ${summary.totalRegistered}`, 14, finalY);
    doc.text(`On Time: ${summary.onTime}`, 14, finalY + 7);
    doc.text(`Late: ${summary.late}`, 14, finalY + 14);
    doc.text(`Absent: ${summary.absent}`, 14, finalY + 21);

    doc.save(
      `Attendance_Report_${selectedDate || "All_Records"}.pdf`
    );
  };

  // -------------------- JSX --------------------
  return (
    <>
      <Nav />
      <div
        className={`attendancetable-main-content-area ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <h1 className="attendancetable-attendance-title">
          Attendance Records
        </h1>

        {/* Filters */}
        <div className="attendancetable-filter-section">
          <div className="filter-group">
            <label
              htmlFor="nationalIdSearch"
              className="attendancetable-filter-label"
            >
              Search by National ID:
            </label>
            <div className="attendancetable-search-input-container">
              <input
                id="nationalIdSearch"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) setSelectedDate("");
                }}
                placeholder="Enter National ID"
                className="attendancetable-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="attendancetable-clear-search-btn"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="attendancetable-filter-group">
            <label
              htmlFor="dateSelect"
              className="attendancetable-filter-label"
            >
              Filter by Date:
            </label>
            <input
              id="dateSelect"
              type="date"
              value={selectedDate || ""}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="attendancetable-date-input"
            />
          </div>

          <div className="attendancetable-record-count">
            Showing {filteredRecords.length} attendance records{" "}
            {searchQuery && `for National ID: "${searchQuery}"`}{" "}
            {selectedDate &&
              !searchQuery &&
              `on ${formatDate(selectedDate)}`}
          </div>

          <button
            onClick={clearFilters}
            className="attendancetable-btn attendancetable-btn-clear"
          >
            Reset Filters
          </button>

          <button
            onClick={generatePDF}
            className="attendancetable-btn attendancetable-btn-pdf"
          >
            Download PDF
          </button>
        </div>

        {/* Attendance Table */}
        <table className="attendancetable-attendance-table">
          <thead className="attendancetable-table-header">
            <tr>
              <th>Staff Name</th>
              <th>National ID</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th>Date</th>
              <th>Arrival Time</th>
              <th>Leaving Time</th>
              <th>OT Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="attendancetable-table-body">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((rec) => (
                <tr key={rec._id}>
                  <td>{rec.staffId?.name}</td>
                  <td>{getStaffNationalId(rec)}</td>
                  <td>{rec.staffId?.email}</td>
                  <td>{rec.staffId?.staffType}</td>
                  <td>{rec.staffId?.position}</td>
                  <td>{formatDate(rec.date)}</td>
                  <td>{formatTime(rec.arrivalTime || rec.date)}</td>
                  <td>{formatTime(rec.leavingTime)}</td>
                  <td>{rec.overtimeHours || 0}</td>
                  <td>
                    <span
                      className={`attendancetable-status-badge attendancetable-status-${rec.status?.toLowerCase()}`}
                    >
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="attendancetable-empty-state"
                >
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Summary Cards */}
        {!searchQuery.trim() && staffList.length > 0 && (
          <div className="attendancetable-attendance-summary">
            <h2 className="attendancetable-summary-title">
              Attendance Summary{" "}
              {selectedDate
                ? `for ${formatDate(selectedDate)}`
                : "for Today"}
            </h2>

            <div className="attendancetable-summary-stats">
              <div className="attendancetable-stat-card">
                <div className="attendancetable-stat-label">
                  Total Staff
                </div>
                <div className="attendancetable-stat-value">
                  {summary.totalRegistered}
                </div>
              </div>

              <div className="attendancetable-stat-card attendancetable-stat-present">
                <div className="attendancetable-stat-label">
                  Present
                </div>
                <div className="attendancetable-stat-value">
                  {summary.attended}
                </div>
                <div className="attendancetable-stat-subtext">
                  ({summary.onTime} on time, {summary.late} late)
                </div>
              </div>

              <div className="attendancetable-stat-card attendancetable-stat-absent">
                <div className="attendancetable-stat-label">
                  Absent
                </div>
                <div className="attendancetable-stat-value">
                  {summary.absent}
                </div>
              </div>
            </div>

            <div className="attendancetable-summary-info">
              <div className="attendancetable-info-item">
                <strong>Attendance Rate:</strong>{" "}
                {getPercentage(
                  summary.attended,
                  summary.totalRegistered
                )}
                %
              </div>
              <div className="attendancetable-info-item">
                <strong>Absenteeism Rate:</strong>{" "}
                {getPercentage(
                  summary.absent,
                  summary.totalRegistered
                )}
                %
              </div>
              {summary.attended > 0 && (
                <div className="attendancetable-info-item">
                  <strong>Punctuality Rate:</strong>{" "}
                  {getPercentage(summary.onTime, summary.attended)}%
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AttendanceTable;
