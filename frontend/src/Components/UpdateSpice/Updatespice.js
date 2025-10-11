import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './UpdateSpice.css';

function Updatespice() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Initialize with all fields to avoid undefined errors
  const [inputs, setInputs] = useState({
    type: '', // This will map to 'source' in the backend
    name: '',
    currentStock: '', // Renamed from quantity
    unit: '',
    quality: '',
    price: '' // Renamed from sup_price
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpice = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/spices/${id}`);
        const spice = res.data.spice || res.data; // handle different backend responses
        if (spice) {
          setInputs({
            type: spice.source || '', // Map backend 'source' to frontend 'type'
            name: spice.name || '',
            currentStock: spice.currentStock || '',
            unit: spice.unit || '',
            quality: spice.quality || '',
            price: spice.price !== null ? spice.price : '' // Handle null price from backend
          });
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching spice:", err);
        setLoading(false);
      }
    };

    fetchSpice();
  }, [id]);

  const isPriceReadOnly = inputs.type === "Plantation";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => {
        const newState = { ...prev, [name]: value };
        // If source type changes to Plantation, clear price
        if (name === "type" && value === "Plantation") {
            newState.price = "";
        }
        return newState;
    });
  };

  const handlePriceChange = (e) => {
    if (!isPriceReadOnly) {
        handleChange(e);
    }
  };

  const sendRequest = async () => {
    try {
      await axios.put(`http://localhost:5000/spices/${id}`, {
        type: "General Spice", // Placeholder for backend 'type' field
        name: inputs.name,
        currentStock: Number(inputs.currentStock), // Renamed from quantity
        unit: inputs.unit,
        quality: inputs.quality,
        source: inputs.type, // Frontend 'type' maps to backend 'source'
        price: isPriceReadOnly ? null : Number(inputs.price) // Send null if read-only, otherwise send number
      });
    } catch (err) {
      console.error("Error updating spice:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic frontend validation for required fields if not readOnly
    if (!inputs.type || !inputs.name || !inputs.currentStock || !inputs.unit || !inputs.quality || (!isPriceReadOnly && !inputs.price)) {
        alert("Please fill in all required fields.");
        return;
    }
    await sendRequest();
    navigate('/Products/products');
  };

  if (loading) return <p>Loading spice details...</p>;

  return (
    <div className="update-spice-container">
      <h1>Update Spice</h1>
      <form onSubmit={handleSubmit} className="updatespice-form">
        <div className="updatespice-field">
          <label htmlFor="type">Source Type</label>
          <select
            id="type"
            name="type"
            onChange={handleChange}
            value={inputs.type}
            required
          >
            <option value="" disabled>Select a type</option>
            <option value="Supplier">Supplier</option>
            <option value="Plantation">Plantation</option>
          </select>
        </div>

        <div className="updatespice-field">
          <label htmlFor="name">Name</label>
          <select
            id="name"
            name="name"
            onChange={handleChange}
            value={inputs.name}
            required
          >
            <option value="" disabled>Select a Spice</option>
            <option value="Cinnamon">Cinnamon</option>
            <option value="Turmeric">Turmeric</option>
            <option value="Cloves">Cloves</option>
            <option value="Cardamom">Cardamom</option>
            <option value="Black Pepper">Black Pepper</option>
            <option value="Nutmeg">Nutmeg</option>
          </select>
        </div>

        <div className="updatespice-row">
          <div className="updatespice-field">
            <label htmlFor="currentStock">Quantity</label>
            <input
              id="currentStock"
              name="currentStock"
              type="number"
              min="1"
              step="1"
              value={inputs.currentStock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="updatespice-field">
            <label htmlFor="unit">Unit</label>
            <select
              id="unit"
              name="unit"
              value={inputs.unit}
              onChange={handleChange}
              required
            >
            <option value="" disabled>Select unit</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>

        <div className="updatespice-field">
          <label htmlFor="quality">Quality</label>
          <select
            id="quality"
            name="quality"
            value={inputs.quality}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select quality</option>
            <option value="High">High</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="updatespice-field">
          <label htmlFor="price">Supplier Price(Per 100g)</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g., 1250.00"
            value={inputs.price}
            onChange={handlePriceChange}
            required={!isPriceReadOnly}
            readOnly={isPriceReadOnly}
            style={isPriceReadOnly ? { backgroundColor: '#e9e9e9', cursor: 'not-allowed' } : {}} // Visual cue
          />
        </div>

        <button type="submit" className="updatespice-submit-btn">Update</button>
      </form>
    </div>
  );
}

export default Updatespice;
