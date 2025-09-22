import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavSup from "../NavSup/NavSup";
import "./AddFertilizers.css";

function AddFertilizer() {
  const navigate = useNavigate();
  const [input, setInput] = useState({
    fertilizerName: "",
    fType: "",
    quantity: "",
    price: "",
    date: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split("T")[0];

    if (!input.fertilizerName || input.fertilizerName.trim() === '') {
      newErrors.fertilizerName = "Please select a fertilizer";
    }

    if (!input.fType || input.fType.trim() === '') {
      newErrors.fType = "Please select a fertilizer type";
    }

    if (!input.quantity || input.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (!input.price || input.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!input.date || input.date.trim() === '') {
      newErrors.date = "Please select a date";
    } else if (input.date.length !== 10) {
      newErrors.date = "Please select a complete date";
    } else if (input.date < today) {
      newErrors.date = "Date cannot be in the past";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendRequest = async () => {
    try {
      const fertilizerData = {
        fertilizerName: String(input.fertilizerName).trim(),
        fType: String(input.fType).trim(),
        quantity: Number(input.quantity),
        price: Number(input.price),
        date: String(input.date).trim(),
      };

      const response = await axios.post("http://localhost:5000/fertilizers", fertilizerData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      return response.data;
    } catch (err) {
      if (err.response) {
        throw new Error(err.response.data.message || 'Server error');
      } else if (err.request) {
        throw new Error('No response from server. Please check your connection.');
      } else {
        throw new Error(err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await sendRequest();
      alert('Fertilizer added successfully!');
      navigate("/fertilizers");
    } catch (error) {
      alert('Failed to add fertilizer: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <div className="sup-addfertilizer-page">
      <NavSup />
      <div className="sup-addfertilizer-container">
        <h1>Add Fertilizer</h1>
        <p className="sup-subtitle">Fill in fertilizer information and save to the system.</p>

        <div className="sup-addfertilizer-card">
          <form onSubmit={handleSubmit} className="sup-form">
            {/* Fertilizer Name */}
            <div className="sup-form-group">
              <label htmlFor="fertilizerName">Fertilizer Name <span>*</span></label>
              <select
                id="fertilizerName"
                name="fertilizerName"
                value={input.fertilizerName}
                onChange={handleChange}
                required
                className={errors.fertilizerName ? "sup-input-error" : ""}
              >
                <option value="">Select Fertilizer</option>
                <option value="Farmyard Manure">Farmyard Manure</option>
                <option value="Compost">Compost</option>
                <option value="Vermicompost">Vermicompost</option>
                <option value="Green Manure">Green Manure</option>
                <option value="Neem Cake">Neem Cake</option>
                <option value="Castor Cake">Castor Cake</option>
                <option value="Groundnut Cake">Groundnut Cake</option>
                <option value="Coconut Cake">Coconut Cake</option>
                <option value="Bone Meal">Bone Meal</option>
                <option value="Fish Meal">Fish Meal</option>
                <option value="Nitrogen (N) Sources">Nitrogen (N) Sources</option>
                <option value="Phosphorus (P) Sources">Phosphorus (P) Sources</option>
                <option value="Micronutrients">Micronutrients</option>
              </select>
              {errors.fertilizerName && <span className="sup-error-text">{errors.fertilizerName}</span>}
            </div>

            {/* Fertilizer Type */}
            <div className="sup-form-group">
              <label htmlFor="fType">Fertilizer Type <span>*</span></label>
              <select
                id="fType"
                name="fType"
                value={input.fType}
                onChange={handleChange}
                required
                className={errors.fType ? "sup-input-error" : ""}
              >
                <option value="">Select Type</option>
                <option value="organic">Organic</option>
                <option value="chemical">Chemical</option>
                <option value="bio">Bio Fertilizer</option>
              </select>
              {errors.fType && <span className="sup-error-text">{errors.fType}</span>}
            </div>

            {/* Quantity */}
            <div className="sup-form-group">
              <label htmlFor="quantity">Quantity (kg) <span>*</span></label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={input.quantity}
                onChange={handleChange}
                min="1"
                step="1"
                required
                className={errors.quantity ? "sup-input-error" : ""}
              />
              {errors.quantity && <span className="sup-error-text">{errors.quantity}</span>}
            </div>

            {/* Price */}
            <div className="sup-form-group">
              <label htmlFor="price">Price per 1kg (LKR) <span>*</span></label>
              <input
                type="number"
                id="price"
                name="price"
                value={input.price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
                className={errors.price ? "sup-input-error" : ""}
              />
              {errors.price && <span className="sup-error-text">{errors.price}</span>}
            </div>

            {/* Date */}
            <div className="sup-form-group">
              <label htmlFor="date">Manufacture / Entry Date <span>*</span></label>
              <input
                type="date"
                id="date"
                name="date"
                value={input.date}
                onChange={handleChange}
                min={getTodayDate()}
                max="2025-12-31"
                required
                className={errors.date ? "sup-input-error" : ""}
              />
              {errors.date && <span className="sup-error-text">{errors.date}</span>}
              <small className="sup-hint">Date must be today or in the future</small>
            </div>

            <button type="submit" className="sup-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Adding Fertilizer...' : 'Add Fertilizer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddFertilizer;
