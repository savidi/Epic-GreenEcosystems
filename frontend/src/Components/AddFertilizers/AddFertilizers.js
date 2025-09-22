import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavSup from "../NavSup/NavSup";

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
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Enhanced validation function
  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split("T")[0];

    // Validate fertilizer name
    if (!input.fertilizerName || input.fertilizerName.trim() === '') {
      newErrors.fertilizerName = "Please select a fertilizer";
    }

    // Validate fertilizer type
    if (!input.fType || input.fType.trim() === '') {
      newErrors.fType = "Please select a fertilizer type";
    }

    // Validate quantity
    if (!input.quantity || input.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    // Validate price
    if (!input.price || input.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    // Enhanced date validation
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
      console.log('Sending fertilizer data:', input);
      
      // Prepare clean data
      const fertilizerData = {
        fertilizerName: String(input.fertilizerName).trim(),
        fType: String(input.fType).trim(),
        quantity: Number(input.quantity),
        price: Number(input.price),
        date: String(input.date).trim(),
      };

      // Double-check the data before sending
      console.log('Clean fertilizer data:', fertilizerData);
      
      // Validate JSON serialization
      const jsonString = JSON.stringify(fertilizerData);
      console.log('JSON to send:', jsonString);
      
      const response = await axios.post("http://localhost:5000/fertilizers", fertilizerData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('Server response:', response.data);
      return response.data;
      
    } catch (err) {
      console.error('Request failed:', err);
      
      if (err.response) {
        // Server responded with error status
        console.error('Server error response:', err.response.data);
        throw new Error(err.response.data.message || err.response.data.error || 'Server error');
      } else if (err.request) {
        // Request was made but no response received
        console.error('No response received:', err.request);
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something else happened
        console.error('Request setup error:', err.message);
        throw new Error(err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) return;
    
    console.log('Form submitted with data:', input);
    
    // Validate form
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await sendRequest();
      alert('Fertilizer added successfully!');
      navigate("/fertilizers");
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to add fertilizer: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <div className="addfertilizers-main-content">
      <NavSup />
      <div className="addfertilizers-header">
        <h1>Add Fertilizer</h1>
        <p>Fill in fertilizer information and save to the system.</p>
        
      </div>

      <div className="addfertilizers-card">
        <form onSubmit={handleSubmit}>
          {/* Fertilizer Name */}
          <div className="addfertilizers-form-group">
            <label htmlFor="fertilizerName">
              Fertilizer Name <span style={{color: 'red'}}>*</span>
            </label>
            <select
              id="fertilizerName"
              name="fertilizerName"
              value={input.fertilizerName}
              onChange={handleChange}
              required
              style={{
                borderColor: errors.fertilizerName ? 'red' : '',
                outline: errors.fertilizerName ? '1px solid red' : ''
              }}
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
            {errors.fertilizerName && (
              <span style={{color: 'red', fontSize: '12px'}}>{errors.fertilizerName}</span>
            )}
          </div>

          {/* Fertilizer Type */}
          <div className="addfertilizers-form-group">
            <label htmlFor="fType">
              Fertilizer Type <span style={{color: 'red'}}>*</span>
            </label>
            <select
              id="fType"
              name="fType"
              value={input.fType}
              onChange={handleChange}
              required
              style={{
                borderColor: errors.fType ? 'red' : '',
                outline: errors.fType ? '1px solid red' : ''
              }}
            >
              <option value="">Select Type</option>
              <option value="organic">Organic</option>
              <option value="chemical">Chemical</option>
              <option value="bio">Bio Fertilizer</option>
            </select>
            {errors.fType && (
              <span style={{color: 'red', fontSize: '12px'}}>{errors.fType}</span>
            )}
          </div>

          {/* Quantity */}
          <div className="addfertilizers-form-group">
            <label htmlFor="quantity">
              Quantity (kg) <span style={{color: 'red'}}>*</span>
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={input.quantity}
              onChange={handleChange}
              min="1"
              step="1"
              required
              style={{
                borderColor: errors.quantity ? 'red' : '',
                outline: errors.quantity ? '1px solid red' : ''
              }}
            />
            {errors.quantity && (
              <span style={{color: 'red', fontSize: '12px'}}>{errors.quantity}</span>
            )}
          </div>

          {/* Price */}
          <div className="addfertilizers-form-group">
            <label htmlFor="price">
              Price per 1kg (LKR) <span style={{color: 'red'}}>*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={input.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              style={{
                borderColor: errors.price ? 'red' : '',
                outline: errors.price ? '1px solid red' : ''
              }}
            />
            {errors.price && (
              <span style={{color: 'red', fontSize: '12px'}}>{errors.price}</span>
            )}
          </div>

          {/* Date */}
          <div className="addfertilizers-form-group">
            <label htmlFor="date">
              Manufacture / Entry Date <span style={{color: 'red'}}>*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={input.date}
              onChange={handleChange}
              min={getTodayDate()}
              max="2025-12-31"
              required
              style={{
                borderColor: errors.date ? 'red' : '',
                outline: errors.date ? '1px solid red' : ''
              }}
            />
            {errors.date && (
              <span style={{color: 'red', fontSize: '12px'}}>{errors.date}</span>
            )}
            <small style={{color: '#666', fontSize: '12px'}}>
              Date must be today or in the future
            </small>
          </div>

          {/* Submit Button */}
          <div className="addfertilizers-modal-actions">
            <button 
              type="submit" 
              className="addfertilizers-btn"
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Adding Fertilizer...' : 'Add Fertilizer'}
            </button>
          </div>
        </form>

        {/* Debug info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{marginTop: '20px', padding: '10px', background: '#f5f5f5', fontSize: '12px'}}>
            <strong>Debug Info:</strong>
            <pre>{JSON.stringify(input, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddFertilizer;