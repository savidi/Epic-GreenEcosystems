 import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Newhome.css";
import NavSup from "../NavSup/NavSup";
import Slider from "../Slider/Slider";
import "../Slider/slider.css";
import { BarChart3, Building } from "lucide-react";
import TaskPage from "../Home/TaskPage";

const API = {
  SUPPLIERS: "http://localhost:5000/suppliers",
  FERTILIZERS: "http://localhost:5000/fertilizers",
  POWDERS: "http://localhost:5000/powders",
};

const LOW_STOCK_LIMIT = 50; // kg threshold

function Newhome() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalSuppliers: 0,
    activeFertilizers: 0,
    totalPayments: 0,
    lowStockAlerts: 0,
  });

  const [loading, setLoading] = useState({
    suppliers: true,
    fertilizers: true,
    powders: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all 3 datasets in parallel
        const [supRes, fertRes, powRes] = await Promise.allSettled([
          axios.get(API.SUPPLIERS),
          axios.get(API.FERTILIZERS),
          axios.get(API.POWDERS),
        ]);

        const suppliers =
          supRes.status === "fulfilled" ? supRes.value.data.suppliers || [] : [];
        const fertilizers =
          fertRes.status === "fulfilled" ? fertRes.value.data.fertilizers || [] : [];
        const powders =
          powRes.status === "fulfilled" ? powRes.value.data.powders || [] : [];

        // ✅ Calculate low stock alerts (same logic as Notification.js)
        const groupedTotals = {};

        suppliers.forEach((s) => {
          const name = s.spicename?.trim() || "Unknown Supplier Item";
          groupedTotals[name] = (groupedTotals[name] || 0) + parseFloat(s.qty || 0);
        });

        fertilizers.forEach((f) => {
          const name = f.fertilizerName?.trim() || "Unknown Fertilizer";
          groupedTotals[name] = (groupedTotals[name] || 0) + parseFloat(f.quantity || 0);
        });

        powders.forEach((p) => {
          const name = p.powderName?.trim() || "Unknown Powder";
          groupedTotals[name] = (groupedTotals[name] || 0) + parseFloat(p.quantity || 0);
        });

        const lowStockItems = Object.entries(groupedTotals)
          .filter(([_, total]) => total <= LOW_STOCK_LIMIT)
          .map(([name]) => name);

        // ✅ Calculate total payments (suppliers + fertilizers)
        const totalSupplierPayment = suppliers.reduce(
          (sum, s) => sum + (Number(s.price) || 0),
          0
        );
        const totalFertilizerPayment = fertilizers.reduce(
          (sum, f) =>
            sum + (Number(f.quantity || 0) * Number(f.price || 0)),
          0
        );
        const combinedTotal = totalSupplierPayment + totalFertilizerPayment;

        // ✅ Set dashboard stats
        setStats({
          totalSuppliers: suppliers.length,
          activeFertilizers: fertilizers.length,
          totalPayments: combinedTotal,
          lowStockAlerts: lowStockItems.length,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading({ suppliers: false, fertilizers: false, powders: false });
      }
    };

    fetchData();

    // Optional auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      label: "Total Suppliers",
      value: stats.totalSuppliers,
      loading: loading.suppliers,
      highlight: true,
      icon: <BarChart3 size={22} />,
    },
    {
      label: "Active Fertilizers",
      value: stats.activeFertilizers,
      loading: loading.fertilizers,
      highlight: true,
      icon: <BarChart3 size={22} />,
    },
    {
      label: "Total Payments",
      value: `LKR ${stats.totalPayments.toLocaleString()}`,
      highlight: true,
      icon: <BarChart3 size={22} />,
    },
    {
      label: "Low Stock Alerts",
      value: stats.lowStockAlerts,
      icon: <BarChart3 size={22} />,
    },
  ];

  const quickActionCards = [
    {
      title: "Supplier Management",
      description:
        "Add new suppliers, update contact info, and manage spice supply relationships.",
      icon: <Building size={22} />,
      actions: [
        { label: "Add Supplier", onClick: () => navigate("/Addsup"), primary: true },
        { label: "View All Suppliers", onClick: () => navigate("/Supdet") },
      ],
      stat: `Current Suppliers: ${stats.totalSuppliers}`,
    },
    {
      title: "Fertilizer Management",
      description:
        "Track fertilizer inventory, manage stock levels, and coordinate with suppliers.",
      icon: <Building size={22} />,
      actions: [
        { label: "Add Fertilizer", onClick: () => navigate("/addfertilizers"), primary: true },
        { label: "View Fertilizers", onClick: () => navigate("/fertilizers") },
      ],
      stat: `Current Fertilizers: ${stats.activeFertilizers}`,
    },
    {
      title: "Payment Management",
      description:
        "Record and track payments to suppliers and manage financial transactions.",
      icon: <Building size={22} />,
      actions: [{ label: "View Payments", onClick: () => navigate("/payments") }],
    },
    {
      title: "Stock Information",
      description:
        "Monitor current stock levels, update inventory records, and track spice quantities.",
      icon: <Building size={22} />,
      actions: [{ label: "View Stock Info", onClick: () => navigate("/stock") }],
    },
    {
      title: "Performance and Reviews",
      description:
        "Generate reports on supplier performance for better decision-making.",
      icon: <Building size={22} />,
      actions: [{ label: "Supplier Performance", onClick: () => navigate("/pdfdownloadsp") }],
    },
    {
      title: "Alerts & Notifications",
      description:
        "Monitor low stock alerts, supplier delivery schedules, and system notifications.",
      icon: <Building size={22} />,
      actions: [{ label: "View Alerts", onClick: () => navigate("/notification") }],
    },
  ];

  return (
    <div className="sup-app">
      <div className="sup-sidebar">
        <NavSup />
      </div>

      <div className="sup-main-content">
        <div className="sup-slider-section">
          <Slider />
        </div>

        <div className="sup-header">
          <h1>Welcome back, Supplier Coordinator!</h1>
          <p>Manage suppliers and fertilizers efficiently for your spices management system</p>
        </div>

        <div className="sup-stats-grid">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className={`sup-stat-card ${card.highlight ? "sup-highlight" : ""}`}
            >
              <div className="sup-stat-icon">{card.icon}</div>
              <div className="sup-stat-content">
                <div className="sup-stat-number">
                  {card.loading ? "..." : card.value}
                </div>
                <div className="sup-stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="sup-cards-grid">
          {quickActionCards.map((card, idx) => (
            <div key={idx} className="sup-card">
              <div className="sup-card-header">
                <div className="sup-card-icon">{card.icon}</div>
                <h3 className="sup-card-title">{card.title}</h3>
              </div>
              <p className="sup-card-description">{card.description}</p>
              {card.stat && (
                <div className="sup-card-stat">
                  <strong>{card.stat}</strong>
                </div>
              )}
              <div className="sup-card-actions">
                {card.actions.map((btn, bIdx) => (
                  <button
                    key={bIdx}
                    className={`sup-btn ${
                      btn.primary ? "" : "sup-btn-secondary"
                    } sup-btn-sm`}
                    onClick={btn.onClick}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
               
            </div>
            
          ))}
          <div className="hr-home-chart-column">
            <TaskPage />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Newhome;



