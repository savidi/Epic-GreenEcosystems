import React, { useEffect, useState } from "react";
import axios from "axios";
import "./cards.css"; // Import the CSS file

function Showspice() {
  const [spices, setSpices] = useState([]);
  const [grids, setGrids] = useState([]);

  useEffect(() => {
    // Fetch /spices
    axios.get("http://localhost:5000/spices")
      .then(res => setSpices(res.data))
      .catch(err => console.error("Error fetching spices:", err));

    // Fetch /grids
    axios.get("http://localhost:5000/grids")
      .then(res => setGrids(res.data))
      .catch(err => console.error("Error fetching grids:", err));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>🌿 Spice Gallery 🌿</h1>

      {/* Display Grids */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "20px" 
        }}
      >
        {grids.length > 0 ? (
          grids.map((grid, index) => (
            <div 
              key={index} 
              className="homen-spice-card"
            >
              <img 
                src={grid.image} 
                alt={grid.name} 
              />
              {console.log("Image URL:", grid.image)}
              <h3 style={{ marginBottom: "10px", color: "#444" }}>{grid.name}</h3>
              <p style={{ color: "#666" }}>{grid.description}</p>
            </div>
          ))
        ) : (
          <p>Loading grids...</p>
        )}
      </div>
    </div>
  );
}

export default Showspice;
