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
    <div className="homen-spice-gallery">
      <h1 className="homen-gallery-title">🌿 Spice Gallery 🌿</h1>

      {/* Display Grids */}
      <div className="homen-spice-grid">
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
              <h3>{grid.name}</h3>
              <p>{grid.description}</p>
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