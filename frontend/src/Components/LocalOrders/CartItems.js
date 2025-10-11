import React, { useState, useEffect } from 'react';
import Nav from '../NavCus/NavCus';
import Footer from '../Footer/Footer';
import './OrderView.css';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

// Initialize stripePromise once at the top of the file
const stripePromise = loadStripe('pk_test_51SGyvqPWOvica3UhurJIwVZp7ycGf9LwMkMeNAv55uaSzAobYFzIoTy9yZrKxCWvrAyfMlYJvkMLsjenCkli8pBS003qDTE5zT');

function CartItems() {
  const [cart, setCart] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(true);

 const fetchCartData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const orderResponse = await axios.get('http://localhost:5000/api/orders/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const fetchedOrder = orderResponse.data.order;
      // Add a check to ensure the fetched order is a Local order
      if (fetchedOrder && fetchedOrder.orderType === 'Local') {
          setCart(fetchedOrder);
      } else {
          setCart(null); // If it's not a local order, treat the cart as empty
      }
      
      const userResponse = await axios.get('http://localhost:5000/user-details', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomerDetails(userResponse.data.user);

    } catch (error) {
      console.error("Error fetching cart data:", error);
      if (error.response && error.response.status === 404) {
        setCart(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const handleDeleteOrder = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!cart) return;

        await axios.delete(`http://localhost:5000/api/orders/${cart._id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        setCart(null); 
        alert('Order deleted successfully!');
    } catch (error) {
        console.error("Error deleting order:", error.response ? error.response.data : error.message);
        alert('Failed to delete order. Please check the console for details.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (cart.items.length === 1) {
      handleDeleteOrder();
    } else {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`http://localhost:5000/api/orders/${cart._id}/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setCart(response.data.order);
        alert('Item deleted successfully!');
      } catch (error) {
        console.error("Error deleting item:", error.response ? error.response.data : error.message);
        alert('Failed to delete item. Please check the console for details.');
      }
    }
  };

  const handlePayNow = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!cart || cart.items.length === 0) {
        alert('Cart is empty. Please add items to proceed with payment.');
        return;
      }

      localStorage.setItem('currentOrderId', cart._id); 
      
      // Use the pre-initialized stripePromise variable
      const stripe = await stripePromise;

      const response = await axios.post(
        'http://localhost:5000/api/payments/create-checkout-session', 
        { orderId: cart._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { id: sessionId } = response.data;
      
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe redirect error:', error);
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during payment process:', error.response ? error.response.data : error.message);
      alert('Failed to initiate payment. Please check the console for details.');
    }
  };
  
  if (loading) {
    return <div>Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Nav />
        <div className="cart-details-section empty-cart-message">
          <h2>Your Cart is Empty</h2>
          <p>Please go back to the products page to add items.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="cart-details-section">
        <h2 style={{textAlign: 'center'}}>Add to Cart Items</h2>
        <div className="cart-item-list">
          {cart.items.map((item) => (
            <div key={item._id} className="cart-item">
              <span className="cart-item-name">{item.spice.name}</span>
              <span className="cart-item-quantity">{item.quantity}kg</span>
              <span className="cart-item-price">Rs.{(item.quantity * item.price).toFixed(2)}</span>
              <div className="cart-item-actions">
                <FaTrash className="action-icon delete-icon" onClick={() => handleDeleteItem(item._id)} />
              </div>
            </div>
          ))}
        </div>
        <div className="cart-total">
          <h3>Total: Rs.{cart.totalPrice.toFixed(2)}</h3>
        </div>
        
        {customerDetails && (
          <div className="customer-details-section">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> {customerDetails.name}</p>
            <p><strong>Email:</strong> {customerDetails.gmail}</p>
            <p><strong>Phone:</strong> {customerDetails.phone}</p>
            <p><strong>Address:</strong> {customerDetails.address}</p>
          </div>
        )}
        <button className="pay-button" onClick={handlePayNow}>Pay Now</button>
      </div>
      <Footer />
    </>
  );
}

export default CartItems;