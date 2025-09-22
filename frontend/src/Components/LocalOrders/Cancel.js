// src/components/Cancel.js
import React from 'react';
import { Link } from 'react-router-dom';

function Cancel() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Payment Canceled</h1>
      <p>Your payment was not completed. You can try again or contact support.</p>
      <Link to="/local-orders">Go back to your cart</Link>
    </div>
  );
}

export default Cancel;