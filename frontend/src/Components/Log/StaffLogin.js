// src/Components/Log/StaffLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImage from "./background.jpeg";
import Nav from "../NavCus/NavCus";
import Footer from "../Footer/Footer";

function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/staff/login", {
        email,
        password,
      });

      if (res.data.status === "success") {
        const { staffType, token, name, id } = res.data;

        // Store the token and staff info in localStorage
        localStorage.setItem("staffToken", token);
        localStorage.setItem("staffType", staffType);
        localStorage.setItem("staffName", name);
        localStorage.setItem("staffId", id);
        localStorage.setItem("staffEmail", email);

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
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
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
        
        button:hover:not(:disabled) {
          background-color: #bfced8ff !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4) !important;
        }
        
        button:active {
          transform: translateY(0);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
                disabled={loading}
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
                disabled={loading}
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

// ✅ Inline Styles Object
const styles = {
  container: {
    position: "relative",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f6f8",
  },
  backgroundImage: {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(4px)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  formContainer: {
    position: "relative",
    zIndex: 2,
    background: "rgba(255,255,255,0.95)",
    padding: "40px 50px",
    borderRadius: "15px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
    animation: "fadeInUp 0.6s ease forwards",
    maxWidth: "400px",
    width: "100%",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "28px",
    color: "#333",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#ba7e06",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
    marginBottom: "10px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
};

export default StaffLogin;
