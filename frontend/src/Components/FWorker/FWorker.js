// src/Components/FWorker/FWorker.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Nav from "../Nav/Nav";
import "./FWorker.css";

const URL = "http://localhost:5000/fieldworkers";

// ✅ Helper: always return local YYYY-MM-DD
const getCurrentDate = () => {
  return new Date().toLocaleDateString("en-CA");
};

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

// Worker Row component
const WorkerRow = ({ user, onDelete }) => {
  const navigate = useNavigate();
  const {
    _id,
    name,
    nationalid,
    age,
    gender,
    date,
    arrivaltime,
    departuretime,
    workedhoures,
    salary,
    paymentstatus,
  } = user;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this staff member?"))
      return;
    try {
      await axios.delete(`${URL}/${_id}`);
      if (onDelete) onDelete(_id);
    } catch (err) {
      console.error("Error deleting worker:", err);
    }
  };

  const handleUpdate = () => {
    navigate(`/mainFWorker/${_id}`);
  };

  const getStatusClass = () => {
    const s = (paymentstatus || "").toLowerCase();
    if (s === "paid") return "fworker-status-badge fworker-status-paid";
    if (s === "pending") return "fworker-status-badge fworker-status-pending";
    if (s === "partial") return "fworker-status-badge fworker-status-partial";
    return "fworker-status-badge fworker-status-unpaid";
  };

  return (
    <tr>
      <td>{name}</td>
      <td>{nationalid}</td>
      <td>{age}</td>
      <td>{gender}</td>
      <td>{date ? new Date(date).toLocaleDateString() : ""}</td>
      <td>{arrivaltime}</td>
      <td>{departuretime}</td>
      <td>{workedhoures}</td>
      <td>RS: {salary}</td>
      <td>
        <span className={getStatusClass()}>{paymentstatus || "Unpaid"}</span>
      </td>
      <td>
        <button onClick={handleUpdate} className="fworker-btn update-btn">
          Update
        </button>
        <button onClick={handleDelete} className="fworker-btn delete-btn">
          Delete
        </button>
      </td>
    </tr>
  );
};

function FWorker() {
  const todayDate = getCurrentDate(); // ✅ use helper

  const [fworkers, setWorkers] = useState([]);
  const [searchNid, setSearchNid] = useState("");
  const [searchDate, setSearchDate] = useState(todayDate); // default today
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    JSON.parse(localStorage.getItem("sidebar-collapsed")) || false
  );
  const [paymentSummary, setPaymentSummary] = useState({
    totalPayments: 0,
    paidAmount: 0,
    pendingAmount: 0,
    partialAmount: 0,
    totalWorkers: 0,
    totalHours: 0,
  });

  // Sidebar collapse listener
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
      if (collapsed !== sidebarCollapsed) {
        setSidebarCollapsed(collapsed);
      }
    }, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [sidebarCollapsed]);

  // Fetch workers
  useEffect(() => {
    const getWorkers = async () => {
      try {
        const response = await fetchHandler();
        const data = response.data || response;
        setWorkers(data || []);

        // ✅ Compare using YYYY-MM-DD part only
        const todayWorkers = (data || []).filter((w) => {
          const workerDate = w.date ? w.date.split("T")[0] : "";
          return workerDate === todayDate;
        });

        setFilteredWorkers(todayWorkers);
        setPaymentSummary(calculatePaymentSummary(todayWorkers));
      } catch (error) {
        console.error("Error fetching workers:", error);
      }
    };
    getWorkers();
  }, [todayDate]);

  const handleDelete = (id) => {
    setWorkers((prev) => prev.filter((w) => w._id !== id));
    setFilteredWorkers((prev) => prev.filter((w) => w._id !== id));
  };

  const calculatePaymentSummary = (workers) => {
    return workers.reduce(
      (acc, worker) => {
        const salary = parseFloat(worker.salary) || 0;
        const hours = parseFloat(worker.workedhoures) || 0;

        acc.totalPayments += salary;
        acc.totalWorkers += 1;
        acc.totalHours += hours;

        switch ((worker.paymentstatus || "").toLowerCase()) {
          case "paid":
            acc.paidAmount += salary;
            break;
          case "pending":
            acc.pendingAmount += salary;
            break;
          case "partial":
            acc.partialAmount += salary;
            break;
          default:
            break;
        }
        return acc;
      },
      {
        totalPayments: 0,
        paidAmount: 0,
        pendingAmount: 0,
        partialAmount: 0,
        totalWorkers: 0,
        totalHours: 0,
      }
    );
  };

  // Filter by search
  useEffect(() => {
    let filtered = fworkers || [];
    if (searchNid.trim())
      filtered = filtered.filter((w) =>
        w.nationalid?.toLowerCase().includes(searchNid.toLowerCase())
      );
    if (searchDate.trim())
      filtered = filtered.filter((w) => {
        const workerDate = w.date ? w.date.split("T")[0] : "";
        return workerDate === searchDate;
      });

    setFilteredWorkers(filtered);
    setPaymentSummary(calculatePaymentSummary(filtered));
  }, [searchNid, searchDate, fworkers]);

  const handleViewAll = () => {
    setSearchNid("");
    setSearchDate("");
    setFilteredWorkers(fworkers);
    setPaymentSummary(calculatePaymentSummary(fworkers));
  };

  const formatCurrency = (amount) =>
    `RS ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const generatePDF = () => {
    if (!filteredWorkers.length) return alert("No workers to export!");
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    doc.setFontSize(18);
    doc.text("Field Workers Report", 40, 40);

    const tableColumn = [
      "Name",
      "National ID",
      "Age",
      "Gender",
      "Date",
      "Arrival",
      "Departure",
      "Worked Hours",
      "Salary",
      "Payment Status",
    ];
    const tableRows = filteredWorkers.map((w) => [
      w.name,
      w.nationalid,
      w.age,
      w.gender,
      w.date ? new Date(w.date).toLocaleDateString() : "",
      w.arrivaltime,
      w.departuretime,
      w.workedhoures,
      w.salary,
      w.paymentstatus || "Unpaid",
    ]);

    tableRows.push([
      "TOTAL",
      "",
      "",
      "",
      "",
      "",
      "",
      paymentSummary.totalHours.toFixed(1),
      paymentSummary.totalPayments.toFixed(2),
      "",
    ]);

    doc.autoTable({
       head: [tableColumn],
      body: tableRows,
      startY: 110,
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didParseCell: (data) => {
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [220, 220, 220];
          data.cell.styles.textColor = [0, 0, 0];
        }
      },
      margin: { left: 40, right: 40 },
    });

    doc.save("Field_Workers_Report.pdf");
  };

  return (
    <div>
      <Nav />
      <div
        className={`fworker-fworker-page ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <div className="fworker-fworker-content">
          <h1 className="fworker-page-titl">Field Workers</h1>

          <div className="fworker-search-section">
            <div className="fworker-search-group">
              <label>Search by National ID:</label>
               <input
                 type="text"
                 placeholder="Enter National ID"
                 value={searchNid}
                 onChange={(e) => setSearchNid(e.target.value)}
                />
          </div>

          <div className="fworker-search-group">
            <label>Filter by Date:</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
          </div>


            <div className="fworker-action-buttons">
              <button
                onClick={handleViewAll}
                className="fworker-view-all-btn"
              >
                View All
              </button>
              <Link
                to="/mainAddWorker"
                className="fworker-add-worker-btn"
              >
                Add Worker
              </Link>
              <button
                onClick={generatePDF}
                className="fworker-download-btn"
              >
                Download PDF
              </button>
            </div>
          </div>


          <div className="fworker-payment-summary-section">
                <h2>
                  {searchDate
                    ? `Payment Summary for ${new Date(
                        searchDate
                      ).toLocaleDateString()}`
                    : "Payment Summary"}
                </h2>
                <div className="fworker-summary-cards">
                  <div className="fworker-summary-card total">
                    <h3>Total Payments</h3>
                    <p className="fworker-amount">
                      {formatCurrency(paymentSummary.totalPayments)}
                    </p>
                    <span>{paymentSummary.totalWorkers} workers</span>
                  </div>
                  <div className="fworker-summary-card paid">
                    <h3>Paid</h3>
                    <p className="fworker-amount">
                      {formatCurrency(paymentSummary.paidAmount)}
                    </p>
                    <span>
                      {paymentSummary.totalPayments > 0
                        ? `${(
                            (paymentSummary.paidAmount /
                              paymentSummary.totalPayments) *
                            100
                          ).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="fworker-summary-card pending">
                    <h3>Pending</h3>
                    <p className="fworker-amount">
                      {formatCurrency(paymentSummary.pendingAmount)}
                    </p>
                    <span>
                      {paymentSummary.totalPayments > 0
                        ? `${(
                            (paymentSummary.pendingAmount /
                              paymentSummary.totalPayments) *
                            100
                          ).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="fworker-summary-card hours">
                    <h3>Total Hours</h3>
                    <p className="fworker-amount">
                      {paymentSummary.totalHours.toFixed(1)} hrs
                    </p>
                    <span>
                      Avg:{" "}
                      {paymentSummary.totalWorkers > 0
                        ? (
                            paymentSummary.totalHours /
                            paymentSummary.totalWorkers
                          ).toFixed(1)
                        : "0"}{" "}
                      hrs/worker
                    </span>
                  </div>
                </div>
              </div>







          {filteredWorkers.length > 0 ? (
            <>

              <div className="fworker-table-container">
                <table className="fworker-workers-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>National ID</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Date</th>
                      <th>Arrival Time</th>
                      <th>Departure Time</th>
                      <th>Worked Hours</th>
                      <th>Salary</th>
                      <th>Payment Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkers.map((w, i) => (
                      <WorkerRow key={w._id || i} user={w} onDelete={handleDelete} />
                    ))}
                  </tbody>
                </table>
              </div>

              
            </>
          ) : (
            <div className="fworker-no-results">
              <p>No workers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FWorker;
