// Sidebar.js
import React from 'react';
import './SalesManager.css'; // You'll need to create this CSS file
import salesManagerProfile from './salesmanager.png'; // Make sure the image path is correct
import { FaChartLine, FaShoppingCart, FaFileInvoiceDollar, FaUserCircle, FaUsers } from 'react-icons/fa';

const Sidebar = ({ active, onTabClick }) => {
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
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;