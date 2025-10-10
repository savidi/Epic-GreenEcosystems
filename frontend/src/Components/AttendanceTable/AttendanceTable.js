import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AttendanceTable.css";
import Nav from "../Nav/Nav";

function AttendanceTable() {
  const [records, setRecords] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Load attendance & staff data simultaneously
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [attendanceRes, staffRes] = await Promise.all([
          axios.get("http://localhost:5000/attendance"),
          axios.get("http://localhost:5000/staff"),
        ]);
        setRecords(attendanceRes.data.data || []);
        setStaffList(staffRes.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter records whenever data, search, or date changes
  useEffect(() => {
    if (records.length && staffList.length) {
      const query = searchQuery.trim().toLowerCase();
      const filtered = records.filter((record) => {
        const staff = staffList.find(
          (s) => s._id === (record.staffId?._id || record.staffId)
        );

        if (!staff) return false;

        const matchesSearch = query
          ? staff.nationalId?.toLowerCase().includes(query)
          : true;

        const matchesDate = selectedDate
          ? normalizeDate(record.date) === selectedDate
          : true;

        return matchesSearch && matchesDate;
      });

      setFilteredRecords(filtered);
    }
  }, [records, staffList, selectedDate, searchQuery]);

  const normalizeDate = (date) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
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

  const getStaffNationalId = (record) => {
    const staff = staffList.find(
      (s) => s._id === (record.staffId?._id || record.staffId)
    );
    return staff?.nationalId || "N/A";
  };

  const clearFilters = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSearchQuery("");
  };

  // Optimized summary computation in a single loop
  const getAttendanceSummary = () => {
    const totalRegistered = staffList.length;
    let onTime = 0;
    let late = 0;

    filteredRecords.forEach((rec) => {
      const status = rec.status?.toLowerCase();
      if (status === "present") onTime++;
      else if (status === "late") late++;
    });

    const attended = onTime + late;
    const absent = totalRegistered - attended;

    return { totalRegistered, onTime, late, attended, absent };
  };

  const summary = getAttendanceSummary();

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

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Staff: ${summary.totalRegistered}`, 14, finalY);
    doc.text(`On Time: ${summary.onTime}`, 14, finalY + 7);
    doc.text(`Late: ${summary.late}`, 14, finalY + 14);
    doc.text(`Absent: ${summary.absent}`, 14, finalY + 21);

    doc.save(`Attendance_Report_${selectedDate || "All_Records"}.pdf`);
  };

  return (
    <>
      <Nav />
      <div className="attendancetable-main-content-area">
        <h1 className="attendancetable-attendance-title">
          Attendance Records
        </h1>

        
{/* Filter Section */}
<div className="attendancetable-filter-container">
  <div className="attendancetable-filter-section">
    
    {/* Filters on the left */}
    <div className="attendancetable-filters-left">
      <div className="filter-group">
        <div className="attendancetable-search-input-container">
          <label
            htmlFor="nationalIdSearch"
            className="attendancetable-filter-label"
          >
            Search by National ID:
          </label>
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
    </div>

    {/* Buttons on the right */}
    <div className="attendancetable-buttons-right">
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
  </div>
</div>


{/* Summary */}
<div className="attendancetable-attendance-summary">
  <h2 className="attendancetable-summary-title">
    Attendance Summary{" "}
    {selectedDate ? `for ${formatDate(selectedDate)}` : "for Today"}
  </h2>

  <div className="attendancetable-summary-stats">
    <div className="attendancetable-stat-card">
      <div className="attendancetable-stat-label">Total Staff</div>
      <div className="attendancetable-stat-value">
        {summary.totalRegistered || 0}
      </div>
    </div>

    <div className="attendancetable-stat-card attendancetable-stat-present">
      <div className="attendancetable-stat-label">Present</div>
      <div className="attendancetable-stat-value">
        {summary.attended || 0}
      </div>
      <div className="attendancetable-stat-subtext">
        ({summary.onTime || 0} on time, {summary.late || 0} late)
      </div>
    </div>

    <div className="attendancetable-stat-card attendancetable-stat-absent">
      <div className="attendancetable-stat-label">Absent</div>
      <div className="attendancetable-stat-value">
        {summary.absent || 0}
      </div>
    </div>
  </div>
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
          <td>{rec.staffId?.name || "—"}</td>
          <td>{getStaffNationalId(rec)}</td>
          <td>{rec.staffId?.email || "—"}</td>
          <td>{rec.staffId?.staffType || "—"}</td>
          <td>{rec.staffId?.position || "—"}</td>
          <td>{rec.date ? formatDate(rec.date) : "—"}</td>
          <td>{rec.arrivalTime ? formatTime(rec.arrivalTime) : "—"}</td>
          <td>{rec.leavingTime ? formatTime(rec.leavingTime) : "—"}</td>
          <td>{rec.overtimeHours || 0}</td>
          <td>
            <span
              className={`attendancetable-status-badge attendancetable-status-${rec.status?.toLowerCase() || "absent"}`}
            >
              {rec.status || "—"}
            </span>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="10" className="attendancetable-empty-state">
          No attendance records found
        </td>
      </tr>
    )}
  </tbody>
</table>

      </div>
    </>
  );
}

export default AttendanceTable;
