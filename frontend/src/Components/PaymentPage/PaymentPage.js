// src/Components/PaymentPage/PaymentPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./PaymentPage.css";
import Nav from "../Nav/Nav";

// Get current month in YYYY-MM
const getCurrentMonth = () => {
  const today = new Date();
  const month = today.getMonth() + 1;
  return `${today.getFullYear()}-${month < 10 ? "0" + month : month}`;
};

// Check if selected month is completed
const isMonthCompleted = (m) => {
  const [year, mon] = m.split("-").map(Number);
  const today = new Date();
  return year < today.getFullYear() || (year === today.getFullYear() && mon < today.getMonth() + 1);
};

function PaymentPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch payments and auto-calculate from backend
  const fetchPayments = async (selectedMonth) => {
    if (!selectedMonth) return setPayments([]);
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/payments?month=${selectedMonth}`);
      setPayments(res.data.data || []);
    } catch (err) {
      console.error("Fetch payments error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments(month);
    // Optional: Polling every 30s to auto-update if attendance changes
    const interval = setInterval(() => fetchPayments(month), 30000);
    return () => clearInterval(interval);
  }, [month]);

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  // Delete payments
  const handleDelete = async () => {
    if (!month) return alert("Select month first!");
    if (!window.confirm(`Delete payments for ${month}?`)) return;

    try {
      await axios.delete(`http://localhost:5000/payments/${month}`);
      setPayments([]);
      alert("Payments deleted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error deleting payments");
    }
  };

  // Generate PDF
  const generatePDF = () => {
    if (!payments.length) return alert("No payment data to export!");
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFontSize(18);
    doc.text("Payment Report", 40, 40);

    const today = new Date().toLocaleDateString();
    doc.text(`Report Generated: ${today}`, 40, 80);

    doc.setFontSize(12);

    const tableColumn = [
      "Staff Name", "Email", "Position", "Month",
      "OT Pay", "Late Days", "Absent Days",
      "Late Deduction", "Absent Deduction", "Final Salary"
    ];

    const tableRows = payments.map(p => [
      p.staffId?.name || "",
      p.staffId?.email || "",
      p.staffId?.position || "",
      p.month,
      p.otPay,
      p.lateCount,
      p.absentCount,
      p.lateDeduction,
      p.absentDeduction,
      isMonthCompleted(p.month) ? p.amount : ""
    ]);

    const totalOTPay = payments.reduce((sum, p) => sum + (p.otPay || 0), 0);
    const totalLateDeduction = payments.reduce((sum, p) => sum + (p.lateDeduction || 0), 0);
    const totalAbsentDeduction = payments.reduce((sum, p) => sum + (p.absentDeduction || 0), 0);
    const totalPayment = payments.reduce((sum, p) => sum + ((isMonthCompleted(p.month) ? p.amount : 0) || 0), 0);

    tableRows.push([
      "TOTAL", "", "", "", totalOTPay, "", "", totalLateDeduction, totalAbsentDeduction, totalPayment
    ]);

    autoTable(doc, {
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

    doc.save(`Payment_Report_${month}.pdf`);
  };

  // Totals for summary cards
  const totalOTPay = payments.reduce((sum, p) => sum + (p.otPay || 0), 0);
  const totalLateDeduction = payments.reduce((sum, p) => sum + (p.lateDeduction || 0), 0);
  const totalAbsentDeduction = payments.reduce((sum, p) => sum + (p.absentDeduction || 0), 0);
  const totalSalary = payments.reduce((sum, p) => sum + ((isMonthCompleted(p.month) ? p.amount : 0) || 0), 0);

  return (
    <div className="paymentpage-attendance-scanne-page">
      <Nav />
      {/* Wrap content in nav-content-wrapper to move with sidebar */}
      <div className="nav-content-wrapper">
        <div className="paymentpage-payment-container">
          <div  className="payment-page-title">
          <h1>Payment Management</h1>
          </div>
          {/* New filter container */}
          <div className="paymentpage-filter-container">
            <div className="paymentpage-filter-section">
    
              {/* Filters on the left */}
              <div className="paymentpage-filters-left">
                <label>Select Month:</label>
                  <input 
                   type="month" 
                   value={month} 
                   onChange={handleMonthChange} 
                  />
              </div>

              {/* Button on the right */}
              <div className="paymentpage-buttons-right">
                <button 
                   onClick={generatePDF} 
                   className="paymentpage-pdf"
                >
                  Download PDF
                </button>
              </div>
    
            </div>
          </div>




          <div className="paymentpage-payment-summary-section">
            <h2 className="j">Monthly Summary</h2>
            <div className="paymentpage-summary-cards">
              <div className="paymentpage-summary-card total">
                <h3>Total OT Pay</h3>
                <div className="paymentpage-amount">{totalOTPay}</div>
              </div>
              <div className="paymentpage-summary-card pending">
                <h3>Total Late Deduction</h3>
                <div className="paymentpage-amount">{totalLateDeduction}</div>
              </div>
              <div className="paymentpage-summary-card pending">
                <h3>Total Absent Deduction</h3>
                <div className="paymentpage-amount">{totalAbsentDeduction}</div>
              </div>
              <div className="paymentpage-summary-card paid">
                <h3>Total Payment</h3>
                <div className="paymentpage-amount">{totalSalary}</div>
              </div>
            </div>
          </div>

          {loading ? (
            <p>Loading payments...</p>
          ) : payments.length === 0 ? (
            <p className="paymentpage-no-data">No payments found for selected month.</p>
          ) : (
            <table className="paymentpage-payment-table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Email</th>
                  <th>Position</th>
                  <th>Month</th>
                  <th>OT Pay</th>
                  <th>Late Days</th>
                  <th>Absent Days</th>
                  <th>Late Deduction</th>
                  <th>Absent Deduction</th>
                  <th>Final Salary</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id}>
                    <td>{p.staffId?.name}</td>
                    <td>{p.staffId?.email}</td>
                    <td>{p.staffId?.position}</td>
                    <td>{p.month}</td>
                    <td>{p.otPay}</td>
                    <td>{p.lateCount}</td>
                    <td>{p.absentCount}</td>
                    <td>{p.lateDeduction}</td>
                    <td>{p.absentDeduction}</td>
                    <td>{isMonthCompleted(p.month) ? p.amount : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;