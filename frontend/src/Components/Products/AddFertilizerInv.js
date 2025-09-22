 import React, { useState } from 'react';
import './AddFertilizerInv.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddFertilizerInv({ onFertilizerAdded }) {
  const [fertilizerName, setName] = useState('');
  const [fType, setType] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/fertilizer/add', {
        fertilizerName,
        fType,
        price,
        quantity,
      });
      alert('Fertilizer Added');
      setName('');
      setType('');
      setPrice('');
      setQuantity('');
      if (onFertilizerAdded) {
        onFertilizerAdded();
      } else {
        navigate('/fertilizerInv');
      }
    } catch (err) {
      alert(err.message);
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
            <input
              type="text"
              placeholder="Enter Name"
              value={fertilizerName}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="inv-form-field">
            <label>Fertilizer Type</label>
            <input
              type="text"
              placeholder="Enter Type"
              value={fType}
              onChange={(e) => setType(e.target.value)}
              required
            />
          </div>

          <div className="inv-form-field">
            <label>Price</label>
            <input
              type="text"
              placeholder="Enter Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="inv-form-field">
            <label>Quantity</label>
            <input
              type="text"
              placeholder="Enter Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="inv-btn">Add Fertilizer</button>
        </form>
      </div>
    </div>
  );
}

export default AddFertilizerInv;

