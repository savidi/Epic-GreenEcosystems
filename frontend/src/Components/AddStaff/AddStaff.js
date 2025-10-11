import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddStaff.css";
import Nav from "../Nav/Nav";

function AddStaff() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    nationalId: "",
    age: "",
    gender: "",
    email: "",
    password: "",
    accountNo: "",
    staffType: "",
    position: "",
  });

  const [errorMsg, setErrorMsg] = useState(""); // ✅ Inline error message

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(""); // Clear error message when user types
  };

  // ✅ Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Email validation
    if (!isValidEmail(formData.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/staff", formData);
      navigate("/staffManagement");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        const message = err.response.data.message;
        if (message.includes("exists")) {
          setErrorMsg("Email or National ID already exists!");
        } else {
          setErrorMsg(message || "Failed to add staff. Please try again.");
        }
      } else {
        setErrorMsg("Server error. Please try again later.");
      }
      console.error(err);
    }
  };

  return (
    <div className="addstaff-add-staff-page">
      <Nav />

      <div className="addstaff-add-staff-container">
        <h2>Add Staff</h2>
        <form className="addstaff-add-staff-form" onSubmit={handleSubmit}>
          {errorMsg && <p className="error-message">{errorMsg}</p>}

          <div className="addstaff-form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="addstaff-form-group">
          
  <label>National ID</label>
  <input
    type="text"
    name="nationalId"
    placeholder="National ID"
    value={formData.nationalId}
    onChange={(e) => {
      const value = e.target.value;
      // Limit input to max 16 characters
      if (value.length <= 16) {
        setFormData({ ...formData, nationalId: value });
      }
    }}
    onBlur={() => {
      const len = formData.nationalId.length;
      if (len !== 12 && len !== 16) {
        alert("National ID must be exactly 12 or 16 characters!");
      }
    }}
    required
    maxLength={16}
    onKeyDown={(e) => {
      if (e.key === "-") e.preventDefault();
    }}
  />


          </div>

          <div className="addstaff-form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              required
              onKeyDown={(e) => {
                if (e.key === "-") e.preventDefault();
              }}
              onInput={(e) => {
                if (e.target.value.length > 2) {
                  e.target.value = e.target.value.slice(0, 2);
                }
              }}
            />
          </div>

          <div className="addstaff-form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="addstaff-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="addstaff-form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="addstaff-form-group">
  <label>Account No</label>
  <input
    type="number"
    name="accountNo"
    placeholder="Account No"
    value={formData.accountNo}
    onChange={(e) => {
      const value = e.target.value;
      // Limit input to digits only and max length 16
      if (value.length <= 16) {
        setFormData({ ...formData, accountNo: value });
      }
    }}
    onBlur={() => {
      // Validate exact length when input loses focus
      if (formData.accountNo.length !== 16) {
        alert("Account Number must be exactly 16 digits!");
      }
    }}
    required
    onKeyDown={(e) => {
      if (e.key === "-") e.preventDefault();
    }}
  />
</div>


          <div className="addstaff-form-group">
            <label>Department</label>
            <select
              name="staffType"
              value={formData.staffType}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              <option value="Inventory">Inventory</option>
              <option value="Sales">Sales</option>
              <option value="Supplier">Supplier</option>
              <option value="Field">Field</option>
              <option value="HR">HR</option>
            </select>
          </div>

          <div className="addstaff-form-group">
            <label>Position</label>
            <select
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
            >
              <option value="">Select Position</option>
              <option value="Staff">Staff</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <button type="submit" className="addstaff-submit-button">
            Add Staff
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddStaff;
