import React, { useState, useEffect } from 'react';
import Nav from '../NavCus/NavCus';
import './LocalOrders.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';

function LocalOrders() {
    const [spices, setSpices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSpices = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const response = await axios.get("http://localhost:5000/api/spices", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSpices(response.data.spices);
            } catch (error) {
                console.error("Error fetching spices:", error);
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
            
            {/* START: NEW HERO SECTION */}
            <section className="spices-hero1-section">
                <div className="hero1-overlay">
                    <div className="hero1-content-orders">
                        <h1 className="hero1-title">Explore Our Spices</h1>
                        <p className="hero1-subtitle">The finest selection of local Sri Lankan harvest, delivered to your table.</p>
                    </div>
                </div>
            </section>
            {/* END: NEW HERO SECTION */}

            <div className="spice-catalogue-container">
                {/* REMOVED the old <h1> tag from here */}
                <div className="spice-grid">
                    {spices.length > 0 ? (
                        spices.map((spice) => (
                            <div key={spice._id} className="spice-card">
                                <img src={spice.imageUrl} alt={spice.name} className="spice-image" />
                                <div className="spice-content"> 
                                    <h2 className="spice-name">{spice.name}</h2>
                                    <p className="spice-description">{spice.description}</p>
                                    <Link to={`/orderview/${spice._id}`}>
                                        <button className="buy-button">Order Now</button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="loading-message">Harvesting the best spices...</p>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default LocalOrders;