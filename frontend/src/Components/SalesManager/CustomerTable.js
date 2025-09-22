// CustomerTable.js (Revised)
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import './CustomerTable.css'; // Assuming you have a separate CSS file

const CustomerTable = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Removed the handleApiError function

    const fetchCustomers = useCallback(async (term = '') => {
        setLoading(true);
        try {
            // Removed token check and redirect
            // Removed the headers object from the axios call
            const response = await axios.get(`http://localhost:5000/api/sales/customers?search=${term}`);
            setCustomers(response.data);
        } catch (err) {
            console.error("API Error:", err);
            setError("Error: Unable to connect to the server or fetch data.");
        } finally {
            setLoading(false);
        }
    }, []); // Removed handleApiError from dependencies

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
            return <div className="error-message">{error}</div>;
        }

        if (customers.length === 0) {
            return <div>No customers found.</div>;
        }

        return (
            <div className="table-container">
                <table className="quotation-table">
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
        <div className="customer-table-container">
            <header className="dashboard-header">
                <h1>Customer List</h1>
                <div className="search-bar">
                    <FaSearch className="search-icon" />
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