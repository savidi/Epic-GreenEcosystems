import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddWorker.css'; 
import Nav from "../Nav/Nav";

function AddWorker() {
  const navigate = useNavigate();

  // ✅ Get today's date in local timezone (YYYY-MM-DD)
  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months 0-11
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ✅ Get current time in HH:MM
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [inputs, setInputs] = useState({
    name: "",
    nationalid: "",
    age: "",
    gender: "",
    date: getTodayDate(),        // ✅ defaults to today in local time
    arrivaltime: getCurrentTime(),
    paymentstatus: "Pending"
  });

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendRequest().then(() => navigate('/mainFWorker'));
  };

  const sendRequest = async () => {
    try {
      await axios.post("http://localhost:5000/fieldworkers", {
        name: String(inputs.name),
        nationalid: String(inputs.nationalid),
        age: Number(inputs.age),
        gender: String(inputs.gender),
        date: inputs.date,       // ✅ local date string
        arrivaltime: inputs.arrivaltime,
        departuretime: "",
        workedhoures: 0,
        salary: 0,
        paymentstatus: String(inputs.paymentstatus),
      });
    } catch (error) {
      console.error('Error adding worker:', error);
      alert('Failed to add worker');
    }
  };

  return (
    <div className="addworker-staff-management-page">
      <Nav />

      <div className="addworker-form-container">
        <h1>Add Worker</h1>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input type="text" name="name" onChange={handleChange} value={inputs.name} required />

          <label>National ID</label>
          <input type="text" name="nationalid" onChange={handleChange} value={inputs.nationalid} required />

          <label>Age</label>
          <input type="number" name="age" min="16" max="100" onChange={handleChange} value={inputs.age} required />

          <label>Gender</label>
          <select name="gender" onChange={handleChange} value={inputs.gender} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label>Date</label>
          <input type="date" name="date" onChange={handleChange} value={inputs.date} required />

          <label>Arrival Time</label>
          <input type="time" name="arrivaltime" onChange={handleChange} value={inputs.arrivaltime} required />

          <label>Payment Status</label>
          <select name="paymentstatus" onChange={handleChange} value={inputs.paymentstatus} required>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
          </select>

          <button type="submit">Add Worker</button>
        </form>
      </div>
    </div>
  );
}

export default AddWorker;
