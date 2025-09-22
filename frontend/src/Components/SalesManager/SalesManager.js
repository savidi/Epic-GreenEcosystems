// SalesManager.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './SalesManager.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from './SideBar.js';
import OrderTable from './SalesOrder.js';
import QuotationTable from './QuotationTable.js';
import MonthlySalesChart from './MonthlySalesChart.js';
import TopSellingSpicesChart from './TopSellingSpicesChart';
import OrderByTypeChart from './OrderByTypeChart.js';
import OrderStatusChart from './OrderStatusChart.js';
import CustomerTable from './CustomerTable.js';
import { FaDollarSign, FaHourglassHalf, FaUsers, FaSearch, FaCheckCircle } from 'react-icons/fa';

function SalesManager() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [salesData, setSalesData] = useState({
        totalSales: 0,
        pendingOrders: 0,
        totalCustomers: 0,
        completedOrders: 0
    });
    const [localOrders, setLocalOrders] = useState([]);
    const [exportOrders, setExportOrders] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);
    const [chartOrderType, setChartOrderType] = useState('Local');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    // New state for local and global order counts
    const [localOrderCount, setLocalOrderCount] = useState(0);
    const [globalOrderCount, setGlobalOrderCount] = useState(0);

    const handleApiError = useCallback((err) => {
        console.log('handleApiError called:', err);
        console.log('Error response:', err.response);
        console.log('Error status:', err.response?.status);
        
        if (err.response && err.response.status === 401) {
            // For sales manager, don't immediately redirect on 401
            // This might be a permissions issue rather than authentication issue
            console.log('401 error detected - setting access denied error');
            setError('Access denied. You may not have permission to access sales data.');
        } else {
            console.log('Non-401 error detected - setting general error');
            setError(err);
        }
    }, [navigate]);

    const fetchSalesStats = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('fetchSalesStats - Token exists:', !!token);
            if (!token) {
                setError('No authentication token found. Please log in again.');
                setLoading(false);
                return;
            }
            

            const response = await axios.get('http://localhost:5000/api/sales/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSalesData({
                ...response.data,
                completedOrders: response.data.completedOrdersCount
            });
        } catch (err) {
            handleApiError(err);
        }
    }, [handleApiError, navigate]);

    const fetchMonthlySalesData = useCallback(async (type) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please log in again.');
                setLoading(false);
                return;
            }
            const monthlySalesResponse = await axios.get(`http://localhost:5000/api/sales/monthly-sales?orderType=${type}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMonthlySales(monthlySalesResponse.data);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    }, [handleApiError, navigate]);

    const fetchOrders = useCallback(async (orderType, term) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please log in again.');
                setLoading(false);
                return;
            }
            const apiType = orderType === 'orders-local' ? 'Local' : 'Global';

            const response = await axios.get(`http://localhost:5000/api/sales/orders?type=${apiType}&search=${term}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Set order count for the appropriate type
            if (apiType === 'Local') {
                setLocalOrders(response.data.orders);
                setLocalOrderCount(response.data.orders.length);
            } else if (apiType === 'Global') {
                setExportOrders(response.data.orders);
                setGlobalOrderCount(response.data.orders.length);
            }
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    }, [handleApiError, navigate]);

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please log in again.');
                return;
            }
            await axios.put(`http://localhost:5000/api/sales/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (activeTab === 'orders-local') {
                fetchOrders('orders-local', searchTerm);
            } else if (activeTab === 'orders-export') {
                fetchOrders('orders-export', searchTerm);
            }
            alert('Order status updated successfully!');
        } catch (err) {
            console.error('Error updating order status:', err);
            handleApiError(err);
            alert('Failed to update order status.');
        }
    };

    useEffect(() => {
        // Debug: Log token status on mount
        const token = localStorage.getItem('token');
        console.log('SalesManager mounted - Token exists:', !!token);
        console.log('SalesManager mounted - Active tab:', activeTab);
        
        if (activeTab === 'dashboard') {
            fetchSalesStats();
        } else if (activeTab.startsWith('orders')) {
            const type = activeTab === 'orders-local' ? 'orders-local' : 'orders-export';
            fetchOrders(type, searchTerm);
        }
    }, [activeTab, searchTerm, fetchOrders, fetchSalesStats]);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchMonthlySalesData(chartOrderType);
        }
    }, [activeTab, chartOrderType, fetchMonthlySalesData]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setSearchTerm('');
    };

    const handleSubTabClick = (subTab) => {
        setActiveTab(subTab);
        setSearchTerm('');
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleChartTypeToggle = (type) => {
        setChartOrderType(type);
    };

    const handleExportRevenue = () => {
        if (!monthlySales || monthlySales.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = ["Month/Year", "Total Revenue (LKR)"];
        const csvRows = monthlySales.map(item => [
            `${item.month}/${item.year}`,
            item.totalRevenue
        ]);

        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'monthly_revenue.csv');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const renderContent = () => {
        if (loading) {
            return <div>Loading data...</div>;
        }

        // Show a small error notification but still render the dashboard
        if (error) {
            console.log('Data loading error:', error);
        }

        if (activeTab === 'dashboard') {
            return (
                <>
                    {error && (
                        <div className="salesmanager-error-notification">
                            <span>⚠️ Data loading issue: {error.message || error || 'Unable to fetch some data'}</span>
                            <button 
                                className="salesmanager-dismiss-button" 
                                onClick={() => setError(null)}
                            >
                                ×
                            </button>
                        </div>
                    )}
                    <header className="salesmanager-dashboard-header">
                        <h1>Dashboard</h1>
                    </header>
                    <div className="salesmanager-stats-grid">
                        <div className="salesmanager-stat-block sales">
                            <div className="salesmanager-icon-container">
                                <FaDollarSign className="salesmanager-stat-icon" />
                            </div>
                            <div className="salesmanager-info">
                                <h3>Total Sales</h3>
                                <p>{salesData.totalSales.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="salesmanager-stat-block pending">
                            <div className="salesmanager-icon-container">
                                <FaHourglassHalf className="salesmanager-stat-icon1" />
                            </div>
                            <div className="salesmanager-info">
                                <h3>Pending Orders</h3>
                                <p>{salesData.pendingOrders}</p>
                            </div>
                        </div>
                        <div className="salesmanager-stat-block customers">
                            <div className="salesmanager-icon-container">
                                <FaUsers className="salesmanager-stat-icon2" />
                            </div>
                            <div className="salesmanager-info">
                                <h3>Total Customers</h3>
                                <p>{salesData.totalCustomers}</p>
                            </div>
                        </div>
                        <div className="salesmanager-stat-block completed">
                            <div className="salesmanager-icon-container">
                                <FaCheckCircle className="salesmanager-stat-icon3" />
                            </div>
                            <div className="salesmanager-info">
                                <h3>Completed Orders</h3>
                                <p>{salesData.completedOrders}</p>
                            </div>
                        </div>
                    </div>
                    <div className="salesmanager-dashboard-charts-container">
                        <div className="salesmanager-chart-wrapper">
                            <div className="salesmanager-chart-header">
                                <h2>Monthly Revenue</h2>
                                <div className="salesmanager-chart-toggle-buttons">
                                    <button
                                        className={`salesmanager-toggle-button ${chartOrderType === 'Local' ? 'salesmanager-active' : ''}`}
                                        onClick={() => handleChartTypeToggle('Local')}>
                                        Local Orders
                                    </button>
                                    <button
                                        className={`salesmanager-toggle-button ${chartOrderType === 'Global' ? 'salesmanager-active' : ''}`}
                                        onClick={() => handleChartTypeToggle('Global')}>
                                        Global Orders
                                    </button>
                                    <button
                                        className="salesmanager-toggle-button"
                                        onClick={handleExportRevenue}>
                                        Export to CSV
                                    </button>
                                </div>
                            </div>
                            {monthlySales.length > 0 ? (
                                <MonthlySalesChart
                                    data={monthlySales}
                                    title={`${chartOrderType} Order Revenue`}
                                />
                            ) : (
                                <p>No sales data available for this category.</p>
                            )}
                        </div>
                        <div className="salesmanager-chart-wrapper">
                            <TopSellingSpicesChart />
                        </div>
                    </div>
                    <div className="salesmanager-dashboard-charts-container">
                        <div className="salesmanager-chart-wrapper">
                            <OrderByTypeChart />
                        </div>
                        <div className="salesmanager-chart-wrapper">
                            <OrderStatusChart />
                        </div>
                    </div>
                </>
            );
        }

        if (activeTab.startsWith('orders')) {
            const isLocal = activeTab === 'orders-local';
            return (
                <div className="salesmanager-orders-section">
                    <header className="salesmanager-dashboard-header">
                        <h1>Orders</h1>
                        <div className="salesmanager-search-bar">
                            <FaSearch className="salesmanager-search-icon" />
                            <input
                                type="text"
                                placeholder="Search by Order ID..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </header>
                    <div className="salesmanager-tab-navigation">
                        <button
                            className={`salesmanager-tab ${isLocal ? 'salesmanager-active' : ''}`}
                            onClick={() => handleSubTabClick('orders-local')}
                        >
                            Local Orders
                        </button>
                        <button
                            className={`salesmanager-tab ${!isLocal ? 'salesmanager-active' : ''}`}
                            onClick={() => handleSubTabClick('orders-export')}
                        >
                            Export Orders
                        </button>
                    </div>
                    {isLocal ? (
                        <OrderTable
                            orders={localOrders}
                            title="Local Orders"
                            emptyMessage="No local orders found."
                            onStatusUpdate={handleUpdateOrderStatus}
                            currency="Rs."
                            // Pass the order counts to the component
                            localOrderCount={localOrderCount}
                            globalOrderCount={globalOrderCount}
                        />
                    ) : (
                        <OrderTable
                            orders={exportOrders}
                            title="Export Orders"
                            emptyMessage="No export orders found."
                            onStatusUpdate={handleUpdateOrderStatus}
                            currency="$"
                            // Pass the order counts to the component
                            localOrderCount={localOrderCount}
                            globalOrderCount={globalOrderCount}
                        />
                    )}
                </div>
            );
        }

        if (activeTab === 'customers') {
            return <CustomerTable />;
        }

        if (activeTab === 'quotations') {
            return (
                <div className="salesmanager-quotation-section">
                    <QuotationTable
                        title="Quotation Requests"
                        emptyMessage="No quotation requests found."
                    />
                </div>
            );
        }
    };

    return (
        <div className="salesmanager-sales-manager-page">
            <div className="salesmanager-sales-manager-container">
                <Sidebar active={activeTab} onTabClick={handleTabClick} />
                <div className="salesmanager-main-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default SalesManager;