// Components/Nav/Nav.js
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import './nav.css';
import { FaHome, FaUsers, FaUserTie, FaClock, FaTable, FaBars, FaMoneyBillWave, FaSignOutAlt, FaUser } from "react-icons/fa";

function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => JSON.parse(localStorage.getItem("sidebar-collapsed")) || false);
  const [staffName, setStaffName] = useState("");
  
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    // Get staff name from localStorage
    const name = localStorage.getItem("staffName");
    if (name) {
      setStaffName(name);
    }
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(!prev));
      return !prev;
    });
  };

  const handleLogout = () => {
  // Clear all staff-related data from localStorage
  localStorage.removeItem("staffToken");
  localStorage.removeItem("staffType");
  localStorage.removeItem("staffName");
  localStorage.removeItem("staffId");
  localStorage.removeItem("staffEmail");

  // Navigate to login and force page reload
  navigate("/staff-login", { replace: true });
  
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
      
      {/* User Info Section */}
      {!collapsed && staffName && (
        <div className="nav-user-info">
          <FaUser className="user-icon" />
          <span className="user-name">{staffName}</span>
        </div>
      )}
      
      <ul className="nav-sidebar-links">
        {links.map((link) => (
          <li key={link.path} className={isActive(link.path) ? "active" : ""}>
            <Link to={link.path}>
              <span className="nav-icon">{link.icon}</span>
              {!collapsed && <span className="nav-label">{link.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
      
      {/* Logout Button */}
      <div className="nav-logout">
        <button onClick={handleLogout} className="logout-btn">
          <span className="nav-icon"><FaSignOutAlt /></span>
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Nav;