 import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddSupplier.css'; // styled consistently
import NavSup from "../NavSup/NavSup";

function AddSupplier() {
  const navigate = useNavigate();
  const [input, setInput] = useState({
    name: "",
    phoneno: "",
    address: "",
    email: "",
    date: "",
    spicename: "",
    qty: "",
    price: ""
  });

  const [dateError, setDateError] = useState("");

  const validateDate = (selectedDate) => {
    if (!selectedDate) {
      setDateError("Date is required");
      return false;
    }
    const today = new Date();
    const selected = new Date(selectedDate);
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      setDateError("Registration date cannot be in the past");
      return false;
    }
    setDateError("");
    return true;
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: value }));
    if (name === 'date') validateDate(value);
  };

  const handleDateBlur = (e) => {
    validateDate(e.target.value);
  };

  const sendRequest = async () => {
    try {
      await axios.post("http://localhost:5000/suppliers", {
        name: String(input.name),
        phoneno: Number(input.phoneno),
        address: String(input.address),
        email: String(input.email),
        date: String(input.date),
        spicename: String(input.spicename),
        qty: Number(input.qty),
        price: Number(input.price)
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add supplier. Check console for details.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isDateValid = validateDate(input.date);

    if (!isDateValid) {
      alert("Please fix the date error before submitting");
      return;
    }

    if (!input.name || !input.phoneno || !input.address || !input.email ||
        !input.date || !input.spicename || !input.qty || !input.price) {
      alert("Please fill in all required fields");
      return;
    }

    sendRequest().then(() => navigate("/Supdet"));
  };

  return (
    <div className="sup-page">
      <NavSup />
      <div className="sup-main-content">
        <div className="sup-header">
          <h1>Add Supplier</h1>
          <p>Fill in supplier information and save to the system.</p>
        </div>

        <div className="sup-form-card">
          <form onSubmit={handleSubmit} className="sup-form">
            
            <div className="sup-form-group">
              <label htmlFor="supplierName">Supplier Name</label>
              <input 
                type="text" 
                id="supplierName" 
                name="name" 
                value={input.name} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="sup-form-group">
              <label htmlFor="supplierPhone">Phone Number</label>
              <input 
                type="tel" 
                id="supplierPhone" 
                name="phoneno" 
                value={input.phoneno} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="sup-form-group">
              <label htmlFor="supplierAddress">Address</label>
              <textarea 
                id="supplierAddress" 
                name="address" 
                rows="3" 
                value={input.address} 
                onChange={handleChange} 
                required
              ></textarea>
            </div>

            <div className="sup-form-group">
              <label htmlFor="supplierEmail">Email</label>
              <input 
                type="email" 
                id="supplierEmail" 
                name="email" 
                value={input.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="sup-form-group">
              <label htmlFor="supplierDate">Registration Date</label>
              <input 
                type="date" 
                id="supplierDate" 
                name="date" 
                value={input.date} 
                onChange={handleChange}
                onBlur={handleDateBlur}
                min={getTodayDate()}
                required 
                className={dateError ? 'sup-error-input' : ''}
              />
              {dateError && <p className="sup-error-message">{dateError}</p>}
            </div>

            <div className="sup-form-group">
              <label htmlFor="spiceName">Spice Type</label>
              <select 
                id="spiceName" 
                name="spicename" 
                value={input.spicename} 
                onChange={handleChange} 
                required
              >
                <option value="">Select Spice Type</option>
                <option value="cinnamon">Cinnamon</option>
                <option value="black-pepper">Black Pepper</option>
                <option value="cardamom">Cardamom</option>
                <option value="cloves">Cloves</option>
                <option value="nutmeg">Nutmeg</option>
                <option value="turmeric">Turmeric</option>
              </select>
            </div>

            <div className="sup-form-group">
              <label htmlFor="quantity">Quantity (kg)</label>
              <input 
                type="number" 
                id="quantity" 
                name="qty" 
                value={input.qty} 
                onChange={handleChange} 
                min="1" 
                required 
              />
            </div>

            <div className="sup-form-group">
              <label htmlFor="price">Price (LKR)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={input.price}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="sup-actions">
              <button type="submit" className="sup-btn" disabled={dateError !== ""}>
                Add Supplier
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddSupplier;
