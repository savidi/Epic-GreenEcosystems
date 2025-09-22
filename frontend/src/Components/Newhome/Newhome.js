import React, { useState, useEffect } from 'react';
import './Newhome.css';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavSup from "../NavSup/NavSup";

const API = {
  SUPPLIERS: "http://localhost:5000/suppliers",
  FERTILIZERS: "http://localhost:5000/fertilizers"
};

// Generic fetch function
const fetchData = async (url, key) => {
  try {
    const res = await axios.get(url);
    return res.data[key] || [];
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    return [];
  }
};

// Get today's total price
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

  // Modal states
  const [modals, setModals] = useState({
    supplier: false,
    fertilizer: false,
    payment: false,
    stock: false
  });

  // Load all stats
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
    { label: 'Total Suppliers', value: stats.totalSuppliers, loading: loading.suppliers, iconClass: 'suppliers-stat', highlight: true },
    { label: 'Active Fertilizers', value: stats.activeFertilizers, loading: loading.fertilizers, iconClass: 'fertilizers-stat', highlight: true },
    { label: "Total Value (Today)", value: `Rs. ${stats.todayTotalPrice.toLocaleString()}`, loading: loading.price, iconClass: 'price-stat', highlight: true },
    { label: "Low Stock Alerts", value: stats.lowStockAlerts, iconClass: 'alerts-stat' }
  ];

  const quickActionCards = [
    {
      title: 'Supplier Management',
      description: 'Add new suppliers, update contact info, and manage spice supply relationships.',
      iconClass: 'supplier-card-icon',
      actions: [
        { label: 'Add Supplier', onClick: () => navigate("/Addsup"), primary: true },
        { label: 'View All Suppliers', onClick: () => navigate("/Supdet") }
      ],
      stat: `Current Suppliers: ${stats.totalSuppliers}`
    },
    {
      title: 'Fertilizer Management',
      description: 'Track fertilizer inventory, manage stock levels, and coordinate with suppliers.',
      iconClass: 'fertilizer-card-icon',
      actions: [
        { label: 'Add Fertilizer', onClick: () => navigate("/addfertilizers"), primary: true },
        { label: 'View Fertilizers', onClick: () => navigate("/fertilizers") }
      ],
      stat: `Current Fertilizers: ${stats.activeFertilizers}`
    },
    {
      title: 'Payment Management',
      description: 'Record and track payments to suppliers and manage financial transactions.',
      iconClass: 'payments-card-icon',
      actions: [
        { label: 'View Payments', onClick: () => navigate("/payments") }
      ]
    },
    {
      title: 'Stock Information',
      description: 'Monitor current stock levels, update inventory records, and track spice quantities.',
      iconClass: 'stock-card-icon',
      actions: [
        { label: 'View Stock Info', onClick: () => navigate("/stock") }
      ]
    },
    {
      title: 'Performance and Reviews',
      description: 'Generate reports on supplier performance for better decision-making.',
      iconClass: 'analytics-card-icon',
      actions: [
        { label: 'Supplier Performance', onClick: () => navigate("/pdfdownloadsp") }
      ]
    },
    {
      title: 'Alerts & Notifications',
      description: 'Monitor low stock alerts, supplier delivery schedules, and system notifications.',
      iconClass: 'alerts-card-icon',
      actions: [
        { label: 'View Alerts', onClick: () => {} },
        { label: 'Settings', onClick: () => {} }
      ]
    }
  ];

  return (

<div className="Nav">
            <NavSup /> {/* Sidebar */}

    <div className="content-section">
      <div className="header">
        <h1>Welcome back, Supplier Coordinator!</h1>
        <p>Manage suppliers and fertilizers efficiently for your spices management system</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card, idx) => (
          <div key={idx} className={`stat-card ${card.highlight ? 'highlight-card' : ''}`}>
            <div className={`stat-icon ${card.iconClass}`}></div>
            <div className="stat-content">
              <div className="stat-number">{card.loading ? '...' : card.value}</div>
              <div className="stat-label">{card.label}</div>
              {card.loading && <div className="stat-status">Loading...</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="cards-grid">
        {quickActionCards.map((card, idx) => (
          <div key={idx} className="card">
            <div className="card-header">
              <div className={`card-icon ${card.iconClass}`}></div>
              <h3 className="card-title">{card.title}</h3>
            </div>
            <p className="card-description">{card.description}</p>
            {card.stat && <div className="card-stat"><strong>{card.stat}</strong></div>}
            <div className="card-actions">
              {card.actions.map((btn, bIdx) => (
                <button
                  key={bIdx}
                  className={`btn ${btn.primary ? '' : 'btn-secondary'}`}
                  onClick={btn.onClick}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal placeholders */}
      {modals.supplier && <div className="modal">Supplier Modal</div>}
      {modals.fertilizer && <div className="modal">Fertilizer Modal</div>}
      {modals.payment && <div className="modal">Payment Modal</div>}
      {modals.stock && <div className="modal">Stock Modal</div>}
    </div>
    </div>
  );
}

export default Newhome;
