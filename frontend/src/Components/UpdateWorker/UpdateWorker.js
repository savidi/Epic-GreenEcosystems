import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './UpdateWorker.css';
import Nav from "../Nav/Nav";

function UpdateWorker() {
  const [inputs, setInputs] = useState({
    name: '',
    nationalid: '',
    age: '',
    gender: '',
    date: '',
    arrivaltime: '',
    departuretime: '',
    workedhoures: '',
    salary: '',
    paymentstatus: 'Pending'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const preloadedWorker = location.state?.worker || null;

  // 🔹 Helper functions
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const calculateWorkedHours = (arrival, departure) => {
    if (!arrival || !departure) return 0;
    let diff = timeToMinutes(departure) - timeToMinutes(arrival);
    if (diff < 0) diff += 24 * 60;
    return (diff / 60).toFixed(2);
  };

  const calculateSalary = (hours) => (parseFloat(hours) * 200).toFixed(2);

  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hrs = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    return `${hrs}:${mins}`;
  };

  // 🔹 Fetch worker data
  useEffect(() => {
    const fetchWorker = async () => {
      try {
        setLoading(true);
        let workerData = preloadedWorker;

        if (!workerData) {
          const res = await axios.get(`http://localhost:5000/fieldworkers/${id}`);
          workerData = res.data.data || res.data;
        }

        const currentDate = getTodayDate();
        const currentTime = getCurrentTime();

        const formattedData = {
          name: workerData.name || '',
          nationalid: workerData.nationalid || '',
          age: workerData.age || '',
          gender: workerData.gender || '',
          date: workerData.date
            ? new Date(workerData.date).toISOString().split('T')[0]
            : currentDate,
          arrivaltime: workerData.arrivaltime || currentTime,
          departuretime: workerData.departuretime || currentTime,
          workedhoures:
            workerData.arrivaltime && (workerData.departuretime || currentTime)
              ? calculateWorkedHours(workerData.arrivaltime, workerData.departuretime || currentTime)
              : '0',
          salary:
            workerData.arrivaltime && (workerData.departuretime || currentTime)
              ? calculateSalary(
                  calculateWorkedHours(workerData.arrivaltime, workerData.departuretime || currentTime)
                )
              : '0',
          paymentstatus: workerData.paymentstatus || 'Pending'
        };

        setInputs(formattedData);
        setInitialLoad(false);
        setError('');
      } catch (err) {
        console.error('Error fetching worker:', err);
        setError('Failed to fetch worker data');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchWorker();
  }, [id, preloadedWorker]);

  // 🔹 Update computed fields (optional, currently static since times are disabled)
  useEffect(() => {
    if (!initialLoad && inputs.arrivaltime && inputs.departuretime) {
      const workedHours = calculateWorkedHours(inputs.arrivaltime, inputs.departuretime);
      const salary = calculateSalary(workedHours);
      setInputs((prev) => ({
        ...prev,
        workedhoures: workedHours,
        salary: salary
      }));
    }
  }, [inputs.arrivaltime, inputs.departuretime, initialLoad]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value ?? ''
    }));
  };

  const sendRequest = async () => {
    try {
      await axios.put(`http://localhost:5000/fieldworkers/${id}`, {
        ...inputs,
        age: Number(inputs.age),
        workedhoures: Number(inputs.workedhoures),
        salary: Number(inputs.salary),
        date: new Date(inputs.date)
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendRequest();
      navigate('/mainFWorker');
    } catch {
      setError('Failed to update worker');
    }
  };

  if (loading) return <div className="updateworker-loading">Loading...</div>;
  if (error) return <div className="updateworker-error">{error}</div>;

  return (
    <div className="updateworker-update-worker-page">
      <Nav />
      <div className="updateworker-form-container">
        <h1>UPDATE WORKER</h1>
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input type="text" name="name" value={inputs.name} onChange={handleChange} required />

          <label>National ID</label>
          <input type="text" name="nationalid" value={inputs.nationalid} onChange={handleChange} required />

          <label>Age</label>
          <input type="number" name="age" value={inputs.age} onChange={handleChange} min="16" max="100" required />

          <label>Gender</label>
          <select name="gender" value={inputs.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* ✅ Non-editable fields */}
          <label>Date</label>
          <input type="date" name="date" value={inputs.date} readOnly disabled />

          <label>Arrival Time</label>
          <input type="time" name="arrivaltime" value={inputs.arrivaltime} readOnly disabled />

          <label>Departure Time</label>
          <input type="time" name="departuretime" value={inputs.departuretime} readOnly disabled />

          <label>Worked Hours</label>
          <input type="text" value={`${inputs.workedhoures} hours`} readOnly />

          <label>Total Salary</label>
          <input type="text" value={`Rs. ${inputs.salary}`} readOnly />

          {/* ✅ Payment Status: disable if already Paid */}
          <label>Payment Status</label>
          <select
            name="paymentstatus"
            value={inputs.paymentstatus}
            onChange={handleChange}
            disabled={inputs.paymentstatus === 'Paid'} // ✅ Lock if Paid
            required
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>

          <button type="submit">Update Worker</button>
        </form>
      </div>
    </div>
  );
}

export default UpdateWorker;
