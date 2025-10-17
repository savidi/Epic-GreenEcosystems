import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import backgroundImage from "./background.jpeg";
import Nav from "../NavCus/NavCus";
import Footer from "../Footer/Footer";

function Registermng() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    nationalId: "",
    age: "",
    gender: "",
    email: "",
    password: "",
    accountNo: "",
    staffType: "",
    position: "Manager",
  });

  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/staff", formData);
      navigate("/staffManagement");
    } catch (err) {
      if (err.response) {
        const message = err.response.data?.message || err.response.data;
        const status = err.response.status;
        if (status === 400 && message.includes("exists")) {
          setErrorMsg("Email or National ID already exists!");
        } else {
          setErrorMsg(message || "Failed to add staff.");
        }
      } else {
        setErrorMsg("Server error or no response.");
      }
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

        input:focus, select:focus {
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
      `}</style>
      <Nav />
      <div style={styles.container}>
        <div style={styles.backgroundImage}></div>
        <div style={styles.overlay}></div>

        <div style={styles.formContainer}>
          <h2 style={styles.heading}>Manager Registration</h2>

          {errorMsg && <p style={styles.errorMessage}>{errorMsg}</p>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {renderInput("Name", "text", "name", formData.name, handleChange)}
            {renderInput("National ID", "text", "nationalId", formData.nationalId, (e) => {
              const value = e.target.value;
              if (value.length <= 16) {
                setFormData({ ...formData, nationalId: value });
              }
            }, {
              onBlur: () => {
                const len = formData.nationalId.length;
                if (len !== 12 && len !== 16) {
                  alert("National ID must be 12 or 16 digits.");
                }
              },
              maxLength: 16
            })}

            {renderInput("Age", "number", "age", formData.age, handleChange, {
              onKeyDown: (e) => e.key === "-" && e.preventDefault(),
              onInput: (e) => {
                if (e.target.value.length > 2) {
                  e.target.value = e.target.value.slice(0, 2);
                }
              }
            })}

            {renderSelect("Gender", "gender", formData.gender, handleChange, ["Male", "Female"])}
            {renderInput("Email", "email", "email", formData.email, handleChange)}
            {renderInput("Password", "password", "password", formData.password, handleChange)}

            {renderInput("Account No", "number", "accountNo", formData.accountNo, (e) => {
              const value = e.target.value;
              if (value.length <= 16) {
                setFormData({ ...formData, accountNo: value });
              }
            }, {
              onBlur: () => {
                if (formData.accountNo.length !== 16) {
                  alert("Account number must be exactly 16 digits.");
                }
              }
            })}

            {renderSelect("Department", "staffType", formData.staffType, handleChange, [
              "Inventory", "Sales", "Supplier", "Field", "HR"
            ])}

            {renderSelect("Position", "position", formData.position, handleChange, ["Manager"])}

            <button type="submit" style={styles.button}>Register</button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

function renderInput(label, type, name, value, onChange, extraProps = {}) {
  return (
    <div style={styles.inputGroup}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        style={styles.input}
        {...extraProps}
      />
    </div>
  );
}

function renderSelect(label, name, value, onChange, options) {
  return (
    <div style={styles.inputGroup}>
      <label style={styles.label}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required
        style={styles.input}
      >
        <option value="">Select {label}</option>
        {options.map((opt, i) => (
          <option value={opt} key={i}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

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
  padding: "30px 40px",           // ⬅️ Reduced padding
  borderRadius: "15px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
  animation: "fadeInUp 0.6s ease forwards",
  maxWidth: "500px",              // ⬅️ Reduced from 600px
  width: "100%",
},

  heading: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
    color: "#333",
  },
  inputGroup: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "6px",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "8px 14px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#ba7e06",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
    marginBottom: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
};

export default Registermng;
