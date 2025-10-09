// QuotationController.js
const Quotation = require('../model/Quotation');
const Order = require('../model/Order');
const Spice = require('../model/Spice');
const Register = require('../model/Register');
const OrderPayments = require('../model/OrderPayments');
const mongoose = require('mongoose');
const pdf = require('html-pdf');

// Function to handle the customer's initial quotation request
const submitQuotation = async (req, res) => {
    try {
        const userId = req.userId;
        const { interestedSpices, requiredQuantity, ...customerData } = req.body;

        const spices = await Spice.find({ name: { $in: interestedSpices } });
        const spiceIds = spices.map(spice => spice._id);

        // This calculation is for the initial request, not the final total
        const totalSpicePrice = spices.reduce((sum, spice) => sum + (spice.price * requiredQuantity), 0);
        
        const orderItems = spices.map(spice => ({
            spice: spice._id,
            quantity: requiredQuantity,
            price: spice.price,
        }));

        // Create a new Order entry first
        const newOrder = new Order({
            customer: userId,
            items: orderItems,
            totalPrice: totalSpicePrice,
            orderType: 'Global',
            orderStatus: 'requested',
        });
        await newOrder.save();

        // Then create the new Quotation and link the newOrder
        const newQuotation = new Quotation({
            ...customerData,
            customer: userId,
            interestedSpices: spiceIds,
            requiredQuantity,
            status: 'requested',
            orderId: newOrder._id, // Link the order to the quotation
        });
        await newQuotation.save();

        res.status(201).json({ message: 'Quotation request submitted successfully!', quotation: newQuotation, order: newOrder });
    } catch (err) {
        console.error('Error submitting quotation:', err);
        res.status(500).json({ error: 'Failed to submit quotation request' });
    }
};

// Function for staff to update the quotation and order
const updateStaffFields = async (req, res) => {
    try {
        const { 
            exportDuties, 
            packagingMaterials, 
            shippingPartner, 
            totalCost, 
            staffNotes,
            localBasePrice,
            exchangeRate,
            preferredCurrency 
        } = req.body;
        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        
        // Check if status is approved before allowing updates 
        if (quotation.status === 'approved') {
             return res.status(400).json({ message: 'Cannot update an approved quotation' });
        }

        quotation.exportDuties = exportDuties;
        quotation.packagingMaterials = packagingMaterials;
        quotation.shippingPartner = shippingPartner;
        quotation.totalCost = totalCost;
        quotation.staffNotes = staffNotes;
        quotation.status = 'pending'; 
        
        
        quotation.localBasePrice = localBasePrice;
        quotation.exchangeRate = exchangeRate;
        quotation.preferredCurrency = preferredCurrency; // Ensure this is explicitly saved
        
        
        await quotation.save();

        const order = await Order.findById(quotation.orderId);
        if (order) {
            order.totalPrice = totalCost; // Total cost is now in the preferred currency
            order.orderStatus = 'quoted';
            await order.save();
        }

        res.status(200).json({ message: 'Quotation and order updated successfully', quotation, order });
    } catch (err) {
        console.error('Error updating quotation:', err);
        res.status(500).json({ error: 'Failed to update quotation' });
    }
};

const getQuotations = async (req, res) => {
    try {
        const { search, country, date } = req.query;
        let query = {};

        if (search) {
            const isValidObjectId = mongoose.Types.ObjectId.isValid(search);
            if (isValidObjectId) {
                query._id = search;
            } else {
                const customers = await Register.find({
                    name: { $regex: search, $options: 'i' }
                });
                const customerIds = customers.map(customer => customer._id);
                if (customerIds.length > 0) {
                    query.customer = { $in: customerIds };
                } else {
                    return res.status(200).json({ quotations: [] });
                }
            }
        }

        if (country) {
            query.country = country;
        }

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }

        const quotations = await Quotation.find(query)
            .populate('customer', 'name companyName')
            .populate('interestedSpices', 'name');

        res.status(200).json({ quotations });
    } catch (error) {
        console.error('Error fetching quotations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getQuotationById = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('customer')
            .populate('interestedSpices');

        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        res.status(200).json({ quotation });
    } catch (error) {
        console.error('Error fetching quotation:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getCustomerQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.find({ customer: req.userId })
            .populate('interestedSpices')
            .sort({ createdAt: -1 });
        res.status(200).json({ quotations });
    } catch (error) {
        console.error('Error fetching customer quotations:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Function to approve a quotation
const approveQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);
        
        if (!quotation || quotation.customer.toString() !== req.userId || quotation.status !== 'pending') {
            return res.status(404).json({ message: 'Quotation not found or not available for approval' });
        }
        
        const order = await Order.findById(quotation.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Corresponding order not found' });
        }
        
        quotation.status = 'approved';
        order.orderStatus = 'pending'; // Changed to 'pending' as per your requirements
        await quotation.save();
        await order.save();
        
        res.status(200).json({ message: 'Quotation approved successfully!', orderId: order._id });
    } catch (error) {
        console.error('Error approving quotation:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Function to reject a quotation
const rejectQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findOneAndDelete({
            _id: req.params.id,
            customer: req.userId,
            status: { $in: ['requested', 'pending'] }
        });

        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found, or it has already been processed.' });
        }
        
        // delete the corresponding order using the stored orderId
        const order = await Order.findByIdAndDelete(quotation.orderId);

        if (!order) {
            console.warn(`Order with ID ${quotation.orderId} not found for deleted quotation ${quotation._id}`);
        }

        res.status(200).json({ message: 'Quotation and corresponding order deleted successfully!' });
    } catch (error) {
        console.error('Error rejecting and deleting quotation:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// QuotationController.js

// ... (all other functions remain the same)

const getQuotationPdf = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('interestedSpices')
            .populate('customer');

        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }

        if (quotation.status === 'requested') {
            return res.status(400).json({ message: 'Cannot generate PDF for a quotation with "requested" status.' });
        }

        // --- START OF FIX: Use stored, converted prices ---

        // The Grand Total is already stored and calculated in the preferred currency in totalCost.
        const grandTotal = quotation.totalCost;
        
        // The Subtotal (cost before duties) is the total cost divided by (1 + duty percentage/100).
        // Since totalCost is calculated as: Subtotal * (1 + exportDuties/100)
        // We calculate Subtotal as: totalCost / (1 + exportDuties/100)
        
        // Convert the exportDuties percentage to a multiplier (e.g., 5% -> 1.05)
        const dutyMultiplier = 1 + (quotation.exportDuties / 100);
        
        // Calculate the Subtotal in the preferred currency (this is the price of spices)
        const subTotal = grandTotal / dutyMultiplier;

        // Calculate the exact amount of export duties added
        const exportDutiesAmount = grandTotal - subTotal;
        
        // The price for a single item for display can be calculated by dividing the subTotal
        // by the number of interested spices times the quantity (assuming all items have the same quantity, as per your schema).
        // A more accurate way for a multi-item quote is to use the original local prices and the stored exchange rate.
        
        // Instead of recalculating, we will use the stored data for the summary rows, 
        // but for the individual item line, we will use the local price converted by the stored exchange rate.
        const preferredCurrency = quotation.preferredCurrency || 'LKR';
        const exchangeRate = quotation.exchangeRate || 1.0;
        
        // --- END OF FIX ---
        
        // Format the date for a cleaner look
        const formattedDate = new Date(quotation.createdAt).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Quotation PDF</title>
                <style>
                    body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; color: #333; line-height: 1.6; }
                    .quotation-pdf-container { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    .pdf-header { text-align: center; margin-bottom: 30px; }
                    .company-name { font-size: 28px; color: #962f00; margin: 0; }
                    .company-info p { margin: 5px 0; font-size: 0.9em; }
                    .document-title h2 { font-size: 24px; color: #555; border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-top: 20px; }
                    .info-grid { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 30px; }
                    .info-box { flex: 1; border: 1px solid #eee; padding: 15px; border-radius: 5px; }
                    .info-box h3 { margin-top: 0; color: #555; }
                    .info-box p { margin: 5px 0; font-size: 0.9em; }
                    .section-title { font-size: 20px; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .items-table th { background-color: #f9f9f9; font-weight: bold; }
                    .total-label { text-align: right; font-weight: bold; }
                    .grand-total-section { text-align: right; font-size: 1.5em; font-weight: bold; margin-bottom: 20px; }
                    .additional-info p, .notes-text, .terms-text { font-size: 0.9em; margin: 5px 0; }
                    .signature-section { margin-top: 40px; }
                    .signature-section p { margin: 5px 0; }
                    .pdf-footer { text-align: center; margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; font-style: italic; font-size: 0.8em; }
                </style>
            </head>
            <body>
                <div class="quotation-pdf-container">
                    <div class="pdf-header">
                        <div class="company-info">
                            <h1 class="company-name">EPIC GREEN</h1>
                            <p class="company-address">123 Spice Lane, Colombo, Sri Lanka</p>
                            <p class="company-contact">epicgreen@email.com | +94 11 234 5678</p>
                        </div>
                        <div class="document-title">
                            <h2>QUOTATION</h2>
                        </div>
                    </div>

                    <div class="info-grid">
                        <div class="info-box">
                            <h3>Quotation For:</h3>
                            <p><strong>Name:</strong> ${quotation.customer.name}</p>
                            <p><strong>Address:</strong> ${quotation.customer.address}</p>
                            <p><strong>Email:</strong> ${quotation.customer.gmail || 'N/A'}</p>
                            <p><strong>Phone:</strong> ${quotation.customer.phone || 'N/A'}</p>
                        </div>
                        <div class="info-box">
                            <h3>Details:</h3>
                            <p><strong>Quotation ID:</strong> ${quotation._id}</p>
                            <p><strong>Date:</strong> ${formattedDate}</p>
                            <p><strong>Currency:</strong> ${preferredCurrency}</p>
                            <p><strong>Delivery Address:</strong> ${quotation.deliveryAddress || 'N/A'}</p>
                        </div>
                    </div>

                    <h3 class="section-title">Quoted Items</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th class="item-name">Item</th>
                                <th class="item-qty">Quantity</th>
                                <th class="item-unit-price">Unit Price (${preferredCurrency})</th>
                                <th class="item-subtotal">Total (${preferredCurrency})</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${quotation.interestedSpices.map(spice => {
                                // Calculate the converted price per item (price is stored in LKR, so divide by the rate)
                                const unitPriceConverted = spice.price / exchangeRate;
                                const itemSubtotal = unitPriceConverted * quotation.requiredQuantity;
                                return `
                                <tr>
                                    <td>${spice.name}</td>
                                    <td>${quotation.requiredQuantity || 'N/A'} kg</td>
                                    <td>${unitPriceConverted.toFixed(2)} / kg</td>
                                    <td>${itemSubtotal.toFixed(2)}</td>
                                </tr>
                                `;
                            }).join('')}
                            <tr>
                                <td colspan="3" class="total-label">Subtotal:</td>
                                <td class="total-amount">${subTotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" class="total-label">Export Duties (${quotation.exportDuties}%):</td>
                                <td class="total-amount">${exportDutiesAmount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="grand-total-section">
                        <p><strong>Grand Total:</strong> ${grandTotal.toFixed(2)} ${preferredCurrency}</p>
                    </div>

                    <div class="additional-info">
                        <p><strong>Shipping Partner:</strong> ${quotation.shippingPartner || 'N/A'}</p>
                        <p><strong>Packaging:</strong> ${quotation.packagingMaterials || 'N/A'}</p>
                    </div>

                    <h3 class="section-title">Notes & Terms</h3>
                    <p class="notes-text">${quotation.staffNotes || 'No specific notes provided.'}</p>
                    <p class="terms-text">This is a quotation and not a final invoice. Prices are valid for 30 days from the date of issue. Payments are to be made via bank transfer or credit card.</p>
                    
                    <div class="signature-section">
                        <p>Authorized by:</p>
                        <p>__Patali Tennakoon__</p>
                        <p>Sales Manager, Epic Green</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Use a library like 'html-pdf' to generate the PDF
        pdf.create(htmlContent, { format: 'A4' }).toBuffer((err, buffer) => {
            if (err) {
                console.error('Error creating PDF:', err);
                return res.status(500).json({ message: 'Error generating PDF' });
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=quotation_${quotation._id}.pdf`);
            res.send(buffer);
        });

    } catch (error) {
        console.error('Error fetching quotation or generating PDF:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
    submitQuotation,
    updateStaffFields,
    getQuotations,
    getQuotationById,
    getCustomerQuotations,
    approveQuotation,
    rejectQuotation,
    getQuotationPdf,
};
