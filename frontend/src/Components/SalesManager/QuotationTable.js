// QuotationTable.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './QuoteTable.css';
import { FaSearch } from 'react-icons/fa';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
import StatusBadge from '../StatusBadge/StatusBadge.js';

// Explicitly apply the plugin to jspdf
applyPlugin(jsPDF);

// Status Card component
const StatusCard = ({ title, count }) => (
    <div className="salesmanager-status-card">
        <h4>{title}</h4>
        <p className="salesmanager-status-count">{count}</p>
    </div>
);

const QuotationTable = ({ title, emptyMessage }) => {
    const navigate = useNavigate();
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    // New state variables for quotation counts
    const [pendingCount, setPendingCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [allCount, setAllCount] = useState(0);

    const fetchQuotations = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please log in again.');
                setLoading(false);
                return;
            }
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('search', searchTerm);
            if (countryFilter) queryParams.append('country', countryFilter);
            if (dateFilter) queryParams.append('date', dateFilter);

            const response = await axios.get(`http://localhost:5000/api/sales/quotations?${queryParams.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuotations(response.data.quotations);
            // Process the fetched data to get counts
            const fetchedQuotations = response.data.quotations;
            const pending = fetchedQuotations.filter(q => q.status === 'pending').length;
            const approved = fetchedQuotations.filter(q => q.status === 'approved').length;
            setPendingCount(pending);
            setApprovedCount(approved);
            setAllCount(fetchedQuotations.length);
        } catch (err) {
            console.error('Error fetching quotations:', err);
            if (err.response && err.response.status === 401) {
                setError('Access denied. You may not have permission to access quotation data.');
            } else {
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    }, [navigate, searchTerm, countryFilter, dateFilter]);

    useEffect(() => {
        fetchQuotations();
    }, [fetchQuotations]);

    const handleViewQuotation = (quotationId) => {
        navigate(`/sales-manager/quotations/${quotationId}`);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Quotation Details", 14, 20);

        const tableColumn = ["Customer ID", "Country", "Interested Spices", "Date", "Status"];

        const tableRows = quotations.map(quotation => [
            quotation.customer?._id || 'N/A',
            quotation.country,
            Array.isArray(quotation.interestedSpices) ? quotation.interestedSpices.map(s => s.name).join(', ') : 'N/A',
            formatDate(quotation.createdAt),
            quotation.status,
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            styles: {
                fontSize: 10,
                cellPadding: 3,
                valign: 'middle',
            },
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: [51, 51, 51],
                fontStyle: 'bold',
            },
            didDrawPage: function (data) {
                let str = "Page " + doc.internal.getNumberOfPages();
                doc.setFontSize(10);
                let pageSize = doc.internal.pageSize;
                let pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                doc.text(str, data.settings.margin.left, pageHeight - 10);
            }
        });

        const pdfDataUri = doc.output('datauristring');
        
        const newTab = window.open();
        newTab.document.write('<iframe width="100%" height="100%" src="' + pdfDataUri + '"></iframe>');
    };

    if (loading) {
        return <div className="salesmanager-loading-message">Loading quotations...</div>;
    }

    if (error) {
        return <div className="salesmanager-error-message">Error: Unable to fetch quotations.</div>;
    }

    return (
        <div className="salesmanager-quotation-table-container">
            {/* New status cards container */}
            <div className="salesmanager-status-cards-container">
                <StatusCard title="Pending Quotations" count={pendingCount} />
                <StatusCard title="Approved Quotations" count={approvedCount} />
                <StatusCard title="All Quotations" count={allCount} />
            </div>
            <header className="salesmanager-quotation-header">
                <h1>{title}</h1>
                <div className="salesmanager-filter-options-row">
                    <div className="salesmanager-search-bar2">
                        <FaSearch className="salesmanager-search-icon" />
                        <input
                            type="text"
                            placeholder="Search by Customer ID or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className="salesmanager-filter-select" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
                        <option value="">Filter by Country</option>
                        <option value="Australia">Australia</option>
                        <option value="India">India</option>
                        <option value="Canada">Canada</option>
                        <option value="England">England</option>
                    </select>
                    <div className="salesmanager-date-filter">
                        <label htmlFor="quotation-date">Date:</label>
                        <input
                            type="date"
                            id="quotation-date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                </div>
            </header>
            {quotations.length === 0 ? (
                <div className="salesmanager-no-data-message">{emptyMessage}</div>
            ) : (
                <>
                    <table className="salesmanager-quotation-table">
                        <thead>
                            <tr>
                                <th>Customer ID</th>
                                <th>Country</th>
                                <th>Interested Spices</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotations.map(quotation => {
                                const isQuotationApproved = quotation.status === 'approved';
                                return (
                                    <tr key={quotation._id}>
                                        <td>{quotation.customer?._id || 'N/A'}</td>
                                        <td>{quotation.country}</td>
                                        <td>
                                            {Array.isArray(quotation.interestedSpices)
                                                ? quotation.interestedSpices.map(s => s.name).join(', ')
                                                : 'N/A'}
                                        </td>
                                        <td>{formatDate(quotation.createdAt)}</td>
                                        <td><StatusBadge status={quotation.status} /></td>
                                        <td>
                                            <button
                                                onClick={() => handleViewQuotation(quotation._id)}
                                                className="salesmanager-view-button"
                                            >
                                                {isQuotationApproved ? "View" : "View/Update"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <button className="salesmanager-download-pdf-button" onClick={generatePDF}>
                        Download PDF
                    </button>
                </>
            )}
        </div>
    );
};

export default QuotationTable;