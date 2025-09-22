import React from 'react';
import './navInv.css';
import { Link } from 'react-router-dom';

function Nav() {
  return (
    <div className="navinv-sidebar">
      <div className="navinv-company-name">
        <h2>🌿 Epic Green</h2>
      </div>
      <div className="navinv-profile-section">
        <img 
          src="/images/manager.jpeg"  
          alt="Profile" 
          className="navinv-profile-pic" 
        />
        <h3 className="navinv-profile-name">Nithya Waidyarathne</h3>
        <p className="navinv-profile-role">Stock Manager</p>
      </div>
      <ul className="navinv-sidebar-links">
        <li>
          <Link to="/HomeN" className="active">
            Dashboard
          </Link>
        </li>
        <li className="navinv-products-dropdown">
          <div className="navinv-dropdown">
            <span>Products</span>
            <div className="navinv-dropdown-content">
              <Link to="/Products/Products">Spices</Link>
              <Link to="/fertilizer">Fertilizer</Link>
            </div>
          </div>
        </li>
        <li className="navinv-stock-dropdown">
          <div className="navinv-dropdown">
            <span>Stock</span>
            <div className="navinv-dropdown-content">
              <Link to="/Stocks/supplier">Supplier</Link>
              <Link to="/Stocks/plantation">Plantation</Link>
              <Link to="/Stocks/order">Order</Link>
            </div>
          </div>
          
        </li>
      </ul>
    </div>
  );
}

export default Nav;
