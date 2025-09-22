import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import './navfield.css';
import { FaHome, FaLeaf, FaChartBar, FaUserCog, FaBars, FaInstagram, FaFacebook } from 'react-icons/fa';

function Nav() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(
    () => JSON.parse(localStorage.getItem("sidebar-collapsed")) || false
  );

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(!prev));
      return !prev;
    });
  };

  const links = [
    { path: "/Dashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/Plant", label: "Plant", icon: <FaLeaf /> },
    { path: "/Report", label: "Report", icon: <FaChartBar /> },
    { path: "/Account", label: "Account", icon: <FaUserCog /> },
  ];

  const socialLinks = [
    { url: "https://instagram.com", label: "Instagram", icon: <FaInstagram /> },
    { url: "https://facebook.com", label: "Facebook", icon: <FaFacebook /> },
  ];

  return (
    <aside className={`navfield-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="navfield-sidebar-header">
        {!collapsed && <h2>EPIC Green</h2>}
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
