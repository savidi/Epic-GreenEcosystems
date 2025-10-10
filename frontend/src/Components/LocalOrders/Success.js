// Success.js
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf'; // Import jsPDF
import html2canvas from 'html2canvas'; // Import html2canvas
import './Success.css';

export default function Success() {
  const navigate = useNavigate(); // Reserved for future use
  const [orderDetails, setOrderDetails] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // FIX: Declare the state for email sending to resolve the no-undef error
  const [isEmailSending, setIsEmailSending] = useState(false); 

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

  // Helper function to generate PDF data (reused by both download and email)
  const generatePdfBase64 = async () => {
    const input = document.getElementById('receipt-content');
    if (!input) {
      throw new Error("Receipt content element not found.");
    }

    // Temporary adjustments for capture
    const originalWidth = input.style.width;
    input.style.width = '550px'; 
    const buttons = document.querySelectorAll('.action-button-group');
    buttons.forEach(btn => btn.style.display = 'none');

    try {
      const canvas = await html2canvas(input, { scale: 2, logging: true, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4'); 
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = canvas.height * pdfWidth / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Handle multi-page content
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
        if (heightLeft > 0) {
          pdf.addPage();
        }
      }
      
      // Return the Base64 data string (remove the initial 'data:application/pdf;base64,' part)
      return pdf.output('datauristring').split(',')[1];
    } finally {
      // Restore original state
      input.style.width = originalWidth;
      buttons.forEach(btn => btn.style.display = 'block');
    }
  };

  // Function to handle PDF download
  const handleDownloadReceipt = async () => {
    try {
      const pdfBase64 = await generatePdfBase64();
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = `Receipt_Order_${orderDetails._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert('Failed to generate PDF receipt for download.');
    }
  };

  // Function to handle emailing the receipt
  const handleEmailReceipt = async () => {
    if (isEmailSending) return;

    setIsEmailSending(true);
    try {
      // 1. Generate PDF content
      const pdfBase64 = await generatePdfBase64();

      // 2. Send PDF content to the backend
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/payments/send-receipt-email',
        {
          orderId: orderDetails._id,
          customerEmail: customerDetails.gmail,
          pdfBase64: pdfBase64,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const message = response.data.sentToTest
        ? `Success! Email was sent to the test recipient (${response.data.message.split('to ')[1]}). Check your test inbox.`
        : response.data.message;
      
      alert(message);
    } catch (err) {
      console.error('Error sending email:', err);
      alert('Failed to send email. Please check server logs.');
    } finally {
      setIsEmailSending(false);
    }
  };

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
      {/* Content to be included in the PDF is wrapped in this div */}
      <div id="receipt-content">
        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-message">Your order has been placed successfully.</p>
        {/* ... (rest of the receipt details remain the same) ... */}
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
      </div>
      
      {/* Buttons for actions */}
      <div className="action-button-group">
        <Link to="/customer" className="dashboard-button action-button">
          Go to My Dashboard
        </Link>
        <button onClick={handleDownloadReceipt} className="download-button action-button" disabled={isEmailSending}>
          Download Receipt
        </button>
        <button onClick={handleEmailReceipt} className="email-button action-button" disabled={isEmailSending}>
          {isEmailSending ? 'Sending...' : 'Email the Receipt'}
        </button>
      </div>
    </div>
  );
}