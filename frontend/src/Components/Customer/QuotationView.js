// QuotationView.js
import React from 'react';
import StatusBadge from '../StatusBadge/StatusBadge.js';

function QuotationView({ quotations, loadingQuotations, fetchData, handleApprove, handleReject, handleViewPdf }) {
    
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loadingQuotations) {
        return <div className="content-section">Loading quotations...</div>;
    }

    return (
        <div className="content-section">
            <h2>Quotation List</h2>
            {quotations.length > 0 ? (
                <table className="order-history-table">
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left' }}>Quotation ID</th>
                            <th style={{ textAlign: 'center' }}>Date</th>
                            <th style={{ textAlign: 'left' }}>Spices Requested</th>
                            <th style={{ textAlign: 'center' }}>Status</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotations.map((quotation) => (
                            <tr key={quotation._id}>
                                <td>{quotation._id}</td>
                                <td style={{ textAlign: 'center' }}>{formatDate(quotation.createdAt)}</td>
                                <td>
                                    {quotation.interestedSpices.map(spice => (
                                        <span key={spice._id} style={{ display: 'block' }}>{spice.name}</span>
                                    ))}
                                </td>
                                 <td style={{ textAlign: 'center' }}>
                                    {/* Use the StatusBadge component here */}
                                    <StatusBadge status={quotation.status} />
                                </td>
                                <td>
                                    <div className="quotation-actions-container"> {/* New container for buttons */}
                                        <button
                                            className="view-pdf-btn"
                                            onClick={() => handleViewPdf(quotation._id)}
                                            disabled={quotation.status === 'requested'} // Only disable if not staff-processed
                                        >
                                            View PDF
                                        </button>
                                        <button
                                            className="approve-btn"
                                            onClick={() => handleApprove(quotation._id)}
                                            disabled={quotation.status !== 'pending'}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => handleReject(quotation._id)}
                                            disabled={quotation.status === 'approved' || quotation.status === 'rejected'}
                                        >
                                        Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No quotations found.</p>
            )}
        </div>
    );
}

export default QuotationView;
