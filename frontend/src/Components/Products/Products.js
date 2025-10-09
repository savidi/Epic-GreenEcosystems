 import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import NavInv from "../NavInv/NavInv";
import Addspice from "./Addspice";
import Addproduct from "./Addproduct";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import './products.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const URL = "http://localhost:5000/spices";

const fetchHandler = async () => {
  try {
    const res = await axios.get(URL);
    return res.data;
  } catch (error) {
    console.error("Error fetching spices:", error);
    return [];
  }
};

function Products() {
  const [spices, setSpices] = useState([]);
  const [totals, setTotals] = useState([]);
  const [overallChartData, setOverallChartData] = useState({ labels: [], datasets: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpices, setFilteredSpices] = useState([]);
  const [selectedSpiceDetails, setSelectedSpiceDetails] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const reportRef = useRef();

  const generatePdfReport = async () => {
    const input = reportRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    pdf.setFontSize(10);
    pdf.text(`Report Generated: ${dateString}`, 10, 10);
    const overallTotalStock = totals.reduce((sum, item) => sum + item.totalQuantity, 0);
    pdf.text(`Overall Total Stock: ${overallTotalStock} kg`, 10, 15);

    position = 25;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('spice_stock_report.pdf');
  };

  useEffect(() => {
    const fetchProductsAndDetails = async () => {
      try {
        const spicesResponse = await axios.get(URL);
        const fetchedSpices = Array.isArray(spicesResponse.data) ? spicesResponse.data : [];
        setSpices(fetchedSpices);

        const gridsResponse = await axios.get("http://localhost:5000/grids");
        const fetchedGrids = gridsResponse.data;

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const currentFilteredSpices = fetchedSpices.filter(spice =>
          spice.name.toLowerCase().includes(lowerCaseSearchTerm)
        );
        setFilteredSpices(currentFilteredSpices);

        if (lowerCaseSearchTerm && currentFilteredSpices.length > 0) {
          const matchedSpice = currentFilteredSpices[0];
          const gridDetail = fetchedGrids.find(grid => grid.name.toLowerCase() === matchedSpice.name.toLowerCase());
          setSelectedSpiceDetails({
            ...matchedSpice,
            description: gridDetail ? gridDetail.description : "No description available.",
            image: gridDetail ? gridDetail.image : ""
          });
        } else {
          setSelectedSpiceDetails(null);
        }

        const totalsResponse = await axios.get("http://localhost:5000/spices/totals");
        setTotals(totalsResponse.data);

        const chartLabels = totalsResponse.data.map(item => item.spice);
        const chartValues = totalsResponse.data.map(item => item.totalQuantity);
        setOverallChartData({
          labels: chartLabels,
          datasets: [{
            data: chartValues,
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
            hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
          }],
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchProductsAndDetails();
  }, [updateTrigger, searchTerm]);

  const handleSpiceAdded = () => setUpdateTrigger(prev => prev + 1);

  const handleDelete = (id) => {
    setSpices(prev => prev.filter(spice => spice._id.toString() !== id.toString()));
    setUpdateTrigger(prev => prev + 1);
  };

  const exportToCSV = () => {
    if (!Array.isArray(spices)) return;
    const csvContent = [
      ['Name', 'Source', 'Stock', 'Unit', 'Quality', 'Price'].join(','),
      ...spices.map(spice => [spice.name || '', spice.source || '', spice.currentStock || 0, spice.unit || '', spice.quality || '', spice.price || 0].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spices-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="inv-layout">
      <NavInv />
      <Addspice onSpiceAdded={handleSpiceAdded} />

      <div className="inv-search-container">
        <input
          type="text"
          placeholder="Search by spice name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="inv-search-input"
        />
      </div>

      <div className="inv-main-content">
        <div className="inv-table-section">
          <button className="inv-export-btn" onClick={exportToCSV}>📊 Export Data</button>
          <h1>Stock Inventory</h1>

          {selectedSpiceDetails && (
            <div className="inv-selected-spice-details">
              <h2>{selectedSpiceDetails.name}</h2>
              {selectedSpiceDetails.image && <img src={selectedSpiceDetails.image} alt={selectedSpiceDetails.name} className="inv-spice-image" />}
              <p>{selectedSpiceDetails.description}</p>
            </div>
          )}

          {(searchTerm ? filteredSpices : spices).length > 0 ? (
            <table className="inv-spices-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Quality</th>
                  <th>Supplier Price(Rs.)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(searchTerm ? filteredSpices : spices).map(spice => (
                  <Addproduct key={spice._id} spice={spice} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          ) : (
            <p className="inv-no-data">No spices found. Add one above!</p>
          )}
        </div>

        <div className="inv-overall-distribution-section">
          <h2>Total Spice Stock</h2>
          <div ref={reportRef} className="inv-report-container">
            <div className="inv-totals-table-container">
              {totals.length > 0 ? (
                <table className="inv-totals-table">
                  <thead>
                    <tr>
                      <th>Spice</th>
                      <th>Total Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totals.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.spice}</td>
                        <td>{item.totalQuantity}{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p>No overall spice quantity data available.</p>}
            </div>
            <div className="inv-chart-container">
              {overallChartData.labels.length > 0 ? <Pie data={overallChartData} /> : <p>No chart data available.</p>}
            </div>
          </div>
          <button onClick={generatePdfReport} className="inv-download-btn">Download Stock Report (PDF)</button>
        </div>
      </div>
    </div>
  );
}

export default Products;

