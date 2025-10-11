// src/Components/Log/StaffLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImage from "./background.jpeg";
import Nav from '../NavCus/NavCus';
import Footer from '../Footer/Footer';

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
            navigate("/Home");
            break;
          case "Supplier":
            navigate("/newhome");
            break;
          case "Field":
            navigate("/Dashboard");
            break;
          case "Inventory":
            navigate("/HomeN");
            break;
          case "Sales":
            navigate("/sales-manager");
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

  const styles = {
    container: {
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    backgroundImage: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      filter: "blur(8px)",
      transform: "scale(1.1)",
      zIndex: -2
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      zIndex: -1
    },
    formContainer: {
      maxWidth: "420px",
      width: "90%",
      padding: "50px 40px",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "20px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      animation: "fadeInUp 0.6s ease-out"
    },
    heading: {
      fontSize: "28px",
      fontWeight: "600",
      color: "#2c3e50",
      marginBottom: "30px",
      textAlign: "center"
    },
    errorMessage: {
      color: "#e74c3c",
      backgroundColor: "#fadbd8",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "20px",
      fontSize: "14px",
      textAlign: "center",
      border: "1px solid #e74c3c"
    },
    form: {
      display: "flex",
      flexDirection: "column"
    },
    inputGroup: {
      marginBottom: "20px"
    },
    input: {
      width: "100%",
      padding: "14px 16px",
      fontSize: "15px",
      border: "2px solid #e0e0e0",
      borderRadius: "10px",
      outline: "none",
      transition: "all 0.3s ease",
      backgroundColor: "#fff",
      boxSizing: "border-box"
    },
button: {
      width: "100%",
      padding: "14px",
      fontSize: "16px",
      fontWeight: "600",
      color: "#fff",
      backgroundColor: "#e0721e",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "10px",
      boxShadow: "0 4px 15px rgba(224, 114, 30, 0.3)"
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        input:focus {
          border-color: #3498db !important;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1) !important;
        }
        
        button:hover {
          background-color: #bfced8ff !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4) !important;
        }
        
        button:active {
          transform: translateY(0);
        }
      `}</style>
      <Nav /> 
      <div style={styles.container}>
        
        <div style={styles.backgroundImage}></div>
        <div style={styles.overlay}></div>
        
        <div style={styles.formContainer}>
          <h2 style={styles.heading}>Manager Login</h2>
          
          {error && <p style={styles.errorMessage}>{error}</p>}
          
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            
            <button type="submit" style={styles.button}>
              Login
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default StaffLogin;