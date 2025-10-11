import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddSupplier.css';
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
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  /* ------------------- VALIDATIONS ------------------- */
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

  const validatePhone = (phone) => {
    const phoneRegex = /^(?:\+94|0)?7\d{8}$/; // Sri Lankan mobile format
    if (!phone) {
      setPhoneError("Phone number is required");
      return false;
    } else if (!phoneRegex.test(phone)) {
      setPhoneError("Invalid phone number format (e.g. 07XXXXXXXX or +947XXXXXXXX)");
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

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  /* ------------------- INPUT HANDLERS ------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: value }));

    if (name === 'date') validateDate(value);
    if (name === 'phoneno') validatePhone(value);
    if (name === 'email') validateEmail(value);
  };

  const handleDateBlur = (e) => validateDate(e.target.value);

  /* ------------------- EMAIL + REQUEST ------------------- */
  const sendEmail = async () => {
    await axios.post("http://localhost:5000/send-email", {
      to: input.email,
      subject: "Supplier Registration Confirmation",
      supplierData: { ...input }
    });
  };

  const sendRequest = async () => {
    await axios.post("http://localhost:5000/suppliers", {
      ...input,
      phoneno: Number(input.phoneno),
      qty: Number(input.qty),
      price: Number(input.price),
    });
  };

  /* ------------------- FORM SUBMIT ------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isDateValid = validateDate(input.date);
    const isPhoneValid = validatePhone(input.phoneno);
    const isEmailValid = validateEmail(input.email);

    if (!isDateValid || !isPhoneValid || !isEmailValid) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

    if (!input.name || !input.address || !input.spicename || !input.qty || !input.price) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await sendRequest();
      await sendEmail();
      alert("Supplier added successfully and confirmation email sent!");
      navigate("/Supdet");
    } catch (error) {
      console.error("Error:", error);
      alert("Supplier added but email failed to send. Please check email configuration.");
      navigate("/Supdet");
    }
  };

  /* ------------------- JSX ------------------- */
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
                maxLength={12}
                value={input.phoneno} 
                onChange={handleChange} 
                required 
                className={phoneError ? 'sup-error-input' : ''}
              />
              {phoneError && <p className="sup-error-message">{phoneError}</p>}
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
                className={emailError ? 'sup-error-input' : ''}
              />
              {emailError && <p className="sup-error-message">{emailError}</p>}
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
              <button type="submit" className="sup-btn" disabled={!!(dateError || phoneError || emailError)}>
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