// Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SalesManager.css'; // Ensure this CSS exists
import salesManagerProfile from './salesmanager.png';
import { FaChartLine, FaShoppingCart, FaFileInvoiceDollar, FaUserCircle, FaUsers, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ active, onTabClick }) => {
    const navigate = useNavigate();

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
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="profile-section">
                    <img src={salesManagerProfile} alt="Profile" className="profile-image" />
                    <h3>Patali Tennakoon</h3>
                    <p>Sales Manager</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li className={active === 'dashboard' ? 'active' : ''}>
                        <a href="#dashboard" onClick={() => onTabClick('dashboard')}>
                            <FaChartLine className="sidebar-icon" /> Dashboard
                        </a>
                    </li>
                    <li className={active.startsWith('orders') ? 'active' : ''}>
                        <a href="#orders" onClick={() => onTabClick('orders-local')}>
                            <FaShoppingCart className="sidebar-icon" /> Orders
                        </a>
                    </li>
                    <li className={active === 'quotations' ? 'active' : ''}>
                        <a href="#quotations" onClick={() => onTabClick('quotations')}>
                            <FaFileInvoiceDollar className="sidebar-icon" /> Quotations
                        </a>
                    </li>
                    <li className={active === 'customers' ? 'active' : ''}>
                        <a href="#customers" onClick={() => onTabClick('customers')}>
                            <FaUsers className="sidebar-icon" /> Customers
                        </a>
                    </li>
                    <li className={active === 'Account' ? 'active' : ''}>
                        <a href="#Account" onClick={() => onTabClick('Account')}>
                            <FaUserCircle className="sidebar-icon" /> Profile
                        </a>
                    </li>

                    {/* Logout button */}
                    <li className="sidebar-logout" style={{ marginTop: 'auto' }}>
                        <button className="logout-btn" onClick={handleLogout}>
                            <FaSignOutAlt className="sidebar-icon" /> Logout
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
