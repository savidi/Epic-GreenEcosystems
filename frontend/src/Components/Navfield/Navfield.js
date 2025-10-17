import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import './navfield.css';
import { FaHome, FaLeaf, FaChartBar, FaUserCog, FaBars, FaInstagram, FaFacebook, FaSignOutAlt ,FaBell} from 'react-icons/fa';
import Elogo from '../Images/Elogo.png';

function Nav() {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(
    () => JSON.parse(localStorage.getItem("sidebar-collapsed")) || false
  );

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('sidebarStateChanged', {
        detail: { collapsed: newState }
      }));

      return newState;
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
    { path: "/Dashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/Plant", label: "Plant", icon: <FaLeaf /> },
    { path: "/Report", label: "Report", icon: <FaChartBar /> },
    { path: "/Reminders", label: "Reminders", icon: <FaBell /> },
    { path: "/Account", label: "Account", icon: <FaUserCog /> },
  ];

  const socialLinks = [
    { url: "https://instagram.com", label: "Instagram", icon: <FaInstagram /> },
    { url: "https://facebook.com", label: "Facebook", icon: <FaFacebook /> },
  ];

  return (
    <aside className={`navfield-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="navfield-sidebar-header">
        {!collapsed && <img src={Elogo} alt="EPIC Green Logo" className="navfield-logo" />}
        <button className="navfield-toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>

      <ul className="navfield-sidebar-links">
        {links.map((link) => (
          <li key={link.path} className={isActive(link.path) ? "active" : ""}>
            <Link to={link.path}>
              <span className="navfield-icon">{link.icon}</span>
              {!collapsed && <span className="navfield-label">{link.label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout button */}
      <div className="navfield-sidebar-logout" onClick={handleLogout} style={{ cursor: 'pointer', marginTop: 'auto', padding: '1rem', display: 'flex', alignItems: 'center' }}>
        <FaSignOutAlt style={{ marginRight: !collapsed ? '0.5rem' : '0' }} />
        {!collapsed && <span>Logout</span>}
      </div>

      <div className="navfield-sidebar-footer">
        <div className="navfield-social-links">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="navfield-social-link"
              title={social.label}
            >
              <span className="navfield-icon">{social.icon}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default Nav;
