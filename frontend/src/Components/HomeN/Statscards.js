import React, { useState } from "react";
import { TrendingDown } from "lucide-react";
import './cards.css';

const StatsCards = ({ spices, workers }) => {

  const lowStockItems = spices.filter(spice => spice.currentStock <= (spice.minStock || 30));


  const [showLowStockList, setShowLowStockList] = useState(false);


  const handleLowStockClick = () => {
    setShowLowStockList(!showLowStockList);
  };


  return (
    <>
      <div>
        <div className="stats-cards-wrapper">
          <div 
            className="stat-card lowstock-card stat-card-top-border" 
            onClick={handleLowStockClick}
          >
            <TrendingDown className="stat-icon" />
            <div className="stat-text">
              <p className="stat-label">Low Stock Items</p>
              <p className="stat-value">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {showLowStockList && (
        <div className="low-stock-list-container">
          <h3 className="list-title">Spices with Low Stock ( &le; 30kg)</h3>
          <ul className="low-stock-list">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((spice, index) => (
                <li key={index} className="low-stock-item">
                  <span className="item-name">{spice.name}</span>
                  <span className="item-stock">{spice.currentStock}kg</span>
                </li>
              ))
            ) : (
              <p className="no-low-stock">No items are currently low in stock.</p>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default StatsCards;