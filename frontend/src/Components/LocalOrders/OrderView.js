import React, { useState, useEffect } from 'react';
import Nav from '../NavCus/NavCus';
import './OrderView.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../Footer/Footer';

function OrderView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [spice, setSpice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);
    const [notification, setNotification] = useState({ message: '', visible: false, isError: false });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const spiceResponse = await axios.get(`http://localhost:5000/api/spices/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSpice(spiceResponse.data.spice);

                setCartUpdateTrigger(prev => prev + 1);

            } catch (error) {
                console.error("Error fetching data:", error);
                
                if (error.response) {
                    if (error.response.status === 404) {
                        setSpice(null);
                    } else if (error.response.status === 401) {
                        localStorage.removeItem('token');
                        navigate('/login');
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id, navigate]);

    const showNotification = (message, isError = false) => {
        setNotification({ message, visible: true, isError });
        setTimeout(() => {
            setNotification({ message: '', visible: false, isError: false });
        }, 3000);
    };

    const handleQuantityChange = (e) => {
        const value = Number(e.target.value);
        if (value >= 1) {
            setQuantity(value);
        }
    };

    const handleQuantityIncrement = (value) => {
        setQuantity(prevQuantity => Math.max(1, prevQuantity + value));
    };

    const handleAddToCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            await axios.post('http://localhost:5000/api/orders', {
                spiceId: spice._id,
                quantity: quantity,
                price: spice.price,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            setCartUpdateTrigger(prev => prev + 1);
            showNotification('Item added to cart successfully!', false);
        } catch (error) {
            console.error("Error adding to cart:", error.response ? error.response.data : error.message);
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                showNotification('Failed to add item to cart. Please try again.', true);
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!spice) {
        return <div>Spice not found.</div>;
    }

    // Correct image URL handling: Build the full URL from the filename
    const imageSrc = spice.imageUrl
        ? spice.imageUrl.startsWith('http')
            ? spice.imageUrl
            : `http://localhost:5000/images/${spice.imageUrl}`
        : '/placeholder.png'; // Use a placeholder if no URL is available

    return (
        <div>
            <Nav cartUpdateTrigger={cartUpdateTrigger} />
            {notification.visible && (
                <div className={`notification ${notification.isError ? 'error' : 'success'}`}>
                    {notification.message}
                </div>
            )}
            <div className="order-view-container">
                <div className="product-details-card">
                    <div className="image-section">
                        {/* Use the correctly constructed imageSrc here */}
                        <img src={imageSrc} alt={spice.name} className="product-image" />
                    </div>
                    <div className="details-section">
                        <h1 className="product-name">{spice.name}</h1>
                        <p className="product-description">{spice.description}</p>
                        <div className="product-price">
                            <span className="price-label">Price:</span>
                            <span className="price-value">Rs.{(spice.price * quantity).toFixed(2)}</span>
                        </div>
                        <div className="quantity-section">
                            <label htmlFor="quantity" className="quantity-label">Quantity (kg):</label>
                            <div className="quantity-controls">
                                <button onClick={() => handleQuantityIncrement(-1)} disabled={quantity <= 1}>-</button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    className="quantity-input"
                                    min="1"
                                />
                                <button onClick={() => handleQuantityIncrement(1)}>+</button>
                            </div>
                        </div>
                        <button className="add-to-cart-button" onClick={handleAddToCart}>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default OrderView;