import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import './NavSup.css';
import { FaSignOutAlt } from "react-icons/fa";

function NavSup() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Example menu items
  const menuItems = [
    { path: "/newhome", label: "Home", icon: "🏠" },
    { path: "/Supdet", label: "Suppliers", icon: "👤" },
    { path: "/fertilizers", label: "Fertilizers", icon: "🌱" },
    { path: "/payments", label: "Payments", icon: "💰" },
    { path: "/stock", label: "Stock", icon: "📦" },
    { path: "/pdfdownloadsp", label: "Reviews", icon: "📦" },
    
  ];

  return (
    <div className={`navsup-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Collapse toggle */}
      <button
        className="navsup-collapse-toggle"
        onClick={() => setCollapsed((v) => !v)}
        aria-label="Toggle sidebar"
      >
        {collapsed ? "›" : "‹"}
      </button>

      {/* App name */}
      <div className="navsup-company-name">
        <h2>🌿 Epic Green</h2>
      </div>

      {/* Profile section */}
      <div className="navsup-profile-section">
        <img
          src="https://via.placeholder.com/150"
          alt="Profile"
          className="navsup-profile-pic"
        />
        <h3 className="navsup-profile-name">Nadun Ranasinghe</h3>
        <p className="navsup-profile-role">Supplier Coordinator</p>
      </div>

      <hr className="navsup-divider" />

      {/* Navigation Menu */}
      <ul className="navsup-menu">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={location.pathname === item.path ? "active" : ""}
          >
            <Link to={item.path}>
              <span className="navsup-icon">{item.icon}</span>
              <span className="navsup-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <hr className="navsup-divider" />

      {/* Logout */}
      <div className="navsup-logout">
        <Link to="/logout">
          <span className="navsup-icon"><FaSignOutAlt /></span>
          <span className="navsup-label">Logout</span>
        </Link>
      </div>
    </div>
  );
}

export default NavSup;

