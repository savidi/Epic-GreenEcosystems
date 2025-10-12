// src/Components/StaffManagement/StaffManagement.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import IDCard from "../IDcard/IDcard";
import "./StaffManagement.css";
import Nav from "../Nav/Nav";

// ✅ ADD THIS HELPER FUNCTION
const getAuthHeaders = () => {
  const token = localStorage.getItem('staffToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function StaffManagement() {
  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffTypeQuery, setStaffTypeQuery] = useState("");
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [previewStaff, setPreviewStaff] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    JSON.parse(localStorage.getItem("sidebar-collapsed")) || false
  );
  const idCardRef = useRef();

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [searchQuery, staffTypeQuery, staffList]);

  // ✅ Sync with Nav sidebar collapse
  useEffect(() => {
    const handleStorageChange = () => {
      const collapsed =
        JSON.parse(localStorage.getItem("sidebar-collapsed")) || false;
      setSidebarCollapsed(collapsed);
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const collapsed =
        JSON.parse(localStorage.getItem("sidebar-collapsed")) || false;
      if (collapsed !== sidebarCollapsed) setSidebarCollapsed(collapsed);
    }, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [sidebarCollapsed]);

  // ✅ UPDATED - Added auth headers
  const fetchStaff = async () => {
    try {
      const res = await axios.get("http://localhost:5000/staff", {
        headers: getAuthHeaders()
      });
      setStaffList(res.data.data);
      setFilteredStaff(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filterStaff = () => {
    let filtered = staffList;
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (staff) =>
          staff.nationalId &&
          staff.nationalId.toLowerCase().includes(query)
      );
    }
    if (staffTypeQuery.trim()) {
      filtered = filtered.filter(
        (staff) =>
          staff.staffType &&
          staff.staffType.toLowerCase() === staffTypeQuery.toLowerCase()
      );
    }
    setFilteredStaff(filtered);
  };

  // ✅ UPDATED - Added auth headers and better error handling
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?"))
      return;
    try {
      await axios.delete(`http://localhost:5000/staff/${id}`, {
        headers: getAuthHeaders()
      });
      fetchStaff();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("You must be logged in as HR Manager to delete staff.");
      } else if (err.response?.status === 403) {
        alert("Access denied. Only HR Managers can delete staff.");
      } else {
        alert(err.response?.data?.message || "Failed to delete staff.");
      }
    }
  };

  const clearSearch = () => setSearchQuery("");
  const clearStaffType = () => setStaffTypeQuery("");

  const handlePreviewIDCard = (staff) => {
    setPreviewStaff(staff);
    setModalOpen(true);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewStaff({ ...previewStaff, photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadIDCard = async () => {
    if (!idCardRef.current) return;
    const canvas = await html2canvas(idCardRef.current);
    const link = document.createElement("a");
    link.download = `${previewStaff.name}_IDCard.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const closeModal = () => setModalOpen(false);

  const staffTypeCounts = staffList.reduce((acc, staff) => {
    const type = staff.staffType || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const uniqueStaffTypes = [
    ...new Set(staffList.map((s) => s.staffType).filter(Boolean)),
  ];

  const generatePDF = () => {
    if (!filteredStaff.length) return alert("No staff to export!");
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    doc.setFontSize(18);
    doc.text("Staff Report", 40, 40);

    const tableColumn = [
      "ID",
      "Name",
      "National ID",
      "Age",
      "Gender",
      "Email",
      "AccountNo",
      "Department",
      "Position",
      "QR Code",
    ];

    const tableRows = filteredStaff.map((staff, index) => [
      index + 1,
      staff.name,
      staff.nationalId,
      staff.age,
      staff.gender,
      staff.email,
      staff.accountNo,
      staff.staffType,
      staff.position,
      staff.qrCode ? "Yes" : "N/A",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 40, right: 40 },
      tableWidth: "auto",
    });

    let finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.text(`Total Staff: ${staffList.length}`, 40, finalY);

    let offsetY = finalY + 20;
    Object.entries(staffTypeCounts).forEach(([type, count]) => {
      doc.text(`${type}: ${count}`, 40, offsetY);
      offsetY += 16;
    });

    doc.save("Staff_Report.pdf");
  };

  return (
    <div className="staffmanagementpage">
      <Nav />
      <div
        className={`staffmanagement-container ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <h1 className="fworker-page-titl">Staff Management</h1>
        
        {/* Filter container */}
        <div className="staffmanagement-filter-container">
          {/* Left section (filters) */}
          <div className="staffmanagement-filter-left">
            <div className="staffmanagement-search-container">
              <label className="staffmanagement-filter-label">
                Search by National ID:
              </label>
              <input
                type="text"
                placeholder="Enter National ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="staffmanagement-search-input"
              />
              {searchQuery && (
                <button
                  className="staffmanagement-clear-search-btn"
                  onClick={clearSearch}
                >
                  ×
                </button>
              )}
            </div>

            <div className="staffmanagement-filter-by-type">
              <label className="staffmanagement-filter-label">
                Filter by Staff Type:
              </label>
              <select
                value={staffTypeQuery}
                onChange={(e) => setStaffTypeQuery(e.target.value)}
                className="staffmanagement-search-input"
              >
                <option value="">All</option>
                {uniqueStaffTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {staffTypeQuery && (
                <button
                  className="staffmanagement-clear-search-btn"
                  onClick={clearStaffType}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Right section (buttons) */}
          <div className="staffmanagement-action-buttons-group">
            <button
              className="staffmanagement-action-btn staffmanagement-view-all-btn"
              onClick={() => {
                clearSearch();
                clearStaffType();
              }}
            >
              View All
            </button>

            <Link
              to="/addStaff"
              className="staffmanagement-action-btn staffmanagement-add-staff-btn"
            >
              Add Staff
            </Link>

            <button
              className="staffmanagement-action-btn staffmanagement-download-pdf-btn"
              onClick={generatePDF}
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Summary Cards Section */}
        <div className="staffmanagement-summary-cards">
          {/* Total Staff Card */}
          <div className="staffmanagement-summary-card staffmanagement-total-card">
            <h3>Total Staff</h3>
            <div className="amount">{staffList.length}</div>
            <div className="card-subtitle">All Departments</div>
          </div>
          
          {/* Department Cards */}
          {Object.entries(staffTypeCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <div key={type} className="staffmanagement-summary-card staffmanagement-dept-card">
                <h3>{type}</h3>
                <div className="count">{count}</div>
                <div className="card-subtitle">
                  {((count / staffList.length) * 100).toFixed(1)}% of total
                </div>
              </div>
            ))}
        </div>
        
        <table className="staffmanagement-staff-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>National ID</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Email</th>
              <th>AccountNo</th>
              <th>Department</th>
              <th>Position</th>
              <th>QR Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((staff) => (
                <tr key={staff._id}>
                  <td>{staff.name}</td>
                  <td>{staff.nationalId}</td>
                  <td>{staff.age}</td>
                  <td>{staff.gender}</td>
                  <td>{staff.email}</td>
                  <td>{staff.accountNo}</td>
                  <td>{staff.staffType}</td>
                  <td>{staff.position}</td>
                  <td>{staff.qrCode ? "Yes" : "N/A"}</td>
                  <td>
                    <div className="staffmanagement-action-buttons">
                      <Link
                        to={`/updateStaff/${staff._id}`}
                        className="staffmanagement-action-btn-update"
                      >
                        Update
                      </Link>
                      <button
                        className="staffmanagement-action-btn staffmanagement-delete-btn"
                        onClick={() => handleDelete(staff._id)}
                      >
                        Delete
                      </button>
                      <button
                        className="staffmanagement-action-btn staffmanagement-download-btn"
                        onClick={() => handlePreviewIDCard(staff)}
                      >
                        Download ID Card
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10">
                  <div className="staffmanagement-no-data">
                    No staff members found.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {modalOpen && previewStaff && (
          <div className="staffmanagement-idcard-modal">
            <div className="staffmanagement-idcard-modal-content">
              <button
                className="staffmanagement-close-btn"
                onClick={closeModal}
              >
                ×
              </button>
              <IDCard staff={previewStaff} ref={idCardRef} />
              {!previewStaff.photo && (
                <div className="staffmanagement-upload-photo-section">
                  <p>No photo uploaded. Upload now:</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </div>
              )}
              <button
                className="staffmanagement-download-idcard-btn"
                onClick={handleDownloadIDCard}
              >
                Download ID Card
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffManagement;