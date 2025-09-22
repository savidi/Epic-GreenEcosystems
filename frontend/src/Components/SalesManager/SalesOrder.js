import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
import StatusBadge from '../StatusBadge/StatusBadge.js';
import './SalesManager.css'; 
applyPlugin(jsPDF);

// Status Card component is now a standalone functional component for clarity.
const StatusCard = ({ title, count }) => (
    <div className="salesmanager-status-card">
        <h4>{title}</h4>
        <p className="salesmanager-status-count">{count}</p>
    </div>
);

const OrderTable = ({ orders, title, emptyMessage, onStatusUpdate, currency, localOrderCount, globalOrderCount }) => {
    const [statusChanges, setStatusChanges] = useState({});

    const handleStatusChange = (orderId, newStatus) => {
        setStatusChanges(prev => ({ ...prev, [orderId]: newStatus }));
    };

    const handleExportPdf = () => {
        if (!orders || orders.length === 0) {
            alert("No data to export.");
            return;
        }

        const doc = new jsPDF();

        // Set document properties
        doc.setFontSize(18);
        doc.text(`Epic Green Co. - ${title} Report`, 14, 22);

        // Define the columns for the PDF table
        const tableColumn = ["Order ID", "Customer ID", "Total Price", "Status", "Created At"];

        // Define the rows from the orders data
        const tableRows = orders.map(order => [
            order._id,
            order.customer?._id || 'N/A',
            `${currency}${order.totalPrice.toFixed(2)}`,
            order.orderStatus,
            new Date(order.createdAt).toLocaleDateString()
        ]);

        // Auto-generate the table using jspdf-autotable
        doc.autoTable({
        head: [tableColumn], // Pass the columns as an array of arrays
        body: tableRows,     // Pass the rows as an array of arrays
        startY: 30
        });

        // NEW: Open the PDF in a new window for viewing instead of downloading
       const pdfOutput = doc.output('bloburl');
       window.open(pdfOutput, '_blank'); 
    };

    if (!orders || orders.length === 0) {
        return <div className="salesmanager-no-data-message">{emptyMessage}</div>;
    }

    const orderStatusOptions = ['pending', 'paid', 'shipped', 'delivered','quoted','requested'];

    return (
        <div className="salesmanager-order-table-container">
            <div className="salesmanager-status-cards-container">
                <StatusCard title="Local Orders" count={localOrderCount} />
                <StatusCard title="Global Orders" count={globalOrderCount} />
            </div>
            <div className="salesmanager-table-header-controls">
                <h3>{title}</h3>
                <button 
                    onClick={handleExportPdf} 
                    className="salesmanager-export-pdf-button"
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#ed7622ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#83501dff'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#ed7622ff'}
                >
                    Export Report (PDF)
                </button>
            </div>
            <table className="salesmanager-order-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer ID</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Status Update</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.customer?._id || 'N/A'}</td>
                            <td>{currency}{order.totalPrice.toFixed(2)}</td> 
                             <td>
                                {/* Use the StatusBadge component here */}
                                <StatusBadge status={statusChanges[order._id] || order.orderStatus} />
                            </td>
                            <td>
                                <select
                                    className="salesmanager-status-select"
                                    value={statusChanges[order._id] || order.orderStatus}
                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                >
                                    {orderStatusOptions.map(status => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button
                                    onClick={() => onStatusUpdate(order._id, statusChanges[order._id] || order.orderStatus)}
                                    className="salesmanager-update-button"
                                    disabled={!statusChanges[order._id]}
                                >
                                    Update
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderTable;