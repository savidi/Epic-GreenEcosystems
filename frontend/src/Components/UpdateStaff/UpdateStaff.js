import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./UpdateStaff.css"; 
import Nav from "../Nav/Nav";

function UpdateStaff() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    nationalId: "",
    age: "",
    gender: "",
    email: "",
    accountNo: "",
    staffType: "",
    position: "",
  });

  // Fetch staff data by ID
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/staff/${id}`);
        setFormData(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStaff();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/staff/${id}`, formData);
      navigate("/staffManagement");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="updatestaff-update-staff-page">
      <Nav /> {/* Sidebar */}

    <div className="updatestaff-add-staff-container">
      <h2>Update Staff</h2>
      <form className="updatestaff-add-staff-form" onSubmit={handleSubmit}>
        <div className="updatestaff-form-group">
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

        <div className="updatestaff-form-group">
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

        <div className="updatestaff-form-group">
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

        <div className="updatestaff-form-group">
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

        <div className="updatestaff-form-group">
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

         <div className="updatestaff-form-group">
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

        <div className="updatestaff-form-group">
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

        <div className="updatestaff-form-group">
          <label>position</label>
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

        <button type="submit" className="updatestaff-submit-button">
          Update Staff
        </button>
      </form>
    </div>
    </div>
  );
}

export default UpdateStaff;
