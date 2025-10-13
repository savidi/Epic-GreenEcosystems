import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  FaUser,
  FaComment,
} from "react-icons/fa";

function NavSup() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => JSON.parse(localStorage.getItem("supnav-collapsed")) || false
  );
  const [supplierName, setSupplierName] = useState("");

  // ✅ Load supplier name from localStorage
  useEffect(() => {
    const name = localStorage.getItem("staffName") || localStorage.getItem("supplierName");
    if (name) setSupplierName(name);
  }, []);

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      localStorage.setItem("supnav-collapsed", JSON.stringify(!prev));
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
    { path: "/newhome", label: "Home", icon: <FaHome /> },
    { path: "/Supdet", label: "Suppliers", icon: <FaUsers /> },
    { path: "/fertilizers", label: "Fertilizers", icon: <FaLeaf /> },
    { path: "/payments", label: "Payments", icon: <FaMoneyBillWave /> },
    { path: "/stock", label: "Stock", icon: <FaBox /> },
    { path: "/pdfdownloadsp", label: "Reviews", icon: <FaStar /> },
    { path: "/notification", label: "Low Stocks", icon: <FaComment /> },
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

export default NavSup;
