import React from 'react';
import { Link} from 'react-router-dom';
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';

function Footer() {
  return (
    <div className="footer-footer-container">
      <div className="footer-footer-content">
        <div className="footer-footer-section about">
          <p>
            Epic Green a spice supply management company from Kandy, Sri Lanka that produces export-quality spices and
            foods.The current range includes Black Pepper, Cinnamon, Turmeric, Caramom, Cloves, and
            Nutmeg. Our products are specially tailored for businesses and resellers, allowing companies to purchase, 
            rebrand, and deliver authentic spices to their own customers with confidence.
          </p>
        </div>
        <div className="footer-footer-section links">
          <h4>Company</h4>
          <ul>
            <li><Link to="/mainhome">Home</Link></li>
            <li><Link to="/mainhome">About us</Link></li>
            <li><Link to="/local-orders">Products</Link></li>
            <li><Link to="/mainhome">Contact Us</Link></li>
          </ul>
        </div>
        <div className="footer-footer-section links">
          <h4>Products</h4>
          <ul>
            <li><Link to="/local-orders">All Products</Link></li>
          </ul>
        </div>
        <div className="footer-footer-section contact">
          <h4>Contact</h4>
          <p>Epic Green Ecosystems Pvt. Ltd.</p>
          <p>466, Thalwatta Rd, Kandy, Sri Lanka</p>
          <p>+94 81 891 2350 | +94 70 613 6100</p>
          <p>info@epicgreen.lk</p>
        </div>
        <div className="footer-footer-section follow-us">
          <h4>Follow us</h4>
          <div className="footer-social-icons">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-footer-bottom">
        <p>&copy; 2025 Copyright information</p>
      </div>
    </div>
  );
}

export default Footer;
