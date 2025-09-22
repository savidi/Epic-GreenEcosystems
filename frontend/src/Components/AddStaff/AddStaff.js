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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/staff", formData);
      navigate("/staffManagement");
    } catch (err) {
      console.error(err);
    }
  };

  return (

     <div className="addstaff-add-staff-page">
            <Nav /> {/* Sidebar */}


    <div className="addstaff-add-staff-container">
      <h2>Add Staff</h2>
      <form className="addstaff-add-staff-form" onSubmit={handleSubmit}>
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
            onChange={handleChange}
            required
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
          <label>accountNo</label>
          <input
            type="number"
            name="accountNo"
            placeholder="accountNo"
            value={formData.accountNo}
            onChange={handleChange}
            required
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
            <option value="">Select position</option>
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
