// QuotationPDF.js
import React from 'react';

const QuotationPdf = React.forwardRef(({ quotation, customer }, ref) => {
    if (!quotation || !customer) {
        return <div>Loading...</div>;
    }

    // Format the date for a cleaner look
    const formattedDate = new Date(quotation.createdAt).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="quotation-pdf-container" ref={ref}>
            <div className="pdf-header">
                <div className="company-info">
                    <h1 className="company-name">EPIC GREEN</h1>
                    <p className="company-address">123 Spice Lane, Colombo, Sri Lanka</p>
                    <p className="company-contact">epicgreen@email.com | +94 11 234 5678</p>
                </div>
                <div className="document-title">
                    <h2>QUOTATION</h2>
                </div>
            </div>

            <div className="info-grid">
                <div className="info-box">
                    <h3>Quotation For:</h3>
                    <p><strong>Name:</strong> {customer.name}</p>
                    <p><strong>Address:</strong> {customer.address}</p>
                    <p><strong>Email:</strong> {customer.gmail}</p>
                    <p><strong>Phone:</strong> {customer.phone}</p>
                </div>
                <div className="info-box">
                    <h3>Details:</h3>
                    <p><strong>Quotation ID:</strong> {quotation._id}</p>
                    <p><strong>Date:</strong> {formattedDate}</p>
                    <p><strong>Currency:</strong> {quotation.preferredCurrency || 'N/A'}</p>
                    <p><strong>Delivery Address:</strong> {quotation.deliveryAddress || 'N/A'}</p>
                </div>
            </div>

            <h3 className="section-title">Quoted Items</h3>
            <table className="items-table">
                <thead>
                    <tr>
                        <th className="item-name">Item</th>
                        <th className="item-qty">Quantity</th>
                        <th className="item-unit-price">Unit Price</th>
                        <th className="item-subtotal">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {quotation.interestedSpices.map((spice, index) => (
                        <tr key={index}>
                            <td>{spice.name}</td>
                            <td>{quotation.requiredQuantity || 'N/A'} kg</td>
                            <td>{spice.price.toFixed(2)} / kg</td>
                            <td>{(spice.price * quotation.requiredQuantity).toFixed(2)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="3" className="total-label">Subtotal:</td>
                        <td className="total-amount">{quotation.subTotal ? quotation.subTotal.toFixed(2) : 'N/A'}</td>
                    </tr>
                    <tr>
                        <td colSpan="3" className="total-label">Export Duties ({quotation.exportDuties}%):</td>
                        <td className="total-amount">{(quotation.subTotal * (quotation.exportDuties / 100)).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div className="grand-total-section">
                <p><strong>Grand Total:</strong> {quotation.grandTotal ? quotation.grandTotal.toFixed(2) : 'N/A'}</p>
            </div>

            <div className="additional-info">
                <p><strong>Shipping Partner:</strong> {quotation.shippingPartner || 'N/A'}</p>
                <p><strong>Packaging:</strong> {quotation.packagingMaterials || 'N/A'}</p>
            </div>

            <h3 className="section-title">Notes & Terms</h3>
            <p className="notes-text">{quotation.staffNotes || 'No specific notes provided.'}</p>
            <p className="terms-text">This is a quotation and not a final invoice. Prices are valid for 30 days from the date of issue. Payments are to be made via bank transfer or credit card.</p>

            <div className="signature-section">
                <p>Authorized by:</p>
                <p>_______________________</p>
                <p>Sales Manager, Epic Green</p>
            </div>
        </div>
    );
});

export default QuotationPdf;