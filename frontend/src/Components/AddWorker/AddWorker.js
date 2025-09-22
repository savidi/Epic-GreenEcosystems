import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddWorker.css'; // Import the CSS
import Nav from "../Nav/Nav";

function AddWorker() {
    const history = useNavigate();

    const [inputs, setInputs] = useState({
        name: "",
        nationalid: "",
        age: "",
        gender: "",
        date: "",
        arrivaltime: "",
        paymentstatus: "Pending" // Set default to match backend
    });

    // ✅ Set current date and time on component mount
    useEffect(() => {
        const now = new Date();
        const currentDate = now.toISOString().split("T")[0];
        const currentTime = now.toTimeString().split(":").slice(0, 2).join(":");

        setInputs((prev) => ({
            ...prev,
            date: currentDate,
            arrivaltime: currentTime,
        }));
    }, []);

    const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting:", inputs);
        sendRequest().then(() => history('/mainFWorker'));
    };

    const sendRequest = async () => {
        try {
            await axios.post("http://localhost:5000/fieldworkers", {
                name: String(inputs.name),
                nationalid: String(inputs.nationalid),
                age: Number(inputs.age),
                gender: String(inputs.gender),
                date: new Date(inputs.date),
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
            <Nav /> {/* Sidebar */}

        <div className="addworker-form-container">
            <h1>Add Worker</h1>
            <form onSubmit={handleSubmit}>
                <label>Name</label>
                <input type="text" name="name" onChange={handleChange} value={inputs.name} required />

                <label>National ID</label>
                <input type="text" name="nationalid" onChange={handleChange} value={inputs.nationalid} required />

                <label>Age</label>
                <input type="number" name="age" onChange={handleChange} min="16" max="100" value={inputs.age} required />

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
    )
}

export default AddWorker;