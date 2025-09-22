import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Payment.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import NavSup from "../NavSup/NavSup";

function Payment() {
  const [fertilizers, setFertilizers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [totalFertilizerPrice, setTotalFertilizerPrice] = useState(0);
  const [spiceTotals, setSpiceTotals] = useState([]);
  const [totalSpicePrice, setTotalSpicePrice] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Fetch fertilizers
  useEffect(() => {
    const fetchFertilizers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/fertilizers");
        if (res.data?.fertilizers) setFertilizers(res.data.fertilizers);
      } catch (err) {
        console.error("Error fetching fertilizers:", err);
      }
    };
    fetchFertilizers();
  }, []);

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/suppliers");
        if (res.data?.suppliers) setSuppliers(res.data.suppliers);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }
    };
    fetchSuppliers();
  }, []);

  // Filter and calculate totals when date or data changes
  useEffect(() => {
    if (!selectedDate) return;

    // --- Fertilizers ---
    const filteredFerts = fertilizers.filter(f => f.date?.split("T")[0] === selectedDate);
    const fertTotal = filteredFerts.reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.price || 0),
      0
    );
    setTotalFertilizerPrice(fertTotal);

    // --- Suppliers/Spices ---
    const filteredSuppliers = suppliers.filter(s => s.date?.split("T")[0] === selectedDate);

    const spiceGroups = {};
    filteredSuppliers.forEach(supplier => {
      const spiceName = supplier.spicename || "Unknown";
      const price = Number(supplier.price) || 0;

      if (!spiceGroups[spiceName]) {
        spiceGroups[spiceName] = { spiceName, supplierCount: 0, totalValue: 0 };
      }

      spiceGroups[spiceName].totalValue += price;
      spiceGroups[spiceName].supplierCount += 1;
    });

    const spiceArray = Object.values(spiceGroups).sort((a, b) => b.totalValue - a.totalValue);
    setSpiceTotals(spiceArray);
    setTotalSpicePrice(spiceArray.reduce((sum, s) => sum + s.totalValue, 0));
  }, [selectedDate, fertilizers, suppliers]);

  // Handle PDF Download
  const handleDownloadPdf = () => {
    const doc = new jsPDF();

    // --- Fertilizer Table ---
    doc.text(`Fertilizer Payments Report (${selectedDate})`, 14, 15);

    const fertColumns = ["Fertilizer Name", "Type", "Quantity (kg)", "Price (LKR)", "Total (LKR)"];
    const fertRows = fertilizers
      .filter(f => f.date?.split("T")[0] === selectedDate)
      .map(f => [
        f.fertilizerName || "-",
        f.fType || "-",
        f.quantity || "-",
        f.price ? f.price.toLocaleString() : "-",
        f.quantity && f.price ? (f.quantity * f.price).toLocaleString() : "-"
      ]);

    autoTable(doc, { head: [fertColumns], body: fertRows, startY: 25 });

    const fertEndY = doc.lastAutoTable.finalY || 35;
    doc.text(`Total Fertilizer Cost: LKR ${totalFertilizerPrice.toLocaleString()}`, 14, fertEndY + 10);

    // --- Spice Table ---
    doc.text(`Spice Payment Totals (${selectedDate})`, 14, fertEndY + 30);

    const spiceColumns = ["Spice Type", "Supplier Count", "Total Payment (LKR)"];
    const spiceRows = spiceTotals.map(s => [s.spiceName, s.supplierCount, s.totalValue.toLocaleString()]);

    if (spiceTotals.length > 0) {
      const totalSuppliers = spiceTotals.reduce((sum, s) => sum + s.supplierCount, 0);
      const totalValue = spiceTotals.reduce((sum, s) => sum + s.totalValue, 0);
      spiceRows.push(["TOTAL", totalSuppliers, totalValue.toLocaleString()]);
    }

    autoTable(doc, { head: [spiceColumns], body: spiceRows, startY: fertEndY + 40 });

    const spiceEndY = doc.lastAutoTable.finalY || fertEndY + 40;
    const combinedTotal = totalFertilizerPrice + totalSpicePrice;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Combined Total (Fertilizers + Spices): LKR ${combinedTotal.toLocaleString()}`, 14, spiceEndY + 15);

    doc.save(`Payments_Report_${selectedDate}.pdf`);
  };

  return (

<div className="Nav">
            <NavSup /> {/* Sidebar */}

    <div className="payment-payment-container">
      <div className="payment-header">
        <h1>Payments</h1>
        <p>Track total payments for fertilizers and suppliers</p>
      </div>

      <div className="payment-date-picker-container">
        <label>Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="payment-stats-grid">
        <div className="payment-stat-card payment-payments-stat">
          <div className="payment-stat-content">
            <div className="payment-stat-number">LKR {totalFertilizerPrice.toLocaleString()}</div>
            <div className="payment-stat-label">Total Fertilizer Cost</div>
          </div>
        </div>

        <div className="payment-stat-card payment-payments-stat">
          <div className="payment-stat-content">
            <div className="payment-stat-number">LKR {totalSpicePrice.toLocaleString()}</div>
            <div className="payment-stat-label">Total Supplier Payment</div>
          </div>
        </div>

        <div className="payment-stat-card payment-payments-stat">
          <div className="payment-stat-content">
            <div className="payment-stat-number">LKR {(totalFertilizerPrice + totalSpicePrice).toLocaleString()}</div>
            <div className="payment-stat-label">Combined Total</div>
          </div>
        </div>
      </div>

      {/* Fertilizer Table */}
      <div className="payment-card">
        <div className="payment-card-header"><div className="payment-card-title">Fertilizer Payments</div></div>
        <table className="payment-payment-table">
          <thead>
            <tr>
              <th>Fertilizer Name</th>
              <th>Type</th>
              <th>Quantity (kg)</th>
              <th>Price per 1kg(LKR)</th>
              <th>Total (LKR)</th>
            </tr>
          </thead>
          <tbody>
            {fertilizers.filter(f => f.date?.split("T")[0] === selectedDate).map((f, idx) => (
              <tr key={idx}>
                <td>{f.fertilizerName}</td>
                <td>{f.fType}</td>
                <td>{f.quantity}</td>
                <td>{f.price}</td>
                <td>{(f.quantity * f.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Spice Table */}
      <div className="payment-card" style={{ marginTop: "30px" }}>
        <div className="payment-card-header">
          <div className="payment-card-title">Spice Payment Totals by Type</div>
          <div className="payment-card-subtitle">Total payments for each spice variety from suppliers</div>
        </div>
        <table className="payment-payment-table">
          <thead>
            <tr>
              <th>Spice Type</th>
              <th>Supplier Count</th>
              <th>Total Payment (LKR)</th>
            </tr>
          </thead>
          <tbody>
            {spiceTotals.length > 0 ? (
              spiceTotals.map((s, idx) => (
                <tr key={idx}>
                  <td><strong>{s.spiceName}</strong></td>
                  <td>{s.supplierCount} suppliers</td>
                  <td><strong>LKR {s.totalValue.toLocaleString()}</strong></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>No spice data available</td>
              </tr>
            )}
            {spiceTotals.length > 0 && (
              <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "bold", borderTop: "2px solid #ddd" }}>
                <td>TOTAL</td>
                <td>{spiceTotals.reduce((sum, s) => sum + s.supplierCount, 0)} suppliers</td>
                <td><strong>LKR {spiceTotals.reduce((sum, s) => sum + s.totalValue, 0).toLocaleString()}</strong></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button className="payment-btn payment-btn-secondary" style={{ marginTop: "20px" }} onClick={handleDownloadPdf}>
        Download PDF
      </button>
    </div>

    </div>
  );
}

export default Payment;
