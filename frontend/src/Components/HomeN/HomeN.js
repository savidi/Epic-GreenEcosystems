
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavInv from "../NavInv/NavInv";
import Showspice from "./Showspice";
import { Link } from 'react-router-dom';
import Statscards from "./Statscards";
import '../Products/products.css'; // Assuming you have a CSS file for styling

// Define the API endpoint for fetching total spice quantities
const API_URL = "http://localhost:5000/spices/totals";

function Home() {
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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <NavInv />
               
       <div className="homen-page-header">
           <h1>🌶️ Spice Management</h1>
       </div>


      <Statscards spices={spices} />
      <Showspice />
      

      <div className="homen-dashboard-buttons">
        <Link to="/Products/products" className="homen-add-button">
          Add Spice
        </Link>
        <Link to="/fertilizer" className="homen-add-button">
          Add Fertilizer
        </Link>
      </div>
    </div>
  );
}

export default Home;


