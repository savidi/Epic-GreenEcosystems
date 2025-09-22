import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import './nav.css';
import { FaHome, FaUsers, FaUserTie, FaClock, FaTable, FaBars, FaMoneyBillWave } from "react-icons/fa";

function Nav() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => JSON.parse(localStorage.getItem("sidebar-collapsed")) || false);
  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(!prev));
      return !prev;
    });
  };

  const links = [
    { path: "/Home", label: "Home", icon: <FaHome /> },
    { path: "/mainFWorker", label: "Field Workers", icon: <FaUsers /> },
    { path: "/staffManagement", label: "Staff", icon: <FaUserTie /> },
    { path: "/attendanceScanner", label: "Attendance Scanner", icon: <FaClock /> },
    { path: "/attendanceTable", label: "Attendance Table", icon: <FaTable /> },
    { path: "/paymentPage", label: "Payments", icon: <FaMoneyBillWave /> },
  ];

  return (
    <aside className={`nav-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="nav-sidebar-header">
        {!collapsed && <h2>Dashboard</h2>}
        <button className="nav-toggle-btn" onClick={toggleSidebar}><FaBars /></button>
      </div>
      <ul className="nav-sidebar-links">
        {links.map((link) => (
          <li key={link.path} className={isActive(link.path) ? "active" : ""}>
            <Link to={link.path}><span className="nav-icon">{link.icon}</span>{!collapsed && <span className="nav-label">{link.label}</span>}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
export default Nav;
