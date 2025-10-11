import React, { useState } from 'react';
import './Register.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Nav from '../NavCus/NavCus';
import Footer from '../Footer/Footer';
import backgroundImage from './background.jpeg';


function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    gmail: "",
    password: "",
  });
  const [message, setMessage] = useState(""); // State for message text
  const [messageType, setMessageType] = useState(""); // State for message type ('success' or 'error')

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        gmail: user.gmail,
        password: user.password,
      });

      if (response.data.status === "ok") {
        localStorage.setItem("token", response.data.token);
        setMessage("Login successful!");
        setMessageType("success");
        // Redirect after a short delay to allow the user to see the message
        setTimeout(() => {
          navigate("/cushome");
        }, 1500);
      } else {
        setMessage(response.data.message);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Login failed:", error);
      console.error("Error response:", error.response);
      console.error("Error request:", error.request);
      console.error("Error config:", error.config);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setMessage(`Server error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        setMessage("Network error: Unable to connect to the server. Please check if the backend is running.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setMessage(`Request error: ${error.message}`);
      }
      setMessageType("error");
    }
  };

  return (
    <div>
      <Nav />
      <div className="reg-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="reg-form">
          <h2>Log in</h2>
          {/* Display the message if it exists */}
          {message && (
            <div className={`reg-form-message ${messageType}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="reg-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="gmail"
                value={user.gmail}
                onChange={handleInputChange}
                name="gmail"
                required
              />
            </div>
            <div className="reg-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={user.password}
                onChange={handleInputChange}
                name="password"
                required
              />
            </div>
            <button type="submit" className="reg-btn">Log in</button>
          </form>
          <div className="reg-login-link">
            <p>Doesn't have an Account? <Link to="/register">Register</Link></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;