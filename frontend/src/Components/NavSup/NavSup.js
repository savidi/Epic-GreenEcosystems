import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavSup.css";
import {
  FaHome,
  FaUsers,
  FaLeaf,
  FaMoneyBillWave,
  FaBox,
  FaStar,
  FaBars,
  FaSignOutAlt,
} from "react-icons/fa";

function NavSup() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(
    () => JSON.parse(localStorage.getItem("supnav-collapsed")) || false
  );

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      localStorage.setItem("supnav-collapsed", JSON.stringify(!prev));
      return !prev;
    });
  };

  const links = [
    { path: "/newhome", label: "Home", icon: <FaHome /> },
    { path: "/Supdet", label: "Suppliers", icon: <FaUsers /> },
    { path: "/fertilizers", label: "Fertilizers", icon: <FaLeaf /> },
    { path: "/payments", label: "Payments", icon: <FaMoneyBillWave /> },
    { path: "/stock", label: "Stock", icon: <FaBox /> },
    { path: "/pdfdownloadsp", label: "Reviews", icon: <FaStar /> },
  ];

  return (
    <aside className={`supnav-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="supnav-sidebar-header">
        {!collapsed && <h2>Supplier Panel</h2>}
        <button className="supnav-toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>

      {/* Profile */}
       
      {/* Links */}
      <ul className="supnav-links">
        {links.map((link) => (
          <li key={link.path} className={isActive(link.path) ? "active" : ""}>
            <Link to={link.path}>
              <span className="supnav-icon">{link.icon}</span>
              {!collapsed && <span className="supnav-label">{link.label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout */}
      <div className="supnav-logout">
        <Link to="/logout">
          <span className="supnav-icon">
            <FaSignOutAlt />
          </span>
          {!collapsed && <span className="supnav-label">Logout</span>}
        </Link>
      </div>
    </aside>
  );
}

export default NavSup;
