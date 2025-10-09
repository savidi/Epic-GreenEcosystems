import React, { useState } from 'react';
import Nav from '../NavCus/NavCus';
import Footer from '../Footer/Footer';
import axios from 'axios';
import './ExportOrders.css'; 

const SPICES_LIST = ['Cardamom', 'Cinnamon', 'Cloves', 'Nutmeg', 'Pepper', 'Turmeric'];
// UPDATED CURRENCIES LIST
const CURRENCIES = ['USD', 'INR', 'EUR', 'CNY', 'AUD', 'PKR'];

function ExportOrders() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        companyName: '',
        country: '',
        interestedSpices: [],
        requiredQuantity: '',
        preferredCurrency: '',
        deliveryAddress: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null); // Renamed 'error' to 'submitError'
    const [validationErrors, setValidationErrors] = useState({}); // New state for field-specific errors

    // --- VALIDATION FUNCTIONS ---
    const validateEmail = (email) => {
        // Regex to validate standard email format: user@domain.tld, prevents numbers after the domain extension.
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const validatePhoneNumber = (number) => {
        // Matches exactly 10 digits. Adjust if you need to support international formats (e.g., with + and spaces).
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(number.replace(/\s/g, '')); // Remove spaces before testing
    };

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address (e.g., user@domain.com).';
            isValid = false;
        }

        if (!validatePhoneNumber(formData.phoneNumber)) {
            errors.phoneNumber = 'Phone number must be exactly 10 digits.';
            isValid = false;
        }

        if (!formData.preferredCurrency) {
            errors.preferredCurrency = 'Please select a preferred currency.';
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };



    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Clear the specific validation error when the user starts typing/changing the field
        setValidationErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors[name];
            return newErrors;
        });

        if (type === 'checkbox') {
            setFormData((prevData) => ({
                ...prevData,
                interestedSpices: checked
                    ? [...prevData.interestedSpices, value]
                    : prevData.interestedSpices.filter((spice) => spice !== value),
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setLoading(true);

        // 1. Run client-side validation
        if (!validateForm()) {
            setLoading(false);
            setSubmitError('Please correct the validation errors before submitting.');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setSubmitError('You must be logged in to submit a quotation request.');
                setLoading(false);
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/api/quotations', 
                formData,
                { headers: { Authorization: `Bearer ${token}` } } 
            );
            console.log('Form Submitted:', response.data);
            alert('Your quotation request has been sent! We will get back to you shortly.');
            
            // Reset the form after successful submission
            setFormData({
                fullName: '',
                email: '',
                phoneNumber: '',
                companyName: '',
                country: '',
                interestedSpices: [],
                requiredQuantity: '',
                preferredCurrency: '',
                deliveryAddress: '',
                notes: '',
            });
            setValidationErrors({});

        } catch (err) {
            console.log(err);
            setSubmitError('Failed to submit your request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <Nav />
            {/* START: NEW BACKGROUND WRAPPER */}
            <div className="export-page-background"> 
                <div className="export-orders-container">
                    <div className="form-header">
                        <h1>Looking for Quotes for Export Orders?</h1>
                        <p>To provide you with an accurate quotation, please fill out the form below with your specific requirements. This will allow us to assess your needs, including shipping costs and lead times, to offer you the best possible price. Our team will review your request and get back to you with a detailed quote as soon as possible.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="export-form">
                        {/* Full Name */}
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                        </div>
                        
                        {/* Email Address with Validation Error */}
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={validationErrors.email ? 'input-error' : ''} />
                            {validationErrors.email && <p className="field-error">{validationErrors.email}</p>}
                        </div>
                        
                        {/* Phone Number with Validation Error */}
                        <div className="form-group">
                            <label htmlFor="phoneNumber">Phone Number (10 Digits)</label>
                            <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className={validationErrors.phoneNumber ? 'input-error' : ''} />
                            {validationErrors.phoneNumber && <p className="field-error">{validationErrors.phoneNumber}</p>}
                        </div>
                        
                        {/* Company Name */}
                        <div className="form-group">
                            <label htmlFor="companyName">Company Name</label>
                            <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} required />
                        </div>
                        
                        {/* Country */}
                        <div className="form-group">
                            <label htmlFor="country">Country</label>
                            <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} required />
                        </div>
                        
                        {/* Interested Spices */}
                        <div className="form-group">
                            <label>Interested Spices</label>
                            <div className="checkbox-group">
                                {SPICES_LIST.map((spice) => (
                                    <label key={spice} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="interestedSpices"
                                            value={spice}
                                            checked={formData.interestedSpices.includes(spice)}
                                            onChange={handleChange}
                                        />
                                        {spice}
                                    </label>
                                ))}
                            </div>
                        </div>
                        
                        {/* Required Quantity */}
                        <div className="form-group">
                            <label htmlFor="requiredQuantity">Required Quantity (kg)</label>
                            <input type="number" id="requiredQuantity" name="requiredQuantity" value={formData.requiredQuantity} onChange={handleChange} required />
                        </div>
                        
                        {/* Preferred Currency (Updated List) */}
                        <div className="form-group">
                            <label htmlFor="preferredCurrency">Preferred Currency</label>
                            <select id="preferredCurrency" name="preferredCurrency" value={formData.preferredCurrency} onChange={handleChange} required className={validationErrors.preferredCurrency ? 'input-error' : ''}>
                                <option value="">Select a currency</option>
                                {CURRENCIES.map((currency) => (
                                    <option key={currency} value={currency}>{currency}</option>
                                ))}
                            </select>
                            {validationErrors.preferredCurrency && <p className="field-error">{validationErrors.preferredCurrency}</p>}
                        </div>
                        
                        {/* Delivery Address with Validation Error - Full Width */}
                        <div className="form-group full-width">
                            <label htmlFor="deliveryAddress">Delivery Address (Street, City, Zip/Postal Code)</label>
                            <input type="text" id="deliveryAddress" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} required className={validationErrors.deliveryAddress ? 'input-error' : ''} />
                            {validationErrors.deliveryAddress && <p className="field-error">{validationErrors.deliveryAddress}</p>}
                        </div>
                        
                        {/* Notes - Full Width */}
                        <div className="form-group full-width">
                            <label htmlFor="notes">Special Instructions/Notes</label>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="4"></textarea>
                        </div>
                        
                        {/* Submit Button */}
                        <button type="submit" className="request-btn" disabled={loading}>
                            {loading ? 'Submitting...' : 'Request Quote'}
                        </button>
                        
                        {/* Submission Error */}
                        {submitError && <p className="error-message">{submitError}</p>}
                    </form>
                </div>
            </div>
            {/* END: NEW BACKGROUND WRAPPER */}
            <Footer />
        </div>
    );
}

export default ExportOrders;