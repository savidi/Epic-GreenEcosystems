 import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Newhome.css";
import NavSup from "../NavSup/NavSup";

// Import images directly
import CinnamonImg from '../Images/Cinnamon.png';
import CardamomImg from '../Images/Cardomom.png';
import TurmericImg from '../Images/Turmeric.png';
import PepperImg from '../Images/Pepper.png';
import CbackgroundImg from '../Images/Cbackground.png';
import RedChilliImg from '../Images/RedChilli.png';

// ✅ Import icons from lucide-react
import { BarChart3, Building } from "lucide-react";

const API = {
  SUPPLIERS: "http://localhost:5000/suppliers",
  FERTILIZERS: "http://localhost:5000/fertilizers"
};

/* -------------------- Helper Functions -------------------- */
const fetchData = async (url, key) => {
  try {
    const res = await axios.get(url);
    return res.data[key] || [];
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    return [];
  }
};

const getTodayTotalPrice = async () => {
  const fertilizers = await fetchData(API.FERTILIZERS, 'fertilizers');
  const today = new Date().toISOString().split("T")[0];

  return fertilizers.reduce((sum, f) => {
    const qty = Number(f.quantity) || 0;
    const price = Number(f.price) || 0;
    const recordDate = f.date ? f.date.split("T")[0] : null;
    return recordDate === today ? sum + qty * price : sum;
  }, 0);
};

/* -------------------- Slider Component -------------------- */
const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    { title: "CINNAMON", description: "Premium cinnamon cultivation with traditional farming methods.", image: CinnamonImg },
    { title: "CARDAMOM", description: "Queen of spices grown in perfect climate conditions.", image: CardamomImg },
    { title: "TURMERIC", description: "Golden turmeric with exceptional quality and color.", image: TurmericImg },
    { title: "PEPPER", description: "King of spices cultivated with care and expertise.", image: PepperImg },
    { title: "RED CHILI", description: "Premium red chili cultivation with rich flavor.", image: RedChilliImg },
    { title: "SPICES", description: "Diverse spice ecosystem in perfect harmony.", image: CbackgroundImg }
  ];

  const nextSlide = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slider-container">
      <div className="slides-wrapper">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide-item ${index === currentIndex ? 'active' : ''}`}
            style={{
              backgroundImage: `linear-gradient(rgba(61, 41, 20, 0.4), rgba(61, 41, 20, 0.6)), url(${slide.image})`,
            }}
          >
            <div className="slide-content">
              <h2 className="slide-title">{slide.title}</h2>
              <p className="slide-description">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Buttons */}
      <button className="slider-btn prev-btn" onClick={prevSlide}>‹</button>
      <button className="slider-btn next-btn" onClick={nextSlide}>›</button>
      
      {/* Dots Indicator */}
      <div className="slider-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

/* -------------------- Main Home Component -------------------- */
function Newhome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    activeFertilizers: 0,
    todayTotalPrice: 0,
    lowStockAlerts: 3,
    totalPayments: 0
  });

  const [loading, setLoading] = useState({
    suppliers: true,
    fertilizers: true,
    price: true
  });

  /* -------------------- Load Stats -------------------- */
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [suppliers, fertilizers, price] = await Promise.all([
          fetchData(API.SUPPLIERS, 'suppliers'),
          fetchData(API.FERTILIZERS, 'fertilizers'),
          getTodayTotalPrice()
        ]);

        setStats(prev => ({
          ...prev,
          totalSuppliers: suppliers.length,
          activeFertilizers: fertilizers.length,
          todayTotalPrice: price
        }));
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading({ suppliers: false, fertilizers: false, price: false });
      }
    };

    loadStats();
  }, []);

  const statCards = [
    { label: 'Total Suppliers', value: stats.totalSuppliers, loading: loading.suppliers, highlight: true, icon: <BarChart3 size={22} /> },
    { label: 'Active Fertilizers', value: stats.activeFertilizers, loading: loading.fertilizers, highlight: true, icon: <BarChart3 size={22} /> },
    { label: "Total Value (Today)", value: `Rs. ${stats.todayTotalPrice.toLocaleString()}`, loading: loading.price, highlight: true, icon: <BarChart3 size={22} /> },
    { label: "Low Stock Alerts", value: stats.lowStockAlerts, icon: <BarChart3 size={22} /> }
  ];

  const quickActionCards = [
    {
      title: 'Supplier Management',
      description: 'Add new suppliers, update contact info, and manage spice supply relationships.',
      icon: <Building size={22} />,
      actions: [
        { label: 'Add Supplier', onClick: () => navigate("/Addsup"), primary: true },
        { label: 'View All Suppliers', onClick: () => navigate("/Supdet") }
      ],
      stat: `Current Suppliers: ${stats.totalSuppliers}`
    },
    {
      title: 'Fertilizer Management',
      description: 'Track fertilizer inventory, manage stock levels, and coordinate with suppliers.',
      icon: <Building size={22} />,
      actions: [
        { label: 'Add Fertilizer', onClick: () => navigate("/addfertilizers"), primary: true },
        { label: 'View Fertilizers', onClick: () => navigate("/fertilizers") }
      ],
      stat: `Current Fertilizers: ${stats.activeFertilizers}`
    },
    {
      title: 'Payment Management',
      description: 'Record and track payments to suppliers and manage financial transactions.',
      icon: <Building size={22} />,
      actions: [
        { label: 'View Payments', onClick: () => navigate("/payments") }
      ]
    },
    {
      title: 'Stock Information',
      description: 'Monitor current stock levels, update inventory records, and track spice quantities.',
      icon: <Building size={22} />,
      actions: [
        { label: 'View Stock Info', onClick: () => navigate("/stock") }
      ]
    },
    {
      title: 'Performance and Reviews',
      description: 'Generate reports on supplier performance for better decision-making.',
      icon: <Building size={22} />,
      actions: [
        { label: 'Supplier Performance', onClick: () => navigate("/pdfdownloadsp") }
      ]
    },
    {
      title: 'Alerts & Notifications',
      description: 'Monitor low stock alerts, supplier delivery schedules, and system notifications.',
      icon: <Building size={22} />,
      actions: [
        { label: 'View Alerts', onClick: () => {} ,primary: true},
        { label: 'Settings', onClick: () => {} }
      ]
    }
  ];

  return (
    <div className="sup-app">
      <div className="sup-sidebar">
        <NavSup />
      </div>

      <div className="sup-main-content">
        {/* Slider Section */}
        <div className="sup-slider-section">
          <Slider />
         
          {/* Header */}
          <div className="sup-header">
            <h1>Welcome back, Supplier Coordinator!</h1>
            <p>Manage suppliers and fertilizers efficiently for your spices management system</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="sup-stats-grid">
          {statCards.map((card, idx) => (
            <div key={idx} className={`sup-stat-card ${card.highlight ? 'sup-highlight' : ''}`}>
              <div className="sup-stat-icon">{card.icon}</div>
              <div className="sup-stat-content">
                <div className="sup-stat-number">{card.loading ? '...' : card.value}</div>
                <div className="sup-stat-label">{card.label}</div>
                {card.loading && <div className="sup-stat-status">Loading...</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Action Cards Section */}
        <div className="sup-cards-grid">
          {quickActionCards.map((card, idx) => (
            <div key={idx} className="sup-card">
              <div className="sup-card-header">
                <div className="sup-card-icon">{card.icon}</div>
                <h3 className="sup-card-title">{card.title}</h3>
              </div>
              <p className="sup-card-description">{card.description}</p>
              {card.stat && <div className="sup-card-stat"><strong>{card.stat}</strong></div>}
              <div className="sup-card-actions">
                {card.actions.map((btn, bIdx) => (
                  <button
                    key={bIdx}
                    className={`sup-btn ${btn.primary ? '' : 'sup-btn-secondary'} sup-btn-sm`}
                    onClick={btn.onClick}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Newhome;

