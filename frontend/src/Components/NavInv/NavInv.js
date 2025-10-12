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
} from "react-icons/fa";
// import "./navInv.css";

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
        <li className={isActive("/HomeN") ? "active" : ""}>
          <Link to="/HomeN">
            <span className="navinv-icon">
              <FaHome />
            </span>
            {!collapsed && <span className="navinv-label">Dashboard</span>}
          </Link>
        </li>

        {/* Products */}
        <li className="navinv-dropdown">
          <div className="navinv-dropdown-content">
            <Link to="/Products/Products">
              <span className="navinv-icon">
                <FaLeaf />
              </span>
              {!collapsed && "Spices"}
            </Link>
            <Link to="/fertilizer">
              <span className="navinv-icon">
                <FaTractor />
              </span>
              {!collapsed && "Fertilizer"}
            </Link>
          </div>
        </li>

        {/* Stock */}
        <li className="navinv-dropdown">
          <div className="navinv-dropdown-content">
            <Link to="/Stocks/supplier">
              <span className="navinv-icon">
                <FaBox />
              </span>
              {!collapsed && "Supplier"}
            </Link>
            <Link to="/Stocks/plantation">
              <span className="navinv-icon">
                <FaLeaf />
              </span>
              {!collapsed && "Plantation"}
            </Link>
            <Link to="/Stocks/order">
              <span className="navinv-icon">
                <FaShoppingCart />
              </span>
              {!collapsed && "Order"}
            </Link>
          </div>
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
