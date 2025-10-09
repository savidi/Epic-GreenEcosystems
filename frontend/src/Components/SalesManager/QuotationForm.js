// QuotationForm.js (Revised for Currency Conversion and Navigation)
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// Import useNavigate along with useParams
import { useParams, useNavigate } from 'react-router-dom';
import './SalesManager.css';

const EXCHANGE_RATES = {
    'LKR': 1.00, // Local Currency (Base)
    'USD': 303.00, // Example: 1 USD = 303.00 LKR
    'EUR': 352.00, // Example: 1 EUR = 325.00 LKR
    'INR': 4.00, // Example: 1 GBP = 370.00 LKR
    'CNY': 43.00, // Example: 1 GBP = 370.00 LKR
    'AUD': 199.00, // Example: 1 GBP = 370.00 LKR
    'PKR': 2.00, // Example: 1 GBP = 370.00 LKR
    
};

const QuotationForm = () => {
    const { quotationId } = useParams();
    // Initialize useNavigate
    const navigate = useNavigate(); 
    
    const [quotation, setQuotation] = useState(null);
    const [formData, setFormData] = useState({
        exportDuties: '',
        packagingMaterials: '',
        shippingPartner: '',
        totalCost: '0.00', // Initialize as a string for two decimals
        staffNotes: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [localBasePrice, setLocalBasePrice] = useState(0); // Store the original price in local currency
    const [convertedPrice, setConvertedPrice] = useState('0.00'); // Store as a rounded string to control decimals

    // Function to perform the currency conversion
    const convertPrice = useCallback((price, currency) => {
        const rate = EXCHANGE_RATES[currency];
        if (!rate || currency === 'LKR') {
            // If currency is not found or is the base currency (LKR)
            return price;
        }
        // Price in LKR / Rate = Price in Target Currency
        return price / rate;
    }, []);

    const fetchQuotation = useCallback(async () => {
        setLoading(true);
        try {
            // Ensure the backend populates 'interestedSpices' for price calculation
            const response = await axios.get(`http://localhost:5000/api/sales/quotations/${quotationId}`);
            const fetchedQuotation = response.data.quotation;
            setQuotation(fetchedQuotation);

            let calculatedLocalBasePrice = 0;
            const preferredCurrency = fetchedQuotation.preferredCurrency;

            // 1. Calculate the base price in the Local Currency (LKR, assuming this is the price stored in 'Spice' model)
            if (fetchedQuotation.interestedSpices && Array.isArray(fetchedQuotation.interestedSpices)) {
                calculatedLocalBasePrice = fetchedQuotation.interestedSpices.reduce((sum, spice) => {
                    // Assuming spice.price is the local price per kg
                    return sum + (spice.price * fetchedQuotation.requiredQuantity);
                }, 0);
            }
            
            setLocalBasePrice(calculatedLocalBasePrice);
            
            // 2. Convert the local base price to the customer's preferred currency
            const initialConvertedPrice = convertPrice(calculatedLocalBasePrice, preferredCurrency);
            
            // Store convertedPrice as a string rounded to two decimals
            const roundedConvertedPrice = parseFloat(initialConvertedPrice).toFixed(2);
            setConvertedPrice(roundedConvertedPrice); 

            // 3. Initialize formData using the converted price for totalCost
            setFormData({
                exportDuties: fetchedQuotation.exportDuties || '',
                packagingMaterials: fetchedQuotation.packagingMaterials || '',
                shippingPartner: fetchedQuotation.shippingPartner || '',
                // Use the rounded converted price for initial totalCost
                totalCost: fetchedQuotation.totalCost ? parseFloat(fetchedQuotation.totalCost).toFixed(2) : roundedConvertedPrice,
                staffNotes: fetchedQuotation.staffNotes || ''
            });
            setLoading(false);
        } catch (err) {
            console.error('Error fetching quotation:', err);
            setError(err);
            setLoading(false);
        }
    }, [quotationId, convertPrice]);

    useEffect(() => {
        fetchQuotation();
    }, [fetchQuotation]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Recalculate Total Cost whenever export duties or the base price changes
    useEffect(() => {
        // Always parse the state value to a float before arithmetic
        let newTotalCost = parseFloat(convertedPrice); 

        // Safety check in case of NaN
        if (isNaN(newTotalCost)) {
             newTotalCost = 0;
        }

        const dutiesValue = parseFloat(formData.exportDuties);
        if (!isNaN(dutiesValue)) {
            // Calculate duty *on the converted price*
            newTotalCost += newTotalCost * (dutiesValue / 100);
        }

        setFormData(prev => ({
            ...prev,
            // Store the final result rounded to two decimal places as a string
            totalCost: newTotalCost.toFixed(2) 
        }));
    }, [formData.exportDuties, convertedPrice]); // Depend on convertedPrice

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // The totalCost sent to the backend is ALREADY in the customer's currency.
            // We should also send the localBasePrice and the Exchange Rate for record-keeping.
            const preferredCurrency = quotation.preferredCurrency;
            const exchangeRate = EXCHANGE_RATES[preferredCurrency] || 1.0;

            await axios.put(
                `http://localhost:5000/api/sales/quotations/${quotationId}/update-staff-fields`,
                { 
                    ...formData,
                    // Send the currency and rate to the backend for storage
                    preferredCurrency, 
                    localBasePrice: localBasePrice,
                    exchangeRate: exchangeRate
                }
            );
            alert('Quotation updated successfully!');
            
            // REDIRECTION LOGIC ADDED HERE
            navigate('/sales-manager#quotations'); 
            
        } catch (err) {
            console.error('Failed to update quotation:', err);
            setError(err);
            alert('Failed to update quotation.');
        } finally {
            setLoading(false);
        }
    };
    
    // ... (rest of the component remains largely the same)
    if (loading) {
        return <div>Loading quotation details...</div>;
    }

    if (error) {
        return <div>Error: Unable to fetch quotation details.</div>;
    }

    if (!quotation) {
        return <div>Quotation not found.</div>;
    }

    const isApproved = quotation.status === 'approved';
    const currency = quotation.preferredCurrency || 'LKR';


    return (
        <div className="quotation-form-container">
            <h2>Quotation Details for {quotation.customer.name}</h2>
            <div className="customer-details">
                <h3>Customer Details</h3>
                <p><strong>Company Name:</strong> {quotation.companyName}</p>
                <p><strong>Contact Person:</strong> {quotation.customer.name}</p>
                <p><strong>Interested Spices:</strong> {Array.isArray(quotation.interestedSpices) ? quotation.interestedSpices.map(s => s.name).join(', ') : 'N/A'}</p>
                <p><strong>Required Quantity (Approx.):</strong> {quotation.requiredQuantity} kg</p>
                <p><strong>Preferred Currency:</strong> <span style={{fontWeight: 'bold', color: 'darkgreen'}}>{currency}</span></p>
                <p><strong>Base Price (Local Currency LKR):</strong> {localBasePrice.toFixed(2)} LKR</p>
                
                <p><strong>Initial Converted Price:</strong> <span style={{fontWeight: 'bold'}}>{parseFloat(convertedPrice).toFixed(2)} {currency}</span></p>

            </div>

            <form onSubmit={handleSubmit} className="staff-form">
                <h3>Staff Quotation Fields</h3>
                {/* ... other form fields (exportDuties, packagingMaterials, shippingPartner) */}
                <div className="form-group">
                    <label htmlFor="exportDuties">Export Duties:</label>
                    <select
                        id="exportDuties"
                        name="exportDuties"
                        value={formData.exportDuties}
                        onChange={handleChange}
                        required
                        disabled={isApproved}
                    >
                        <option value="">Select a duty type</option>
                        <option value="0">No duty - 0%</option>
                        <option value="2">Export cess - 2%</option>
                        <option value="5">Export cess over 100kg - 5%</option>
                        <option value="1">Customs handling fee - 1%</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="packagingMaterials">Packaging Materials:</label>
                    <textarea
                        id="packagingMaterials"
                        name="packagingMaterials"
                        value={formData.packagingMaterials}
                        onChange={handleChange}
                        disabled={isApproved}
                    ></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="shippingPartner">Shipping Partner:</label>
                    <select
                        id="shippingPartner"
                        name="shippingPartner"
                        value={formData.shippingPartner}
                        onChange={handleChange}
                        required
                        disabled={isApproved}
                    >
                        <option value="">Select a shipping partner</option>
                        <option value="FedEx Express">FedEx Express</option>
                        <option value="SriLankan Cargo">SriLankan Cargo (SriLankan Airlines freight arm)</option>
                        <option value="Maersk Line">Maersk Line</option>
                        <option value="Qatar Airways Cargo">Qatar Airways Cargo</option>
                        <option value="CMA CGM Lanka">CMA CGM Lanka</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="totalCost">Total Cost (<span style={{fontWeight: 'bold', color: 'darkgreen'}}>{currency}</span>):</label>
                    <input
                        type="number"
                        id="totalCost"
                        name="totalCost"
                        value={formData.totalCost} 
                        onChange={handleChange}
                        readOnly
                        disabled={isApproved}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="staffNotes">Staff Notes/Terms:</label>
                    <textarea
                        id="staffNotes"
                        name="staffNotes"
                        value={formData.staffNotes}
                        onChange={handleChange}
                        disabled={isApproved}
                    ></textarea>
                </div>
                <button type="submit" className="submit-button" disabled={isApproved}>
                    {isApproved ? 'Approved' : 'Send Quotation'}
                </button>
            </form>
        </div>
    );
};

export default QuotationForm;