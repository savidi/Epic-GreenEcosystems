// CustomerTable.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import './CustomerTable.css'; // Assuming you have a separate CSS file

const CustomerTable = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleApiError = useCallback((err) => {
        console.error("API Error:", err);
        if (err.response) {
            setError(`Error: ${err.response.data.message || 'Server error'}`);
        } else {
            setError("Error: Unable to connect to the server.");
        }
    }, []);

    const fetchCustomers = useCallback(async (term = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please log in again.');
                setLoading(false);
                return;
            }
            
            const response = await axios.get(`http://localhost:5000/api/sales/customers?search=${term}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomers(response.data);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    }, [handleApiError]);

    useEffect(() => {
        fetchCustomers(searchTerm);
    }, [fetchCustomers, searchTerm]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const renderContent = () => {
        if (loading) {
            return <div>Loading customers...</div>;
        }

        if (error) {
            return <div className="salesmanager-error-message">{error}</div>;
        }

        if (customers.length === 0) {
            return <div>No customers found.</div>;
        }

        return (
            <div className="salesmanager-table-container">
                <table className="salesmanager-quotation-table">
                    <thead>
                        <tr>
                            <th>Customer ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => (
                            <tr key={customer._id}>
                                <td>{customer._id}</td>
                                <td>{customer.name}</td>
                                <td>{customer.gmail}</td>
                                <td>{customer.phone}</td>
                                <td>{customer.address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="salesmanager-customer-table-container">
            <header className="salesmanager-dashboard-header">
                <h1>Customer List</h1>
                <div className="salesmanager-search-bar">
                    <FaSearch className="salesmanager-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by customer ID or name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </header>
            {renderContent()}
        </div>
    );
};

export default CustomerTable;