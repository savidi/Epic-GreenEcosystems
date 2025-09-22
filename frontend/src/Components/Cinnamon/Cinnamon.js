import React from "react";
import Nav from "../Navfield/Navfield";
import "./Spice.css";
import Navfield from "../Navfield/Navfield";

function Cinnamon() {
  return (
    <div className="spice-page">
      
       <Navfield />


      {/* Hero Section */}
      <div className="spice-hero">
        <img
          src="/Users/dilinamacbookair/Desktop/Epic Ecosystems/frontend/src/Components/Images/Cbackground.jpg"
          alt="Cinnamon Banner"
          className="spice-hero-img"
        />
        <div className="spice-hero-text">
          <h1>Cinnamon</h1>
          <p>Master the art of growing and harvesting cinnamon with expert guidance.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="spice-content">
        <img
          src=".Images/Cbackground.jpg"
          alt="Cinnamon Plant"
          className="spice-img"
        />

        <div className="spice-steps">
          <div className="step-card">
            <h3>🌱 Planting</h3>
            <p>
              Select a location with well-drained, loamy soil and partial shade. Plant healthy 
              cuttings or seedlings about 1 meter apart to allow for proper growth and airflow.
              Mulch around the base to retain moisture and suppress weeds.
            </p>
          </div>

          <div className="step-card">
            <h3>💧 Watering</h3>
            <p>
              Maintain consistent soil moisture, watering 2–3 times per week in dry periods. 
              Avoid waterlogging as it can cause root rot. During the rainy season, monitor 
              drainage to prevent excess water accumulation.
            </p>
          </div>

          <div className="step-card">
            <h3>🌿 Fertilization</h3>
            <p>
              Apply well-decomposed organic compost every 3 months to provide essential nutrients.
              Use a balanced NPK fertilizer twice a year to encourage strong growth and improve 
              bark quality. Consider foliar feeding during dry periods to supplement micronutrients.
            </p>
          </div>

          <div className="step-card">
            <h3>🪴 Pruning & Maintenance</h3>
            <p>
              Regularly prune the plants to remove dead branches and promote healthy growth. 
              Thin the canopy to allow sunlight penetration and improve air circulation. 
              Keep the plantation free of weeds and monitor for pests like aphids and scale insects.
            </p>
          </div>

          <div className="step-card">
            <h3>⏳ Harvesting</h3>
            <p>
              Harvest cinnamon bark 2–3 years after planting by carefully cutting mature stems. 
              For premium quality, select 5–6-year-old stems. After harvesting, peel the bark 
              and dry it in a shaded, well-ventilated area to preserve flavor and aroma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cinnamon;
