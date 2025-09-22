// Success.js
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Success.css';

export default function Success() {
  const navigate = useNavigate(); // Reserved for future use
  const [orderDetails, setOrderDetails] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      // Get order ID from the URL search parameters
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('order_id');
      const token = localStorage.getItem('token');

      // Clear localStorage item to prevent issues on manual refresh
      localStorage.removeItem('currentOrderId');

      if (!orderId || !token) {
        setError('No order ID or token found. Cannot display receipt.');
        setLoading(false);
        return;
      }

      try {
        // Fetch the specific order details using the ID from the URL
        const orderResponse = await axios.get(
          `http://localhost:5000/api/orders/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch customer details
        const customerResponse = await axios.get(
          'http://localhost:5000/user-details',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setOrderDetails(orderResponse.data.order);
        setCustomerDetails(customerResponse.data.user);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please check your dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [navigate]);

  if (loading) {
    return <div className="loading-container">Loading receipt...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!orderDetails || !customerDetails) {
    return <div className="no-order-container">No order details available.</div>;
  }

  return (
    <div className="success-container">
      <h1 className="success-title">Payment Successful!</h1>
      <p className="success-message">Your order has been placed successfully.</p>

      <hr className="success-divider" />

      <div className="order-section">
        <h2 className="section-title">Order Confirmation</h2>
        <p className="order-detail">
          <strong>Order ID:</strong> {orderDetails._id}
        </p>
        <p className="order-detail">
          <strong>Order Date:</strong>{' '}
          {new Date(orderDetails.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="customer-section">
        <h2 className="section-title">Customer Details</h2>
        <p className="customer-detail">
          <strong>Name:</strong> {customerDetails.name}
        </p>
        <p className="customer-detail">
          <strong>Email:</strong> {customerDetails.gmail}
        </p>
        <p className="customer-detail">
          <strong>Phone:</strong> {customerDetails.phone}
        </p>
        <p className="customer-detail">
          <strong>Address:</strong> {customerDetails.address}
        </p>
      </div>

      <div className="spices-section">
        <h2 className="section-title">Spices Ordered</h2>
        <ul className="spices-list">
          {orderDetails.items.map((item) => (
            <li key={item._id} className="spice-item">
              <span className="spice-name">
                {item.spice?.name || 'Unknown'} x {item.quantity}kg
              </span>
              <span className="spice-price">
                Rs.{(item.quantity * item.price).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="total-section">
        <h3 className="total-price">
          <span>Total Price:</span>
          <span>Rs.{orderDetails.totalPrice.toFixed(2)}</span>
        </h3>
      </div>

      <Link to="/customer" className="dashboard-button">
        Go to My Dashboard
      </Link>
    </div>
  );
}
