import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import NavInv from "../NavInv/NavInv";
import './order.css';
import { FaSync } from 'react-icons/fa';

const API_URL = "http://localhost:5000/spices/with-details";

function Order() {
  const [spices, setSpices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchSpicesWithDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      const aggregatedSpices = response.data.reduce((acc, spice) => {
        const existingSpice = acc.find(item => item.name === spice.name);
        if (existingSpice) {
          existingSpice.currentStock += spice.currentStock;
          if (!existingSpice.price || existingSpice.price === 0) {
            existingSpice.price = spice.price;
          }
        } else {
          acc.push({ ...spice });
        }
        return acc;
      }, []);

      setSpices(aggregatedSpices);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching spices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSpicesWithDetails();
    
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(fetchSpicesWithDetails, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchSpicesWithDetails]);

  return (
    <div className="inv-layout">
      <NavInv />
      <main className="inv-main-content">
        <div className="inv-header">
          <div>
            <h1>Order Spices</h1>
            <p>Manage and place orders for your spice inventory</p>
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
              <button 
                onClick={fetchSpicesWithDetails} 
                className="refresh-button"
                disabled={loading}
                title="Refresh stock levels"
              >
                <FaSync className={loading ? 'spinning' : ''} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {loading && <p className="inv-info">Loading spices...</p>}
        {error && <p className="inv-error">Error: {error.message}</p>}

        {!loading && !error && spices.length > 0 && (
          <div className="inv-table-container">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Current Stock (kg)</th>
                  <th>No. of 100g Packets</th>
                  <th>Unit Price (Rs.)</th>
                  <th>Total Price (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {spices.map(spice => {
                  const numberOfPackets = spice.currentStock * 10;
                  const unitPrice = spice.price + 10;
                  const totalPrice = numberOfPackets * unitPrice;
                  return (
                    <tr key={spice._id}>
                      <td>{spice.name}</td>
                      <td>{spice.currentStock.toFixed(2)} kg</td>
                      <td>{numberOfPackets}</td>
                      <td>{unitPrice.toFixed(2)}</td>
                      <td>{totalPrice.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && spices.length === 0 && (
          <p className="inv-info">No spices available for order.</p>
        )}
      </main>
    </div>
  );
}

export default Order;

