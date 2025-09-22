 import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import NavInv from "../NavInv/NavInv";
import "./supplierproducts.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function SupplierProducts() {
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overallPercentage, setOverallPercentage] = useState(0);

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        const productsResponse = await axios.get("http://localhost:5000/spices/source/Supplier");
        setSupplierProducts(productsResponse.data.spices);

        const overallResponse = await axios.get("http://localhost:5000/spices/overall-distribution/Supplier");
        const { totalQuantityForSource, overallTotalQuantity } = overallResponse.data;

        let percentage = 0;
        if (overallTotalQuantity > 0) {
          percentage = (totalQuantityForSource / overallTotalQuantity) * 100;
        }
        setOverallPercentage(percentage);

        setChartData({
          labels: ["Supplier Spices", "Other Spices"],
          datasets: [
            {
              data: [percentage, 100 - percentage],
              backgroundColor: ["#8B4513", "#f0f0f0"],
              hoverBackgroundColor: ["#6B3410", "#e0e0e0"],
              borderWidth: 2,
              borderColor: ["#fff", "#fff"],
            },
          ],
        });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch supplier data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, []);

  // Chart options for better display
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value.toFixed(1)}%`;
          }
        }
      }
    }
  };

  if (loading) return <div className="inv-container">Loading supplier products...</div>;
  if (error) return <div className="inv-container inv-error">{error}</div>;

  return (
    <div className="inv-layout">
      <NavInv />
      <div className="inv-main-content">
        <h1 className="inv-title">Supplier Products</h1>

        <div className="inv-content">
          {/* Table Section - Left Column */}
          <div className="inv-table-section">
            <h2>Product List</h2>
            {supplierProducts.length > 0 ? (
              <div className="inv-table-container">
                <table className="inv-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Quality</th>
                      <th>Supplier Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierProducts.map((product) => (
                      <tr key={product._id} className="inv-row">
                        <td>{product.source}</td>
                        <td>{product.name}</td>
                        <td>{product.currentStock}</td>
                        <td>{product.unit}</td>
                        <td>{product.quality}</td>
                        <td>Rs. {(product.price ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="inv-no-data">No supplier products found.</p>
            )}
          </div>

          {/* Chart Section - Right Column */}
          <div className="inv-chart-section">
            <h2>Supplier's Share of Total Stock: {overallPercentage.toFixed(2)}%</h2>
            <div className="inv-chart-container">
              {chartData.labels.length > 0 ? (
                <Pie data={chartData} options={chartOptions} />
              ) : (
                <p>No chart data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupplierProducts;

