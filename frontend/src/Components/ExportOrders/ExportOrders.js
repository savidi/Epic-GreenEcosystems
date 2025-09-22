import React, { useState } from 'react';
import NavCus from '../NavCus/NavCus';
import Footer from '../Footer/Footer';
import axios from 'axios';
import './ExportOrders.css'; 

const SPICES_LIST = ['Cardamom', 'Cinnamon', 'Cloves', 'Nutmeg', 'Pepper', 'Turmeric'];
const CURRENCIES = ['USD', 'EUR', 'LKR', 'GBP', 'AUD'];

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
    const [error, setError] = useState(null);

    const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
        setFormData((prevData) => ({
            ...prevData,
            interestedSpices: checked
                ? [...prevData.interestedSpices, value] // CORRECTED: Use `value`
                : prevData.interestedSpices.filter((spice) => spice !== value), // CORRECTED: Use `value`
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
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to submit a quotation request.');
                setLoading(false);
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/api/quotations', 
                formData,
                { headers: { Authorization: `Bearer ${token}` } } // Pass the auth token here
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
        } catch (err) {
            console.log(err);
            setError('Failed to submit your request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="exportorders-page-container">
            <NavCus />
            <div className="exportorders-container">
                <div className="exportorders-form-header">
                    <h1>Looking for Quotes for Export Orders?</h1>
                    <p>To provide you with an accurate quotation, please fill out the form below with your specific requirements. This will allow us to assess your needs, including shipping costs and lead times, to offer you the best possible price. Our team will review your request and get back to you with a detailed quote as soon as possible.</p>
                </div>
                <form onSubmit={handleSubmit} className="exportorders-form">
                    {/* Input fields with value and onChange handlers */}
                    <div className="exportorders-form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    </div>
                    <div className="exportorders-form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="exportorders-form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                    </div>
                    <div className="exportorders-form-group">
                        <label htmlFor="companyName">Company Name</label>
                        <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} required />
                    </div>
                    <div className="exportorders-form-group">
                        <label htmlFor="country">Country</label>
                        <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} required />
                    </div>
                    <div className="exportorders-form-group">
                        <label>Interested Spices</label>
                        <div className="exportorders-checkbox-group">
                            {SPICES_LIST.map((spice) => (
                                <label key={spice} className="exportorders-checkbox-label">
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
                    <div className="exportorders-form-group">
                        <label htmlFor="requiredQuantity">Required Quantity (kg)</label>
                        <input type="number" id="requiredQuantity" name="requiredQuantity" value={formData.requiredQuantity} onChange={handleChange} required />
                    </div>
                    <div className="exportorders-form-group">
                        <label htmlFor="preferredCurrency">Preferred Currency</label>
                        <select id="preferredCurrency" name="preferredCurrency" value={formData.preferredCurrency} onChange={handleChange} required>
                            <option value="">Select a currency</option>
                            {CURRENCIES.map((currency) => (
                                <option key={currency} value={currency}>{currency}</option>
                            ))}
                        </select>
                    </div>
                    <div className="exportorders-form-group">
                        <label htmlFor="deliveryAddress">Delivery Address</label>
                        <input type="text" id="deliveryAddress" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} required />
                    </div>
                    <div className="exportorders-form-group">
                        <label htmlFor="notes">Special Instructions/Notes</label>
                        <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="4"></textarea>
                    </div>
                    <button type="submit" className="exportorders-request-btn" disabled={loading}>
                        {loading ? 'Submitting...' : 'Request Quote'}
                    </button>
                    {error && <p className="exportorders-error-message">{error}</p>}
                </form>
            </div>
            <Footer />
        </div>
    );
}

export default ExportOrders;