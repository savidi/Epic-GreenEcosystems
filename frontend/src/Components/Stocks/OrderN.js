import React, { useEffect, useState } from "react";
import axios from "axios";
import NavInv from "../NavInv/NavInv";
import './order.css'; // Assuming you'll create an order.css for styling

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
            // Update price only if the existing price is invalid or the new price is valid
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

  if (loading) {
    return (
      <div className="stocks-order-page-container">
        <NavInv />
        <h1>Order Spices</h1>
        <p>Loading spices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stocks-order-page-container">
        <NavInv />
        <h1>Order Spices</h1>
        <p>Error loading spices: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="stocks-order-page-container">
      <NavInv />
      <h1>Order Spices</h1>

      {spices.length > 0 ? (
        <table className="stocks-order-spices-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Current Stock (kg)</th>
              <th>No. of 100g Packets</th>
              <th>Unit Price</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {spices.map((spice) => {
              const numberOf100gPackets = spice.currentStock * 10;
              const unitPrice = spice.price + 10;
              const wholePrice = numberOf100gPackets * unitPrice; // Calculate whole price
              return (
                <tr key={spice._id}>
                  <td>{spice.name}</td>
                  <td>{spice.currentStock} kg</td>
                  <td>{numberOf100gPackets}</td>
                  <td>Rs. {unitPrice.toFixed(2)}</td>
                  <td>Rs. {wholePrice.toFixed(2)}</td> {/* Display whole price */}
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No spices available for order.</p>
      )}
    </div>
  );
}

export default Order;

