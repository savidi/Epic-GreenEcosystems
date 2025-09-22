// SalesManager.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './SalesManager.css';
import Sidebar from './SideBar.js';
import Slider from '../Slider/Slider.js'; // Make sure the path is correct
import '../Slider/slider.css';
import OrderTable from './SalesOrder.js';
import QuotationTable from './QuotationTable.js';
import MonthlySalesChart from './MonthlySalesChart.js';
import TopSellingSpicesChart from './TopSellingSpicesChart';
import OrderByTypeChart from './OrderByTypeChart.js';
import OrderStatusChart from './OrderStatusChart.js';
import CustomerTable from './CustomerTable.js';
import { FaDollarSign, FaHourglassHalf, FaUsers, FaSearch, FaCheckCircle } from 'react-icons/fa';

function SalesManager() {
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
    const [error] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    // New state for local and global order counts
    const [localOrderCount, setLocalOrderCount] = useState(0);
    const [globalOrderCount, setGlobalOrderCount] = useState(0);

    const fetchSalesStats = useCallback(async () => {
        try {
            
            const response = await axios.get('http://localhost:5000/api/sales/stats', {
            });
            setSalesData({
                ...response.data,
                completedOrders: response.data.completedOrdersCount
            });
        } catch (err) {
            console.error('Error fetching sales stats:', err);
        }
    }, []);

    const fetchMonthlySalesData = useCallback(async (type) => {
        setLoading(true);
        try {
            const monthlySalesResponse = await axios.get(`http://localhost:5000/api/sales/monthly-sales?orderType=${type}`, {
            });
            setMonthlySales(monthlySalesResponse.data);
        } catch (err) {
            console.error('Error fetching monthly sales:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOrders = useCallback(async (orderType, term) => {
        setLoading(true);
        try {
            const apiType = orderType === 'orders-local' ? 'Local' : 'Global';

            const response = await axios.get(`http://localhost:5000/api/sales/orders?type=${apiType}&search=${term}`, {
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
           console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/sales/orders/${orderId}/status`,
                { status: newStatus },
            );
            if (activeTab === 'orders-local') {
                fetchOrders('orders-local', searchTerm);
            } else if (activeTab === 'orders-export') {
                fetchOrders('orders-export', searchTerm);
            }
            alert('Order status updated successfully!');
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Failed to update order status.');
        }
    };

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchSalesStats();
        } else if (activeTab.startsWith('orders')) {
            const type = activeTab === 'orders-local' ? 'orders-local' : 'orders-export';
            fetchOrders(type, searchTerm);
        }
    }, [activeTab, searchTerm]);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchMonthlySalesData(chartOrderType);
        }
    }, [activeTab, chartOrderType]);

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

        if (error) {
            return <div>Error: Unable to fetch data. Please check the server connection.</div>;
        }

        if (activeTab === 'dashboard') {
            return (
                <>
                    <header className="dashboard-header">
                        <h1>Dashboard</h1>
                    </header>
                    <Slider /> {/* Add the Slider component here */}
                    <div className="stats-grid">
                        <div className="stat-block sales">
                            <div className="icon-container">
                                <FaDollarSign className="stat-icon" />
                            </div>
                            <div className="info">
                                <h3>Total Sales</h3>
                                <p>{salesData.totalSales.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="stat-block pending">
                            <div className="icon-container">
                                <FaHourglassHalf className="stat-icon1" />
                            </div>
                            <div className="info">
                                <h3>Pending Orders</h3>
                                <p>{salesData.pendingOrders}</p>
                            </div>
                        </div>
                        <div className="stat-block customers">
                            <div className="icon-container">
                                <FaUsers className="stat-icon2" />
                            </div>
                            <div className="info">
                                <h3>Total Customers</h3>
                                <p>{salesData.totalCustomers}</p>
                            </div>
                        </div>
                        <div className="stat-block completed">
                            <div className="icon-container">
                                <FaCheckCircle className="stat-icon3" />
                            </div>
                            <div className="info">
                                <h3>Completed Orders</h3>
                                <p>{salesData.completedOrders}</p>
                            </div>
                        </div>
                    </div>
                    <div className="dashboard-charts-container">
                        <div className="chart-wrapper">
                            <div className="chart-header">
                                <h2>Monthly Revenue</h2>
                                <div className="chart-toggle-buttons">
                                    <button
                                        className={`toggle-button ${chartOrderType === 'Local' ? 'active' : ''}`}
                                        onClick={() => handleChartTypeToggle('Local')}>
                                        Local Orders
                                    </button>
                                    <button
                                        className={`toggle-button ${chartOrderType === 'Global' ? 'active' : ''}`}
                                        onClick={() => handleChartTypeToggle('Global')}>
                                        Global Orders
                                    </button>
                                    <button
                                        className="toggle-button"
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
                        <div className="chart-wrapper">
                            <TopSellingSpicesChart />
                        </div>
                    </div>
                    <div className="dashboard-charts-container">
                        <div className="chart-wrapper">
                            <OrderByTypeChart />
                        </div>
                        <div className="chart-wrapper">
                            <OrderStatusChart />
                        </div>
                    </div>
                </>
            );
        }

        if (activeTab.startsWith('orders')) {
            const isLocal = activeTab === 'orders-local';
            return (
                <div className="orders-section">
                    <header className="dashboard-header">
                        <h1>Orders</h1>
                        <div className="search-bar">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by Order ID..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </header>
                    <div className="tab-navigation">
                        <button
                            className={`tab ${isLocal ? 'active' : ''}`}
                            onClick={() => handleSubTabClick('orders-local')}
                        >
                            Local Orders
                        </button>
                        <button
                            className={`tab ${!isLocal ? 'active' : ''}`}
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
                <div className="quotation-section">
                    <QuotationTable
                        title="Quotation Requests"
                        emptyMessage="No quotation requests found."
                    />
                </div>
            );
        }
    };

    return (
        <div className="sales-manager-page">
            <div className="sales-manager-container">
                <Sidebar active={activeTab} onTabClick={handleTabClick} />
                <div className="main-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default SalesManager;