 import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Stock.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import NavSup from "../NavSup/NavSup";

function Stock() {
  const [suppliers, setSuppliers] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const canvasRef = useRef(null);

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

  // Filter + group data
  useEffect(() => {
    if (!selectedDate || suppliers.length === 0) {
      setStockData([]);
      return;
    }

    const filtered = suppliers.filter(
      (s) => s.date?.split("T")[0] === selectedDate
    );

    const grouped = filtered.reduce((acc, supplier) => {
      const spice = supplier.spicename || "Unknown";
      const qty = supplier.qty || 0;
      acc[spice] = (acc[spice] || 0) + qty;
      return acc;
    }, {});

    const stockArray = Object.entries(grouped).map(([spice, total]) => ({
      spice,
      total,
    }));

    stockArray.sort((a, b) => b.total - a.total);
    setStockData(stockArray);
  }, [selectedDate, suppliers]);

  // Draw bar chart
  useEffect(() => {
    if (stockData.length > 0 && canvasRef.current) {
      drawBarChart();
    } else if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [stockData]);

  const drawBarChart = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const maxValue = Math.max(...stockData.map((item) => item.total), 1);
    const barWidth = chartWidth / stockData.length - 10;
    const colors = [
      "#4CAF50",
      "#8BC34A",
      "#FFC107",
      "#FF5722",
      "#009688",
      "#795548",
      "#9C27B0",
      "#03A9F4",
    ];

    stockData.forEach((item, index) => {
      const barHeight = (item.total / maxValue) * chartHeight;
      const x = padding + index * (barWidth + 10);
      const y = padding + chartHeight - barHeight;

      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = "#333";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${item.total}kg`, x + barWidth / 2, y - 5);

      ctx.save();
      ctx.translate(x + barWidth / 2, padding + chartHeight + 15);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = "right";
      ctx.fillText(item.spice, 0, 0);
      ctx.restore();
    });

    // Axes
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();

    // Y-axis label
    ctx.save();
    ctx.translate(20, padding + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#333";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Quantity (kg)", 0, 0);
    ctx.restore();
  };

  // PDF Download
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.text(`Spice Stock Report - ${selectedDate}`, 14, 15);

    const tableColumn = ["Spice Type", "Total Quantity (kg)"];
    const tableRows = stockData.map((item) => [item.spice, item.total]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });

    doc.save(`Spice_Stock_Report_${selectedDate}.pdf`);
  };

  return (
    <div className="sup-page">
      <NavSup />


      <div className="sup-stock-container">
        <div className="sup-header">
          <h1>Stock Information</h1>
          <p>Select a date to view spice stock totals</p>
        

        <div className="sup-date-picker">
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
         </div>

        <div className="sup-card">
          <div className="sup-card-header">
            <h2>Spice Stock Summary</h2>
          </div>
          <table className="sup-stock-table">
            <thead>
              <tr>
                <th>Spice Type</th>
                <th>Total Quantity (kg)</th>
              </tr>
            </thead>
            <tbody>
              {stockData.length > 0 ? (
                stockData.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.spice}</td>
                    <td>{item.total}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No stock data available for selected date</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="sup-card">
          <div className="sup-card-header">
            <h2>Spice Stock Bar Chart</h2>
          </div>
          <div className="sup-chart-container">
            {stockData.length > 0 ? (
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="sup-chart-canvas"
              />
            ) : (
              <div className="sup-no-data">No data available for chart</div>
            )}
          </div>
        </div>

        <button
          className="sup-btn"
          onClick={handleDownloadPdf}
          disabled={!selectedDate || stockData.length === 0}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default Stock;
