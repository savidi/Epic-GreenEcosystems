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
    axios.get("http://localhost:5000/fertilizers")
      .then(res => setFertilizers(res.data.fertilizers || []))
      .catch(err => console.error(err));
  }, []);

  // Fetch suppliers
  useEffect(() => {
    axios.get("http://localhost:5000/suppliers")
      .then(res => setSuppliers(res.data.suppliers || []))
      .catch(err => console.error(err));
  }, []);

  // Calculate totals
  useEffect(() => {
    if (!selectedDate) return;

    const filteredFerts = fertilizers.filter(f => f.date?.split("T")[0] === selectedDate);
    const fertTotal = filteredFerts.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    setTotalFertilizerPrice(fertTotal);

    const filteredSuppliers = suppliers.filter(s => s.date?.split("T")[0] === selectedDate);
    const spiceGroups = {};
    filteredSuppliers.forEach(s => {
      const spiceName = s.spicename || "Unknown";
      const price = Number(s.price) || 0;
      if (!spiceGroups[spiceName]) spiceGroups[spiceName] = { spiceName, supplierCount: 0, totalValue: 0 };
      spiceGroups[spiceName].supplierCount += 1;
      spiceGroups[spiceName].totalValue += price;
    });
    const spiceArray = Object.values(spiceGroups).sort((a, b) => b.totalValue - a.totalValue);
    setSpiceTotals(spiceArray);
    setTotalSpicePrice(spiceArray.reduce((sum, s) => sum + s.totalValue, 0));
  }, [selectedDate, fertilizers, suppliers]);

  // PDF download
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.text(`Payments Report (${selectedDate})`, 14, 15);

    // Fertilizer Table
    const fertColumns = ["Fertilizer Name","Type","Quantity (kg)","Price (LKR)","Total (LKR)"];
    const fertRows = fertilizers.filter(f => f.date?.split("T")[0] === selectedDate)
      .map(f => [f.fertilizerName,f.fType,f.quantity,f.price,f.quantity*f.price]);
    autoTable(doc,{head:[fertColumns],body:fertRows,startY:25});
    const fertEndY = doc.lastAutoTable.finalY || 35;
    doc.text(`Total Fertilizer Cost: LKR ${totalFertilizerPrice}`,14,fertEndY+10);

    // Spice Table
    const spiceColumns = ["Spice Type","Supplier Count","Total Payment (LKR)"];
    const spiceRows = spiceTotals.map(s => [s.spiceName,s.supplierCount,s.totalValue]);
    if(spiceTotals.length>0) spiceRows.push([
      "TOTAL",
      spiceTotals.reduce((sum,s)=>sum+s.supplierCount,0),
      spiceTotals.reduce((sum,s)=>sum+s.totalValue,0)
    ]);
    autoTable(doc,{head:[spiceColumns],body:spiceRows,startY: fertEndY+30});
    const combinedTotal = totalFertilizerPrice+totalSpicePrice;
    doc.setFontSize(12);
    doc.setFont("helvetica","bold");
    doc.text(`Combined Total: LKR ${combinedTotal}`,14,doc.lastAutoTable.finalY+15);
    doc.save(`Payments_Report_${selectedDate}.pdf`);
  };

  return (
    <div className="sup-layout">
      <NavSup />
      <div className="sup-main-content">
        <div className="sup-header">
          <h1>Payments</h1>
          <p>Track total payments for fertilizers and suppliers</p>
         

        <div className="sup-date-picker">
          <label>Select Date:</label>
          <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} />
        </div>
        </div>

        <div className="sup-stats-grid">
          <div className="sup-stat-card">
            <div className="sup-stat-number">LKR {totalFertilizerPrice.toLocaleString()}</div>
            <div className="sup-stat-label">Total Fertilizer Cost</div>
          </div>
          <div className="sup-stat-card">
            <div className="sup-stat-number">LKR {totalSpicePrice.toLocaleString()}</div>
            <div className="sup-stat-label">Total Supplier Payment</div>
          </div>
          <div className="sup-stat-card">
            <div className="sup-stat-number">LKR {(totalFertilizerPrice+totalSpicePrice).toLocaleString()}</div>
            <div className="sup-stat-label">Combined Total</div>
          </div>
        </div>

        <div className="sup-table-container">
          <h2>Fertilizer Payments</h2>
          <table className="sup-table">
            <thead>
              <tr>
                <th>Fertilizer Name</th>
                <th>Type</th>
                <th>Quantity (kg)</th>
                <th>Price per 1kg (LKR)</th>
                <th>Total (LKR)</th>
              </tr>
            </thead>
            <tbody>
              {fertilizers.filter(f=>f.date?.split("T")[0]===selectedDate).map((f,i)=>(
                <tr key={i}>
                  <td>{f.fertilizerName}</td>
                  <td>{f.fType}</td>
                  <td>{f.quantity}</td>
                  <td>{f.price}</td>
                  <td>{(f.quantity*f.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sup-table-container" style={{marginTop:"30px"}}>
          <h2>Spice Payment Totals by Type</h2>
          <table className="sup-table">
            <thead>
              <tr>
                <th>Spice Type</th>
                <th>Supplier Count</th>
                <th>Total Payment (LKR)</th>
              </tr>
            </thead>
            <tbody>
              {spiceTotals.length>0 ? spiceTotals.map((s,i)=>(
                <tr key={i}>
                  <td><strong>{s.spiceName}</strong></td>
                  <td>{s.supplierCount} suppliers</td>
                  <td><strong>LKR {s.totalValue.toLocaleString()}</strong></td>
                </tr>
              )) : <tr><td colSpan="3" className="sup-no-data">No spice data available</td></tr>}
              {spiceTotals.length>0 && <tr style={{backgroundColor:"#fff5e9",fontWeight:"bold"}}>
                <td>TOTAL</td>
                <td>{spiceTotals.reduce((sum,s)=>sum+s.supplierCount,0)} suppliers</td>
                <td><strong>LKR {spiceTotals.reduce((sum,s)=>sum+s.totalValue,0).toLocaleString()}</strong></td>
              </tr>}
            </tbody>
          </table>
        </div>

        <button className="sup-btn sup-btn-secondary" onClick={handleDownloadPdf} >
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default Payment;
