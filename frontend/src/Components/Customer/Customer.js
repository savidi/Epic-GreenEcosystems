import React, { useState, useEffect, useCallback } from 'react';

import './Customer.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import userProfileImage from './profile.png';
import Footer from '../Footer/Footer';
import QuotationView from './QuotationView';
import StatusBadge from '../StatusBadge/StatusBadge.js'; 
import OrderStatusModal from './OrderStatusModal';
import NavCus from '../NavCus/NavCus'; // adjust path according to your folder structure


function Customer() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('customerDetails');
    const [customer, setCustomer] = useState({
        name: '',
        gmail: '',
        phone: '',
        address: '',
    });
    const [data, setData] = useState({
        orders: [],
        payments: [],
        quotations: []
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const [customerResponse, ordersResponse, paymentsResponse, quotationsResponse] = await Promise.all([
                axios.get('http://localhost:5000/api/users/profile', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/orders/history', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/payments/history', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/quotations/customer', { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            setCustomer(customerResponse.data.user);
            setData({
                orders: ordersResponse.data.orders,
                payments: paymentsResponse.data.payments,
                quotations: quotationsResponse.data.quotations,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleViewStatus = (order) => {
        setSelectedOrder(order);
        setIsStatusModalOpen(true);
    };

    const handleCloseStatusModal = () => {
        setIsStatusModalOpen(false);
        setSelectedOrder(null);
    };

    const handleViewPdf = async (quotationId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/quotations/${quotationId}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            window.open(fileURL);
        } catch (error) {
            console.error('Error viewing PDF:', error);
            alert('Failed to generate PDF.');
        }
    };

    const handleApprove = async (quotationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/quotations/${quotationId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Quotation approved!');
            fetchData();
        } catch (error) {
            console.error('Error approving quotation:', error);
            alert('Failed to approve quotation.');
        }
    };

    const handleReject = async (quotationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/quotations/${quotationId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Quotation rejected!');
            fetchData();
        } catch (error) {
            console.error('Error rejecting quotation:', error);
            alert('Failed to reject quotation.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomer(prevCustomer => ({ ...prevCustomer, [name]: value }));
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:5000/api/users/profile', customer, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCustomer(response.data.user);
            setIsEditing(false);
            alert('Details updated successfully!');
        } catch (error) {
            console.error("Error updating details:", error);
            alert('Failed to update details.');
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const renderContent = () => {
        if (loading) {
            return <div className="cust-content-section">Loading...</div>;
        }

        const renderTable = (items, headers, renderRow) => (
            items.length > 0 ? (
                <table className="cust-order-history-table">
                    <thead>
                        <tr>{headers.map((header, index) => <th key={index}>{header}</th>)}</tr>
                    </thead>
                    <tbody>{items.map(renderRow)}</tbody>
                </table>
            ) : (
                <p>No data found.</p>
            )
        );

        switch (activeTab) {
            case 'customerDetails':
                return (
                    <div className="cust-content-section">
                        <h2>Customer Details</h2>
                        <div className="cust-detail-item">
                            <strong>Name:</strong>
                            {isEditing ? <input type="text" name="name" value={customer.name} onChange={handleInputChange} /> : <span>{customer.name}</span>}
                        </div>
                        <div className="cust-detail-item">
                            <strong>Email:</strong>
                            {isEditing ? <input type="email" name="gmail" value={customer.gmail} onChange={handleInputChange} /> : <span>{customer.gmail}</span>}
                        </div>
                        <div className="cust-detail-item">
                            <strong>Phone:</strong>
                            {isEditing ? <input type="text" name="phone" value={customer.phone} onChange={handleInputChange} /> : <span>{customer.phone}</span>}
                        </div>
                        <div className="cust-detail-item">
                            <strong>Address:</strong>
                            {isEditing ? <input type="text" name="address" value={customer.address} onChange={handleInputChange} /> : <span>{customer.address}</span>}
                        </div>
                        <div className="cust-button-group">
                            {isEditing ? (
                                <button onClick={handleUpdate}>Save</button>
                            ) : (
                                <button onClick={() => setIsEditing(true)}>Edit</button>
                            )}
                        </div>
                    </div>
                );
            case 'orderHistory':
                return (
                    <div className="cust-content-section">
                        <h2>Order History</h2>
                        {renderTable(data.orders, ['Order ID', 'Date', 'Items', 'Total Price', 'Status', 'Actions'], (order) => (
                            <tr key={order._id}>
                                <td>{order._id}</td>
                                <td>{formatDate(order.createdAt)}</td>
                                <td>{order.items.map(item => <div key={item._id}>{item.spice.name} ({item.quantity}kg)</div>)}</td>
                                <td>Rs.{order.totalPrice.toFixed(2)}</td>
                                <td><StatusBadge status={order.orderStatus} /></td>
                                <td>
                                    <button 
                                        className="cust-view-status-btn"
                                        onClick={() => handleViewStatus(order)}
                                    >
                                        View Status
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </div>
                );
            case 'paymentHistory':
                return (
                    <div className="cust-content-section">
                        <h2>Payment History</h2>
                        {renderTable(data.payments, ['Order ID', 'Amount', 'Date', 'Status'], (payment) => (
                            <tr key={payment._id}>
                                <td>{payment.order?._id || 'N/A'}</td>
                                <td>Rs.{payment.amount.toFixed(2)}</td>
                                <td>{formatDate(payment.paymentDate)}</td>
                                <td><StatusBadge status={payment.status} /></td>
                            </tr>
                        ))}
                    </div>
                );
            case 'quotationView':
                return (
                    <QuotationView
                        quotations={data.quotations} 
                        loadingQuotations={loading} 
                        fetchData={fetchData}
                        handleApprove={handleApprove}
                        handleReject={handleReject}
                        handleViewPdf={handleViewPdf}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <NavCus />
            <div className="cust-header">
                <div className="cust-profile-image-container">
                    <img src={userProfileImage} alt="User Profile" className="cust-profile-image" />
                </div>
            </div>
            <div className="cust-portal-container">
                <div className="cust-tabs">
                    <button className={`cust-tab-button ${activeTab === 'customerDetails' ? 'active' : ''}`} onClick={() => setActiveTab('customerDetails')}>
                        Customer Details
                    </button>
                    <button className={`cust-tab-button ${activeTab === 'orderHistory' ? 'active' : ''}`} onClick={() => setActiveTab('orderHistory')}>
                        Order History
                    </button>
                    <button className={`cust-tab-button ${activeTab === 'quotationView' ? 'active' : ''}`} onClick={() => setActiveTab('quotationView')}>
                        Quotation View
                    </button>
                    <button className={`cust-tab-button ${activeTab === 'paymentHistory' ? 'active' : ''}`} onClick={() => setActiveTab('paymentHistory')}>
                        Payment History
                    </button>
                </div>
                <div className="cust-tab-content">
                    {renderContent()}
                </div>
            </div>
            <Footer />
            
            {/* Order Status Modal */}
            <OrderStatusModal 
                order={selectedOrder}
                isOpen={isStatusModalOpen}
                onClose={handleCloseStatusModal}
            />
        </div>
    );
}

export default Customer;