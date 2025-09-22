// src/Components/Log/StaffLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/staff/login", { email, password });

      if (res.data.status === "success") {
        const { staffType, token } = res.data;
        
        // Store the token in localStorage
        localStorage.setItem("token", token);

        // Redirect managers to their pages
        switch (staffType) {
          case "HR":
            navigate("/Home"); // HR manager
            break;
          case "Supplier":
            navigate("/newhome"); // Supplier manager
            break;
          case "Field":
            navigate("/Dashboard"); // Field manager
            break;
          case "Inventory":
            navigate("/HomeN"); // Inventory manager
            break;
          case "Sales":
            navigate("/sales-manager"); // Sales manager
            break;
          default:
            setError("Invalid manager type");
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "40px", textAlign: "center" }}>
      <h2>Manager Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", width: "100%", padding: "10px", marginBottom: "15px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", width: "100%", padding: "10px", marginBottom: "15px" }}
        />
        <button type="submit" style={{ padding: "10px 20px" }}>Login</button>
      </form>
    </div>
  );
}

export default StaffLogin;
