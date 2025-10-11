 import React, { useState } from 'react';
import './AddFertilizerInv.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddFertilizerInv({ onFertilizerAdded }) {
  const [fertilizerName, setName] = useState('');
  const [fType, setType] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const fertilizerOptions = [
    { name: 'Urea', type: 'Chemical' },
    { name: 'TSP', type: 'Chemical' },
    { name: 'MOP', type: 'Chemical' },
    { name: 'AgroStar', type: 'Organic' },
    { name: 'Harbal', type: 'Organic' },
    { name: 'Compost', type: 'Organic' },
    { name: 'Cow Dung', type: 'Organic' },
    { name: 'Chicken Manure', type: 'Organic' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!fertilizerName) {
      newErrors.fertilizerName = 'Please select a fertilizer';
    }
    
    if (price !== '' && (isNaN(price) || Number(price) <= 0)) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (quantity !== '' && (isNaN(quantity) || Number(quantity) <= 0 || !Number.isInteger(Number(quantity)))) {
      newErrors.quantity = 'Quantity must be a positive whole number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFertilizerChange = (e) => {
    const selectedName = e.target.value;
    setName(selectedName);
    // Auto-set the type based on the selected fertilizer
    const selectedFertilizer = fertilizerOptions.find(f => f.name === selectedName);
    if (selectedFertilizer) {
      setType(selectedFertilizer.type);
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setPrice(value);
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Allow only whole numbers
    if (value === '' || /^\d+$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return; // Don't submit if validation fails
    }
    
    try {
      await axios.post('http://localhost:5000/fertilizer/add', {
        fertilizerName,
        fType,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
      });
      alert('Fertilizer Added');
      setName('');
      setType('');
      setPrice('');
      setQuantity('');
      setErrors({});
      
      if (onFertilizerAdded) {
        onFertilizerAdded();
      } else {
        navigate('/fertilizerInv');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding fertilizer');
    }
  };

  return (
    <div className="inv-layout">
      <div className="inv-main-content">
        <div className="inv-header">
          <h1>Add New Fertilizer</h1>
          <p>Fill out the form to add a fertilizer to the inventory</p>
        </div>

        <form className="inv-form" onSubmit={handleSubmit}>
          <div className="inv-form-field">
            <label>Fertilizer Name</label>
            <select
              value={fertilizerName}
              onChange={handleFertilizerChange}
              className={errors.fertilizerName ? 'error-input' : ''}
              required
            >
              <option value="">-- Select Fertilizer --</option>
              {fertilizerOptions.map((fertilizer, index) => (
                <option key={index} value={fertilizer.name}>
                  {fertilizer.name}
                </option>
              ))}
            </select>
            {errors.fertilizerName && (
              <span className="error-message">{errors.fertilizerName}</span>
            )}
          </div>

          <div className="inv-form-field">
            <label>Fertilizer Type</label>
            <input
              type="text"
              placeholder="Type will be auto-filled"
              value={fType}
              readOnly
              className="readonly-input"
              required
            />
          </div>

          <div className="inv-form-field">
            <label>Price (LKR)</label>
            <input
              type="text"
              placeholder="Enter Price"
              value={price}
              onChange={handlePriceChange}
              required
              className={errors.price ? 'error-input' : ''}
            />
            {errors.price && <span className="error-message">{errors.price}</span>}
          </div>

          <div className="inv-form-field">
            <label>Quantity (kg)</label>
            <input
              type="text"
              placeholder="Enter Quantity"
              value={quantity}
              onChange={handleQuantityChange}
              required
              className={errors.quantity ? 'error-input' : ''}
            />
            {errors.quantity && <span className="error-message">{errors.quantity}</span>}
          </div>

          <button type="submit" className="inv-btn">Add Fertilizer</button>
        </form>
      </div>
    </div>
  );
}

export default AddFertilizerInv;

