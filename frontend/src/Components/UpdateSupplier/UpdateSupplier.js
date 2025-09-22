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

  // Fetch supplier details
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

  // Update supplier
  const sendRequest = async () => {
    return await axios.put(`http://localhost:5000/suppliers/${id}`, {
      name: String(input.name),
      phoneno: Number(input.phoneno),
      address: String(input.address),
      email: String(input.email)
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.name || !input.phoneno || !input.address || !input.email) {
      alert("Please fill in all required fields.");
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
              />
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
              />
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

