import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './CusRegister.css';
import axios from 'axios';
import Nav from '../NavCus/NavCus';
import Footer from '../Footer/Footer';
import backgroundImage from './background.jpeg';

function Register() {
  const history = useNavigate();
  const [user, setUser] = useState({
    name: "",
    gmail: "",
    phone: "",
    address: "",
    password: "",
  });

  // State to manage validation errors for each field
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
    // Clear the error for the current field as the user types
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    // Email validation
    if (!user.gmail) {
      tempErrors.gmail = "Email is required.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(user.gmail)) {
      tempErrors.gmail = "Email is not valid.";
      isValid = false;
    }

    // Phone number validation (10 digits)
    if (!user.phone) {
      tempErrors.phone = "Phone number is required.";
      isValid = false;
    } else if (!/^\d{10}$/.test(user.phone)) {
      tempErrors.phone = "Phone number must be 10 digits.";
      isValid = false;
    }

    // Password validation (min 6 characters, includes special character)
    if (!user.password) {
      tempErrors.password = "Password is required.";
      isValid = false;
    } else if (user.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters.";
      isValid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(user.password)) {
      tempErrors.password = "Password must contain a special character.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await axios.post("http://localhost:5000/register", user);
        setMessage("Registered Successfully");
        setMessageType("success");
        setTimeout(() => {
          history("/local-orders");
        }, 1500);
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          setMessage(err.response.data.message);
          setMessageType("error");
        } else {
          setMessage("An error occurred. Please try again.");
          setMessageType("error");
        }
      }
    }
  };

  return (
    <div>
      <Nav />
      <div className="reg-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="reg-form">
          <h2>Register</h2>
          {message && (
            <div className={`reg-form-message ${messageType}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="reg-form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={user.name}
                onChange={handleInputChange}
                name="name"
                required
              />
            </div>
            <div className="reg-form-group">
              <label htmlFor="gmail">Email</label>
              <input
                type="email"
                id="gmail"
                value={user.gmail}
                onChange={handleInputChange}
                name="gmail"
                required
              />
              {errors.gmail && <p className="reg-error-text">{errors.gmail}</p>}
            </div>
            <div className="reg-form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={user.phone}
                onChange={handleInputChange}
                name="phone"
                required
              />
              {errors.phone && <p className="reg-error-text">{errors.phone}</p>}
            </div>
            <div className="reg-form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                value={user.address}
                onChange={handleInputChange}
                name="address"
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
              {errors.password && <p className="reg-error-text">{errors.password}</p>}
            </div>
            <button type="submit" className="reg-btn">Register</button>
          </form>
          <div className="reg-login-link">
            <p>Already Registered? <Link to="/login">Login</Link></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Register;