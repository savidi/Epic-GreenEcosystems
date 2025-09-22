// QuotationForm.js (Revised)
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './SalesManager.css';

const QuotationForm = () => {
    const { quotationId } = useParams();
    const [quotation, setQuotation] = useState(null);
    const [formData, setFormData] = useState({
        exportDuties: '',
        packagingMaterials: '',
        shippingPartner: '',
        totalCost: 0,
        staffNotes: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [basePrice, setBasePrice] = useState(0);

    const fetchQuotation = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/sales/quotations/${quotationId}`);
            const fetchedQuotation = response.data.quotation;
            setQuotation(fetchedQuotation);

            let calculatedBasePrice = 0;
            // Add a check to ensure interestedSpices is an array
            if (fetchedQuotation.interestedSpices && Array.isArray(fetchedQuotation.interestedSpices)) {
                calculatedBasePrice = fetchedQuotation.interestedSpices.reduce((sum, spice) => {
                    return sum + (spice.price * fetchedQuotation.requiredQuantity);
                }, 0);
            }
            setBasePrice(calculatedBasePrice);

            setFormData({
                exportDuties: fetchedQuotation.exportDuties || '',
                packagingMaterials: fetchedQuotation.packagingMaterials || '',
                shippingPartner: fetchedQuotation.shippingPartner || '',
                totalCost: fetchedQuotation.totalCost || calculatedBasePrice,
                staffNotes: fetchedQuotation.staffNotes || ''
            });
            setLoading(false);
        } catch (err) {
            console.error('Error fetching quotation:', err);
            setError(err);
            setLoading(false); // Make sure to stop loading on error
        }
    }, [quotationId]);

    useEffect(() => {
        fetchQuotation();
    }, [fetchQuotation]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        let newTotalCost = parseFloat(basePrice);

        const dutiesValue = parseFloat(formData.exportDuties);
        if (!isNaN(dutiesValue)) {
            newTotalCost += newTotalCost * (dutiesValue / 100);
        }
        setFormData(prev => ({
            ...prev,
            totalCost: newTotalCost.toFixed(2)
        }));
    }, [formData.exportDuties, basePrice]);

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await axios.put(
            `http://localhost:5000/api/sales/quotations/${quotationId}/update-staff-fields`,
            formData
        );
        alert('Quotation updated successfully!');
    } catch (err) {
        console.error('Failed to update quotation:', err);
        setError(err);
        alert('Failed to update quotation.');
    } finally {
        setLoading(false);
    }
    };

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

    return (
        <div className="quotation-form-container">
            <h2>Quotation Details for {quotation.customer.name}</h2>
            <div className="customer-details">
                <h3>Customer Details</h3>
                <p><strong>Customer ID:</strong> {quotation.customer._id}</p>
                <p><strong>Company Name:</strong> {quotation.companyName}</p>
                <p><strong>Contact Person:</strong> {quotation.customer.name}</p>
                <p><strong>Phone:</strong> {quotation.customer.phone}</p>
                <p><strong>Email:</strong> {quotation.customer.gmail}</p>
                <p><strong>Interested Spices:</strong> {Array.isArray(quotation.interestedSpices) ? quotation.interestedSpices.map(s => s.name).join(', ') : 'N/A'}</p>
                <p><strong>Required Quantity (Approx.):</strong> {quotation.requiredQuantity}</p>
                <p><strong>Notes:</strong> {quotation.notes}</p>
            </div>

            <form onSubmit={handleSubmit} className="staff-form">
                <h3>Staff Quotation Fields</h3>
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
                    <label htmlFor="totalCost">Total Cost:</label>
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