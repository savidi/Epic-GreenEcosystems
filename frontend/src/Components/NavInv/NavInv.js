import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBox,
  FaWarehouse,
  FaLeaf,
  FaTractor,
  FaShoppingCart,
  FaBars,
  FaSignOutAlt,
  FaUserCog,
  FaPepperHot,
} from "react-icons/fa";
import "./navInv.css";

function NavInv() {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(
    () => JSON.parse(localStorage.getItem("navinv-collapsed")) || false
  );

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      localStorage.setItem("navinv-collapsed", JSON.stringify(!prev));
      return !prev;
    });
  };

// In your Nav.js - Update the handleLogout function
const handleLogout = () => {
  // Confirm logout
  if (window.confirm('Are you sure you want to logout?')) {
    // Clear all staff-related data from localStorage
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffType");
    localStorage.removeItem("staffName");
    localStorage.removeItem("staffId");
    localStorage.removeItem("staffEmail");
    
    // Redirect to staff login page
    navigate("/staff-login", { replace: true });
    
    // Prevent going back
    window.history.pushState(null, '', '/staff-login');
    window.onpopstate = function() {
      window.history.pushState(null, '', '/staff-login');
    };
  }
};

  return (
    <aside className={`navinv-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Header with toggle */}
      <div className="navinv-header">
        {!collapsed && <h2>🌿 Epic Green</h2>}
        <button className="navinv-toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>

      {/* Profile */}
      {!collapsed && (
        <div className="navinv-profile">
          <img
            src="/images/manager.jpeg"
            alt="Profile"
            className="navinv-profile-pic"
          />
          <h3 className="navinv-profile-name">Nithya Waidyarathne</h3>
          <p className="navinv-profile-role">Stock Manager</p>
        </div>
      )}

      {/* Links */}
      <ul className="navinv-links">
        {/* Dashboard */}
        <li className={isActive("/HomeN") ? "active" : ""}>
          <Link to="/HomeN">
            <span className="navinv-icon">
              <FaHome />
            </span>
            {!collapsed && <span className="navinv-label">Dashboard</span>}
          </Link>
        </li>

        {/* Spices (Replaced the Products dropdown wrapper) */}
        <li className={isActive("/Products/Products") ? "active" : ""}>
          <Link to="/Products/Products">
            <span className="navinv-icon">
              <FaPepperHot />
            </span>
            {!collapsed && <span className="navinv-label">Spices</span>}
          </Link>
        </li>

        {/* Fertilizer (Replaced the Products dropdown wrapper) */}
        <li className={isActive("/fertilizer") ? "active" : ""}>
          <Link to="/fertilizer">
            <span className="navinv-icon">
              <FaTractor />
            </span>
            {!collapsed && <span className="navinv-label">Fertilizer</span>}
          </Link>
        </li>

        {/* Supplier (Replaced the Stock dropdown wrapper, changed icon for clarity) */}
        <li className={isActive("/Stocks/supplier") ? "active" : ""}>
          <Link to="/Stocks/supplier">
            <span className="navinv-icon">
              <FaWarehouse /> 
            </span>
            {!collapsed && <span className="navinv-label">Supplier</span>}
          </Link>
        </li>

        {/* Plantation (Replaced the Stock dropdown wrapper) */}
        <li className={isActive("/Stocks/plantation") ? "active" : ""}>
          <Link to="/Stocks/plantation">
            <span className="navinv-icon">
              <FaLeaf />
            </span>
            {!collapsed && <span className="navinv-label">Plantation</span>}
          </Link>
        </li>

        {/* Order (Replaced the Stock dropdown wrapper) */}
        <li className={isActive("/Stocks/order") ? "active" : ""}>
          <Link to="/Stocks/order">
            <span className="navinv-icon">
              <FaShoppingCart />
            </span>
            {!collapsed && <span className="navinv-label">Order</span>}
          </Link>
        </li>

        {/* Profile (Unchanged, kept for context) */}
        <li className={isActive("/ProfileInv") ? "active" : ""}>
          <Link to="/ProfileInv">
            <span className="navinv-icon">
              <FaUserCog />
            </span>
            {!collapsed && <span className="navinv-label">Profile</span>}
          </Link>
        </li>
      </ul>



      {/* ✅ Logout Button */}
            <div className="supnav-logout">
              <button onClick={handleLogout} className="supnav-logout-btn">
                <span className="supnav-icon">
                  <FaSignOutAlt />
                </span>
                {!collapsed && <span className="supnav-label">Logout</span>}
              </button>
            </div>
    </aside>
  );
}

export default NavInv;
