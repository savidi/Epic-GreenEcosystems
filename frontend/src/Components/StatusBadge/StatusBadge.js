import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
    // Convert status to a CSS-friendly class name (e.g., 'pending' -> 'statusbadge-status-pending')
    const statusClass = status ? `statusbadge-status-${status.toLowerCase()}` : 'statusbadge-status-unknown';

    return (
        <span className={`statusbadge-status-badge ${statusClass}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
