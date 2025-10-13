// Components/Nav/Nav.js
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import './nav.css';
import { FaHome, FaUsers, FaUserTie, FaClock, FaTable, FaBars, FaMoneyBillWave, FaSignOutAlt, FaUser, FaComment } from "react-icons/fa";

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



  const links = [
    { path: "/Home", label: "Home", icon: <FaHome /> },
    { path: "/mainFWorker", label: "Field Workers", icon: <FaUsers /> },
    { path: "/staffManagement", label: "Staff", icon: <FaUserTie /> },
    { path: "/attendanceScanner", label: "Attendance Scanner", icon: <FaClock /> },
    { path: "/attendanceTable", label: "Attendance Table", icon: <FaTable /> },
    { path: "/paymentPage", label: "Payments", icon: <FaMoneyBillWave /> },
    { path: "/ViewContactUsMessage", label: "Feedbacks", icon: <FaComment /> },
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