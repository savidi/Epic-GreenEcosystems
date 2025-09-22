import React, { useState } from 'react';
import '../../App.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddFertilizer({ onFertilizerAdded }) {
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
        navigate('/fertilizerInv'); // Navigate to the fertilizer list page if no prop is provided
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className='addfertilizerinv-form-container'>
      <form onSubmit={handleSubmit}>
        <h2>Add New Fertilizer</h2>
        <div className='addfertilizerinv-form-fields'>
          <div className='addfertilizerinv-field'>
            <label>Fertilizer Name</label>
             <input
              type='text'
              placeholder='Enter Name'
              name='name'
              value={fertilizerName}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className='addfertilizerinv-field'>
            <label>Fertilizer Type</label>
             <input
              type='text'
              placeholder='Enter Type'
              name='type'
              value={fType}
              onChange={(e) => setType(e.target.value)}
              required
            />
          </div>

          <div className='addfertilizerinv-field'>
            <label>Price</label>
            <input
              type='text'
              placeholder='Enter Price'
              name='price'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className='addfertilizerinv-field'>
            <label>Quantity</label>
            <input
              type='text'
              placeholder='Enter Quantity'
              name='quantity'
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
        </div>

        <button type='submit'>
          Add Fertilizer
        </button>
      </form>
    </div>
  );
}

export default AddFertilizer;
