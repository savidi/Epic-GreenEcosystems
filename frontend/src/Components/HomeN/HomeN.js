import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import NavInv from "../NavInv/NavInv";
import Showspice from "./Showspice";
import Statscards from "./Statscards";
import Slider from "../Slider/Slider"; // <-- Import Slider

import './HomeN.css';

const API_URL = "http://localhost:5000/spices/totals";

function HomeN() {
  const [spices, setSpices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpices = async () => {
      try {
        const res = await axios.get(API_URL);
        const formattedSpices = res.data.map(item => ({
          name: item.spice,
          currentStock: item.totalQuantity,
          unit: item.unit,
          minStock: 30,
        }));
        setSpices(formattedSpices);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching total spice quantities:", error);
        setLoading(false);
      }
    };
    fetchSpices();
  }, []);

  if (loading) {
    return <div className="inv-loading">Loading...</div>;
  }

  return (
    <div className="inv-layout">
      <NavInv />

      <main className="inv-main">
        {/* Slider Section */}
        <div className="inv-slider-section">
          <Slider /> {/* <-- Slider added here at the top */}
        </div>

       

        {/* Stats Cards */}
        <Statscards spices={spices} />
        
        {/* Show Spice Component */}
        <Showspice />

        {/* Action Buttons */}
        <div className="inv-actions">
          <Link to="/Products/products" className="inv-btn inv-btn-primary">
            Add New Spice
          </Link>
          <Link to="/fertilizer" className="inv-btn inv-btn-secondary">
            Add Fertilizer
          </Link>
        </div>
      </main>
    </div>
  );
}

export default HomeN;


