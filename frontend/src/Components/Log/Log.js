// src/Components/Log/Log.js
import React from "react";
import { Link } from "react-router-dom";


function Log() {
  return (
    <div className="log-container" style={{ textAlign: "center", padding: "50px" }}>
      <h1>Welcome to Epic Green</h1>
      <p>Please choose your destination:</p>
      
      <div className="log-buttons" style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "30px" }}>
        <Link to="/Home">
          <button className="btn btn-primary" style={{ padding: "10px 20px", fontSize: "16px" }}>
            HR manager
          </button>
        </Link>

        <Link to="/newhome">
          <button className="btn btn-secondary" style={{ padding: "10px 20px", fontSize: "16px" }}>
            Supplier manager
          </button>
        </Link>

        <Link to="/Dashboard">
          <button className="btn btn-secondary" style={{ padding: "10px 20px", fontSize: "16px" }}>
            Field manager
          </button>
        </Link>


        <Link to="/HomeN">
          <button className="btn btn-secondary" style={{ padding: "10px 20px", fontSize: "16px" }}>
            Inventory manager
          </button>
        </Link>

         <Link to="/sales-manager">
          <button className="btn btn-secondary" style={{ padding: "10px 20px", fontSize: "16px" }}>
            Sales manager
          </button>
        </Link>

        
         <Link to="/login">
          <button className="btn btn-secondary" style={{ padding: "10px 20px", fontSize: "16px" }}>
              cus log
          </button>
        </Link>

        <Link to="/staff-login">
  <button className="btn btn-secondary" style={{ padding: "10px 20px", fontSize: "16px" }}>
    Manager Login
  </button>
</Link>


      </div>
    </div>
  );
}

export default Log;
