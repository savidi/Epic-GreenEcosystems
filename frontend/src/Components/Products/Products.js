


import React, { useState, useEffect } from "react";
import axios from "axios";
import NavInv from "../NavInv/NavInv";
import Addspice from "./Addspice";
import Addproduct from "./Addproduct";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './products.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [totals, setTotals] = useState([]); // For the total quantities table
  const [overallChartData, setOverallChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term
  const [filteredSpices, setFilteredSpices] = useState([]); // New state for filtered spices
  const [selectedSpiceDetails, setSelectedSpiceDetails] = useState(null); // New state for selected spice details
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const reportRef = React.useRef(); // Ref for the report container

  const generatePdfReport = async () => {
    const input = reportRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add current date
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    pdf.setFontSize(10);
    pdf.text(`Report Generated: ${dateString}`, 10, 10);

    // Calculate overall total stock
    const overallTotalStock = totals.reduce((sum, item) => sum + item.totalQuantity, 0);
    pdf.text(`Overall Total Stock: ${overallTotalStock} kg`, 10, 15); // Display overall total stock

    position = 25; // Adjust position for content below date and total stock

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight; // Correctly position content for new page
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('spice_stock_report.pdf');
  };

  useEffect(() => {
    const fetchProductsAndDetails = async () => {
      try {
        // Fetch all spices
        const spicesResponse = await axios.get(URL);
        const fetchedSpices = Array.isArray(spicesResponse.data) ? spicesResponse.data : (spicesResponse.data && Array.isArray(spicesResponse.data.spices) ? spicesResponse.data.spices : []);
        setSpices(fetchedSpices);

        // Fetch grid details for images and descriptions
        const gridsResponse = await axios.get("http://localhost:5000/grids");
        const fetchedGrids = gridsResponse.data; 

        // Filter spices based on searchTerm
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const currentFilteredSpices = fetchedSpices.filter(spice => 
          spice.name.toLowerCase().includes(lowerCaseSearchTerm)
        );
        setFilteredSpices(currentFilteredSpices);

        // Set selectedSpiceDetails if a search term is present and there's at least one filtered spice
        if (lowerCaseSearchTerm && currentFilteredSpices.length > 0) {
          const matchedSpice = currentFilteredSpices[0]; // Display details of the first matched spice
          const gridDetail = fetchedGrids.find(grid => grid.name.toLowerCase() === matchedSpice.name.toLowerCase());
          setSelectedSpiceDetails({
            ...matchedSpice,
            description: gridDetail ? gridDetail.description : "No description available.",
            image: gridDetail ? gridDetail.image : ""
          });
        } else {
          setSelectedSpiceDetails(null);
        }

        // Fetch total quantities and prepare chart data
        const totalsResponse = await axios.get("http://localhost:5000/spices/totals");
        setTotals(totalsResponse.data);
        const chartLabels = totalsResponse.data.map(item => item.spice);
        const chartValues = totalsResponse.data.map(item => item.totalQuantity);

        setOverallChartData({
          labels: chartLabels,
          datasets: [
            {
              data: chartValues,
              backgroundColor: [
                "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"
              ],
              hoverBackgroundColor: [
                "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"
              ],
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchProductsAndDetails();
  }, [updateTrigger, searchTerm]);

  const handleSpiceAdded = () => setUpdateTrigger((prev) => prev + 1);

  const handleDelete = (id) => {
    setSpices((prev) =>
      prev.filter((spice) => spice._id.toString() !== id.toString())
    );
    setUpdateTrigger((prev) => prev + 1); // Trigger re-fetch for chart and totals
  };


   const exportToCSV = () => {
        // Ensure spices is an array before processing
        if (!Array.isArray(spices)) {
            alert('No data available to export');
            return;
        }

        const csvContent = [
            ['Name', 'Source', 'Stock', 'Unit', 'Quality', 'Price'].join(','),
            ...spices.map(spice => [
                spice.name || '',
                spice.source || '',
                spice.currentStock || 0,
                spice.unit || '',
                spice.quality || '',
                spice.price || 0
            ].join(','))
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
    <div className="prod-page-main-container">
      <NavInv />
      <Addspice onSpiceAdded={handleSpiceAdded} />

      <div className="prod-search-container">
        <input
          type="text"
          placeholder="Search by spice name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="prod-search-input"
        />
      </div>

      <div className="prod-main-content">
        <div className="prod-main-table-section">
           <button className="prod-export-btn" onClick={exportToCSV}>
                            📊 Export Data
                        </button>
          <h1>Stock Inventory</h1>
          {selectedSpiceDetails && (
            <div className="prod-selected-spice-details">
              <h2>{selectedSpiceDetails.name}</h2>
              {selectedSpiceDetails.image && (
                <img
                  src={selectedSpiceDetails.image}
                  alt={selectedSpiceDetails.name}
                  className="prod-spice-detail-image"
                />
              )}
              <p>{selectedSpiceDetails.description}</p>
            </div>
          )}

          {(searchTerm ? filteredSpices : spices).length > 0 ? (
            <table border="1" cellPadding="8" className="prod-spices-table">
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
                {(searchTerm ? filteredSpices : spices).map((spice) => (
                  <Addproduct key={spice._id} spice={spice} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          ) : (
            <p>No spices found. Add one above!</p>
          )}
        </div>

        {/* Overall Spice Stock Distribution Section */}
        <div className="prod-overall-spice-distribution-section">
          <h2>Total Spice Stock</h2>
          {/* Report content container */}
          <div ref={reportRef} className="prod-report-content-container">
            <div className="prod-spice-quantities-list">
              {totals.length > 0 ? (
                <table border="1" cellPadding="8" className="prod-totals-table">
                  <thead>
                    <tr>
                      <th>Spice</th>
                      <th>Total Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totals.map((item, index) => (
                      <tr key={index}>
                        <td>{item.spice}</td>
                        <td>{item.totalQuantity}{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No overall spice quantity data available.</p>
              )}
            </div>
            <div className="prod-overall-spice-chart">
              {overallChartData.labels.length > 0 ? (
                <Pie data={overallChartData} />
              ) : (
                <p>No chart data available.</p>
              )}
            </div>
          </div>
          <button onClick={generatePdfReport} className="prod-download-report-button">Download Stock Report (PDF)</button>
        </div>
      </div>
    </div>
  );
}

export default Products;

