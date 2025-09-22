 import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import NavInv from "../NavInv/NavInv";
import "./plantationproducts.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function PlantationProducts() {
  const [products, setProducts] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overallPercentage, setOverallPercentage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await axios.get("http://localhost:5000/spices/source/Plantation");
        setProducts(productsRes.data.spices);

        const chartRes = await axios.get("http://localhost:5000/spices/chart-data/Plantation");
        const overallRes = await axios.get("http://localhost:5000/spices/overall-distribution/Plantation");

        const { totalQuantityForSource, overallTotalQuantity } = overallRes.data;
        const percentage = overallTotalQuantity > 0 ? (totalQuantityForSource / overallTotalQuantity) * 100 : 0;
        setOverallPercentage(percentage);

        setChartData({
          labels: ["Plantation Spices", "Other Spices"],
          datasets: [{
            data: [percentage, 100 - percentage],
            backgroundColor: ["#a16c3e", "#f2e5d3"],
            hoverBackgroundColor: ["#b27a48", "#e6d6c1"],
          }],
        });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch plantation data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="inv-container">Loading plantation products...</div>;
  if (error) return <div className="inv-container inv-error">{error}</div>;

  return (
    <div className="inv-layout">
      <NavInv />
      <div className="inv-main-content">
        <h1 className="inv-title">Plantation Products</h1>

        <div className="inv-content">
          {/* Product List */}
          <div className="inv-list">
            <h2>Product List</h2>
            {products.length > 0 ? (
              <div className="inv-table-container">
                <table className="inv-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Quality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id}>
                        <td>{p.source}</td>
                        <td>{p.name}</td>
                        <td>{p.currentStock}</td>
                        <td>{p.unit}</td>
                        <td>{p.quality}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No plantation products found.</p>
            )}
          </div>

          {/* Chart */}
          <div className="inv-chart">
            <h2>Plantation's Share of Total Stock: {overallPercentage.toFixed(2)}%</h2>
            {chartData.labels.length > 0 ? <Pie data={chartData} /> : <p>No chart data available.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlantationProducts;
