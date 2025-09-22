import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import "./plantationproducts.css";
import NavInv from "../NavInv/NavInv";

ChartJS.register(ArcElement, Tooltip, Legend);

function PlantationProducts() {
  const [plantationProducts, setPlantationProducts] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overallPercentage, setOverallPercentage] = useState(0);

  useEffect(() => {
    const fetchPlantationData = async () => {
      try {
        
        const productsResponse = await axios.get("http://localhost:5000/spices/source/Plantation");
        setPlantationProducts(productsResponse.data.spices);

        
        const chartResponse = await axios.get("http://localhost:5000/spices/chart-data/Plantation");
        const data = chartResponse.data;

       
        const overallResponse = await axios.get("http://localhost:5000/spices/overall-distribution/Plantation");
        const { totalQuantityForSource, overallTotalQuantity } = overallResponse.data;

        let percentage = 0;
        if (overallTotalQuantity > 0) {
          percentage = (totalQuantityForSource / overallTotalQuantity) * 100;
        }
        setOverallPercentage(percentage);

        
        setChartData({
          labels: ["Plantation Spices", "Other Spices"],
          datasets: [
            {
              data: [percentage, 100 - percentage],
              backgroundColor: [
                "#007BFF", 
                "#DDDDDD",
              ],
              hoverBackgroundColor: [
                "#007BFF",
                "#DDDDDD",
              ],
            },
          ],
        });
      } catch (err) {
        console.error("Error fetching plantation data:", err);
        setError("Failed to fetch plantation data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlantationData();
  }, []);

  if (loading) {
    return <div className="stocks-plantation-products-container">Loading plantation products...</div>;
  }

  if (error) {
    return <div className="stocks-plantation-products-container stocks-plantation-error">{error}</div>;
  }

  return (
    <div className="stocks-plantation-products-container">
      <NavInv/>
      <h1 className="stocks-plantation-products-title">Plantation Products</h1>

      <div className="stocks-plantation-products-content">
        <div className="stocks-plantation-products-list">
          <h2>Product List</h2>
          {plantationProducts.length > 0 ? (
            <table className="stocks-plantation-products-table">
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
                {plantationProducts.map((product) => (
                  <tr key={product._id}>
                    <td>{product.source}</td>
                    <td>{product.name}</td>
                    <td>{product.currentStock}</td>
                    <td>{product.unit}</td>
                    <td>{product.quality}</td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No plantation products found.</p>
          )}
        </div>

        <div className="stocks-plantation-products-chart">
          <h2>Plantation's Share of Total Stock: {overallPercentage.toFixed(2)}%</h2>
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

export default PlantationProducts;
