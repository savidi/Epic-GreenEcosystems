import React, { useState, useEffect } from 'react';
import './NavCus.css';
import { Link, useNavigate } from 'react-router-dom';
import userIcon from './profile.png';
import cartIcon from './cart.png';
import arrowIcon from './arrow.png';
import Elogo from '../Images/Elogo.png';// Logo
import axios from 'axios';

function Nav({ cartUpdateTrigger }) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchCartCount();
    } else {
      setIsLoggedIn(false);
      setCartItemCount(0);
    }
  }, [cartUpdateTrigger]);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/orders/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const count = response.data.order ? response.data.order.items.length : 0;
      setCartItemCount(count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      if (error.response && error.response.status === 404) {
        setCartItemCount(0);
      }
    }
  };

  const handleProductsClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate('/login');
    }
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsDropdownOpen((prevState) => !prevState);
    setIsLoginDropdownOpen(false); // Close login dropdown when products is opened
  };

  const toggleLoginDropdown = (e) => {
    e.preventDefault();
    setIsLoginDropdownOpen((prevState) => !prevState);
    setIsDropdownOpen(false); // Close products dropdown when login is opened
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCartItemCount(0);
    navigate('/login');
  };

  return (
    <div className="navcus-navbar">
      <div className="navcus-logo">
        <img src={Elogo} alt="Epic Green Logo" className="navcus-elogo" />
        
      </div>

      <ul className="navcus-nav-links">
        <li>
          <Link to="/cushome" className="active home-a">
            <h3>Home</h3>
          </Link>
        </li>
        <li>
          <Link to="/about" className="active home-a">
            <h3>About Us</h3>
          </Link>
        </li>
        <li className={`navcus-products-dropdown ${isDropdownOpen ? 'open' : ''}`}>
          <div className="navcus-products-toggle">
            <Link
              to={isLoggedIn ? '/local-orders' : '#'}
              className="active home-a"
              onClick={handleProductsClick}
            >
              <h3>Products</h3>
            </Link>
            <img
              src={arrowIcon}
              alt="dropdown arrow"
              className="navcus-dropdown-arrow"
              onClick={toggleDropdown}
            />
          </div>
          <div className="navcus-dropdown-content">
            <Link
              to={isLoggedIn ? '/local-orders' : '#'}
              className="navcus-dropdown-link"
              onClick={handleProductsClick}
            >
              Local Orders
            </Link>
            <Link
              to={isLoggedIn ? '/export-orders' : '#'}
              className="navcus-dropdown-link"
              onClick={handleProductsClick}
            >
              Export Orders
            </Link>
          </div>
        </li>
        <li>
          <Link to="/ContactUs" className="active home-a">
            <h3>Contact Us</h3>
          </Link>
        </li>
      </ul>

      <div className="navcus-nav-buttons">
        {isLoggedIn && (
          <li className="navcus-cart-icon-container">
            <Link to="/cart">
              <div className="navcus-cart-wrapper">
                <img src={cartIcon} alt="Cart" className="navcus-cart-icon" />
                <span className="navcus-cart-count">{cartItemCount}</span>
              </div>
            </Link>
          </li>
        )}
        {isLoggedIn && (
          <li className="navcus-user-icon-container">
            <Link to="/customer">
              <img src={userIcon} alt="Customer Portal" className="navcus-user-icon" />
            </Link>
          </li>
        )}
        {isLoggedIn ? (
          <button className="navcus-register-btn" onClick={handleLogout}>
            Log Out
          </button>
        ) : (
          <div className={`navcus-login-dropdown ${isLoginDropdownOpen ? 'open' : ''}`}>
            <Link to="/register" className="navcus-register-btn">
              Register
            </Link>
            <button className="navcus-login-btn" onClick={toggleLoginDropdown}>
              Log in
            </button>
            <div className="navcus-login-dropdown-content">
              <Link to="/login" className="navcus-dropdown-link">
                Customer Login
              </Link>
                      <Link to="/staff-login">
                <button className="btn btn-secondary" style={{ padding: "10px 20px", fontSize: "16px" }}>
                  Manager Login
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Nav;
