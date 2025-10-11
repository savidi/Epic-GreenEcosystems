 import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./UpdateSupplier.css";
import NavSup from "../NavSup/NavSup";

function UpdateSupplier() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [input, setInput] = useState({
    name: "",
    phoneno: "",
    address: "",
    email: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validation error states
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  /* ------------------- VALIDATION FUNCTIONS ------------------- */
  const validatePhone = (phone) => {
    const phoneRegex = /^(?:\+94|0)?7\d{8}$/; // Sri Lankan mobile number
    if (!phone) {
      setPhoneError("Phone number is required");
      return false;
    } else if (!phoneRegex.test(phone)) {
      setPhoneError("Invalid phone number (e.g. 07XXXXXXXX or +947XXXXXXXX)");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError("");
    return true;
  };

  /* ------------------- FETCH SUPPLIER DATA ------------------- */
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/suppliers/${id}`);
        const supplier = res.data.suppliers || res.data.supplier || res.data;

        setInput({
          name: supplier.name || "",
          phoneno: supplier.phoneno || "",
          address: supplier.address || "",
          email: supplier.email || ""
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching supplier:", err);
        setError("Failed to fetch supplier details");
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id]);

  /* ------------------- UPDATE SUPPLIER ------------------- */
  const sendRequest = async () => {
    return await axios.put(`http://localhost:5000/suppliers/${id}`, {
      name: String(input.name),
      phoneno: Number(input.phoneno),
      address: String(input.address),
      email: String(input.email)
    });
  };

  /* ------------------- HANDLE INPUT CHANGES ------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === "phoneno") validatePhone(value);
    if (name === "email") validateEmail(value);
  };

  /* ------------------- FORM SUBMIT ------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isPhoneValid = validatePhone(input.phoneno);
    const isEmailValid = validateEmail(input.email);

    if (!input.name || !input.address) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!isPhoneValid || !isEmailValid) {
      alert("Please fix validation errors before submitting.");
      return;
    }

    try {
      await sendRequest();
      alert("Supplier updated successfully!");
      navigate("/Supdet");
    } catch (error) {
      alert(`Failed to update supplier: ${error.response?.data?.message || error.message}`);
    }
  };

  /* ------------------- LOADING / ERROR UI ------------------- */
  if (loading) {
    return <p className="sup-loading">Loading supplier details...</p>;
  }

  if (error) {
    return (
      <div className="sup-error">
        <h3>{error}</h3>
        <button onClick={() => navigate("/Supdet")}>Go Back</button>
      </div>
    );
  }

  /* ------------------- FORM UI ------------------- */
  return (
    <div className="sup-page">
      <NavSup /> {/* Sidebar */}

      <div className="sup-content">
        <div className="sup-form-container">
          <h1>Update Supplier</h1>
          <form onSubmit={handleSubmit}>
            
            <div className="sup-form-group">
              <label>Supplier Name *</label>
              <input
                type="text"
                name="name"
                value={input.name}
                onChange={handleChange}
                placeholder="Enter supplier name"
                required
              />
            </div>

            <div className="sup-form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phoneno"
                value={input.phoneno}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
                className={phoneError ? "sup-error-input" : ""}
              />
              {phoneError && <p className="sup-error-message">{phoneError}</p>}
            </div>

            <div className="sup-form-group">
              <label>Address *</label>
              <textarea
                name="address"
                rows="3"
                value={input.address}
                onChange={handleChange}
                placeholder="Enter supplier address"
                required
              />
            </div>

            <div className="sup-form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={input.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
                className={emailError ? "sup-error-input" : ""}
              />
              {emailError && <p className="sup-error-message">{emailError}</p>}
            </div>

            <div className="sup-actions">
              <button
                type="button"
                onClick={() => navigate("/Supdet")}
                className="sup-btn sup-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="sup-btn sup-btn-primary"
                disabled={!!(phoneError || emailError)}
              >
                Update Supplier
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateSupplier;


