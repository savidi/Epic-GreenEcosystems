import React, { useState, useEffect } from 'react';
import Nav from '../NavCus/NavCus';
import './LocalOrders.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import Footer from '../Footer/Footer';

function LocalOrders() {
    const [spices, setSpices] = useState([]);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchSpices = async () => {
            const token = localStorage.getItem('token'); // Get the token
            if (!token) {
                navigate('/login'); // Redirect if no token is found
                return;
            }
            try {
                const response = await axios.get("http://localhost:5000/api/spices", {
                    headers: { Authorization: `Bearer ${token}` }, // Add the token to headers
                });
                setSpices(response.data.spices);
            } catch (error) {
                console.error("Error fetching spices:", error);
                // Handle 401 error specifically
                if (error.response && error.response.status === 401) {
                     navigate('/login');
                }
            }
        };

        fetchSpices();
    }, [navigate]);

    return (
        <div>
            <Nav />
            <div className="lo-spice-catalogue-container">
                <h1 className="lo-catalogue-title">Our Spices</h1>
                <div className="lo-spice-grid">
                    {spices.length > 0 ? (
                        spices.map((spice) => (
                            <div key={spice._id} className="lo-spice-card">
                                <img src={spice.imageUrl} alt={spice.name} className="lo-spice-image" />
                                <h2 className="lo-spice-name">{spice.name}</h2>
                                <p className="lo-spice-description">{spice.description}</p>
                                <Link to={`/orderview/${spice._id}`}>
                                    <button className="lo-buy-button">Buy Now</button>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p>Loading spices...</p>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default LocalOrders;