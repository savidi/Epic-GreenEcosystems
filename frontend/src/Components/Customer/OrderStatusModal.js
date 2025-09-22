import React from 'react';
import './OrderStatusModal.css';

const OrderStatusModal = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null;

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Define the order status flow
    const statusFlow = [
        { key: 'requested', label: 'Requested', icon: '📝' },
        { key: 'quoted', label: 'Quoted', icon: '💰' },
        { key: 'pending', label: 'Pending', icon: '⏳' },
        { key: 'paid', label: 'Paid', icon: '✅' },
        { key: 'shipped', label: 'Shipped', icon: '🚚' },
        { key: 'delivered', label: 'Delivered', icon: '📦' }
    ];

    // Get current status index
    const currentStatusIndex = statusFlow.findIndex(status => status.key === order.orderStatus);
    const isRejected = order.orderStatus === 'rejected';

    const getStepStatus = (index) => {
        if (isRejected) return 'rejected';
        if (index < currentStatusIndex) return 'completed';
        if (index === currentStatusIndex) return 'active';
        return 'pending';
    };

    return (
        <div className="orderstatus-modal-overlay" onClick={onClose}>
            <div className="orderstatus-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="orderstatus-modal-header">
                    <div className="orderstatus-header-content">
                        <div className="orderstatus-truck-icon">🚚</div>
                        <h2>Status</h2>
                    </div>
                    <button className="orderstatus-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="orderstatus-info-card">
                    <div className="orderstatus-info-item">
                        <span className="orderstatus-info-icon">📋</span>
                        <div>
                            <strong>Order #{order._id}</strong>
                            <p>Placed on {formatDate(order.createdAt)}</p>
                        </div>
                    </div>
                    <div className="orderstatus-total-amount">
                        <span>Total amount: Rs.{order.totalPrice.toFixed(2)}</span>
                    </div>
                </div>

                {isRejected ? (
                    <div className="orderstatus-rejected-status">
                        <div className="orderstatus-rejected-icon">❌</div>
                        <h3>Order Rejected</h3>
                        <p>Unfortunately, this order has been rejected and will not be processed.</p>
                    </div>
                ) : (
                    <div className="orderstatus-timeline">
                        {statusFlow.map((status, index) => {
                            const stepStatus = getStepStatus(index);
                            return (
                                <div key={status.key} className={`orderstatus-timeline-step ${stepStatus}`}>
                                    <div className="orderstatus-timeline-icon">
                                        <span className={`orderstatus-icon ${stepStatus}`}>
                                            {stepStatus === 'completed' ? '✓' : status.icon}
                                        </span>
                                    </div>
                                    <div className="orderstatus-timeline-content">
                                        <h4>{status.label}</h4>
                                        {stepStatus === 'active' && (
                                            <p className="orderstatus-current-status">Current Status</p>
                                        )}
                                    </div>
                                    {index < statusFlow.length - 1 && (
                                        <div className={`orderstatus-timeline-line ${stepStatus === 'completed' ? 'completed' : ''}`}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="orderstatus-items">
                    <h3>Order Items:</h3>
                    <div className="orderstatus-items-list">
                        {order.items.map((item, index) => (
                            <div key={index} className="orderstatus-item">
                                <span className="orderstatus-item-name">{item.spice.name}</span>
                                <span className="orderstatus-item-quantity">{item.quantity}kg</span>
                                <span className="orderstatus-item-price">Rs.{item.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderStatusModal;