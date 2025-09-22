

import React, { useState } from "react";
import { TrendingDown } from "lucide-react";
import './cards.css';

const StatsCards = ({ spices, workers }) => {

  const lowStockItems = spices.filter(spice => spice.currentStock <= (spice.minStock || 30));


  const [showLowStockList, setShowLowStockList] = useState(false);


  const handleLowStockClick = () => {
    setShowLowStockList(!showLowStockList);
  };

  const totalStockValue = spices.reduce((sum, spice) => sum + (spice.currentStock * (spice.price || 0)), 0);
  const totalStockValueLKR = (totalStockValue * 300).toFixed(2);

  return (
    <>
      <div>
          <div className="homen-stats-cards-wrapper">
        <div className="homen-stat-card homen-lowstock-card" onClick={handleLowStockClick}>
          <TrendingDown className="homen-stat-icon" />
          <div className="homen-stat-text">
            <p className="homen-stat-label">Low Stock Items</p>
            <p className="homen-stat-value">{lowStockItems.length}</p>
          </div>
          </div>
        </div>
      </div>

      {showLowStockList && (
        <div className="homen-low-stock-list-container">
          <h3 className="homen-list-title">Spices with Low Stock ( &le; 30kg)</h3>
          <ul className="homen-low-stock-list">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((spice, index) => (
                <li key={index} className="homen-low-stock-item">
                  <span className="homen-item-name">{spice.name}</span>
                  <span className="homen-item-stock">{spice.currentStock}kg</span>
                </li>
              ))
            ) : (
              <p className="homen-no-low-stock">No items are currently low in stock.</p>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default StatsCards;






