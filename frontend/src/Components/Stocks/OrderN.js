 import React, { useEffect, useState } from "react";
import axios from "axios";
import NavInv from "../NavInv/NavInv";
import './order.css';

const API_URL = "http://localhost:5000/spices/with-details";

function Order() {
  const [spices, setSpices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSpicesWithDetails = async () => {
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
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpicesWithDetails();
  }, []);

  return (
    <div className="inv-layout">
      <NavInv />
      <main className="inv-main-content">
        <div className="inv-header">
          <h1>Order Spices</h1>
          <p>Manage and place orders for your spice inventory</p>
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

