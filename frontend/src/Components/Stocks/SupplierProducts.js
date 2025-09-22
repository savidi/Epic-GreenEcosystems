import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import "./supplierproducts.css";
import NavInv from "../NavInv/NavInv";

ChartJS.register(ArcElement, Tooltip, Legend);

function SupplierProducts() {
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overallPercentage, setOverallPercentage] = useState(0);

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        // Fetch supplier products (existing logic)
        const productsResponse = await axios.get("http://localhost:5000/spices/source/Supplier");
        setSupplierProducts(productsResponse.data.spices);

        // Fetch chart data for supplier products (existing logic)
        const chartResponse = await axios.get("http://localhost:5000/spices/chart-data/Supplier");
        const data = chartResponse.data;

        // Fetch overall source distribution data (NEW)
        const overallResponse = await axios.get("http://localhost:5000/spices/overall-distribution/Supplier");
        const { totalQuantityForSource, overallTotalQuantity } = overallResponse.data;

        let percentage = 0;
        if (overallTotalQuantity > 0) {
          percentage = (totalQuantityForSource / overallTotalQuantity) * 100;
        }
        setOverallPercentage(percentage);

        // Update chartData for overall percentage
        setChartData({
          labels: ["Supplier Spices", "Other Spices"],
          datasets: [
            {
              data: [percentage, 100 - percentage],
              backgroundColor: [
                "#4CAF50", // Green for supplier spices
                "#DDDDDD", // Grey for other spices
              ],
              hoverBackgroundColor: [
                "#4CAF50",
                "#DDDDDD",
              ],
            },
          ],
        });
      } catch (err) {
        console.error("Error fetching supplier data:", err);
        setError("Failed to fetch supplier data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, []);

  if (loading) {
    return <div className="stocks-supplier-products-container">Loading supplier products...</div>;
  }

  if (error) {
    return <div className="stocks-supplier-products-container stocks-supplier-error">{error}</div>;
  }

  return (
    <div className="stocks-supplier-products-container">
      <NavInv/>
      <h1 className="stocks-supplier-products-title">Supplier Products</h1>

      <div className="stocks-supplier-products-content">
        <div className="stocks-supplier-products-list">
          <h2>Product List</h2>
          {supplierProducts.length > 0 ? (
            <table className="stocks-supplier-products-table">
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
                  <tr key={product._id}>
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
          ) : (
            <p>No supplier products found.</p>
          )}
        </div>

        <div className="stocks-supplier-products-chart">
          <h2>Supplier's Share of Total Stock: {overallPercentage.toFixed(2)}%</h2>
          {chartData.labels.length > 0 ? (
            <Pie data={chartData} />
          ) : (
            <p>No chart data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupplierProducts;
