// Sidebar.js
import React from 'react';
import './SalesManager.css'; // You'll need to create this CSS file
import salesManagerProfile from './salesmanager.png'; // Make sure the image path is correct
import { FaChartLine, FaShoppingCart, FaFileInvoiceDollar, FaUserCircle, FaUsers } from 'react-icons/fa';

const Sidebar = ({ active, onTabClick }) => {
    return (
        <div className="salesmanager-sidebar">
            <div className="salesmanager-sidebar-header">
                <div className="salesmanager-profile-section">
                    <img src={salesManagerProfile} alt="Profile" className="salesmanager-profile-image" />
                    <h3>Patali Tennakoon</h3>
                    <p>Sales Manager</p>
                </div>
            </div>
            <nav className="salesmanager-sidebar-nav">
                <ul>
                    <li className={active === 'dashboard' ? 'active' : ''}>
                        <a href="#dashboard" onClick={() => onTabClick('dashboard')}>
                            <FaChartLine className="salesmanager-sidebar-icon" /> Dashboard
                        </a>
                    </li>
                    <li className={active.startsWith('orders') ? 'active' : ''}>
                        <a href="#orders" onClick={() => onTabClick('orders-local')}>
                            <FaShoppingCart className="salesmanager-sidebar-icon" /> Orders
                        </a>
                    </li>
                    <li className={active === 'quotations' ? 'active' : ''}>
                        <a href="#quotations" onClick={() => onTabClick('quotations')}>
                            <FaFileInvoiceDollar className="salesmanager-sidebar-icon" /> Quotations
                        </a>
                    </li>
                    <li className={active === 'customers' ? 'active' : ''}>
                        <a href="#customers" onClick={() => onTabClick('customers')}>
                            <FaUsers className="salesmanager-sidebar-icon" /> Customers
                        </a>
                    </li>
                    <li className={active === 'profile' ? 'active' : ''}>
                        <a href="#profile" onClick={() => onTabClick('profile')}>
                            <FaUserCircle className="salesmanager-sidebar-icon" /> Profile
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;