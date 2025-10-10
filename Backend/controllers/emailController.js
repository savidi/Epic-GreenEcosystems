const nodemailer = require('nodemailer');
const Order = require('../model/Order');
const User = require('../model/Register');

// --- Nodemailer Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail', // Assuming you are using Gmail
    auth: {
        user: process.env.EMAIL_HOST_USER, 
        pass: process.env.EMAIL_HOST_PASSWORD,
    },
});

// --- HTML Template for the Email Body ---
const generateEmailHtml = (customerName, orderDetails) => {
    
    const itemsList = orderDetails.items.map(item => `
        <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.spice?.name || 'Unknown'} x ${item.quantity}kg</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">Rs.${(item.quantity * item.price).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            
            <div style="background-color: #b55927; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Epic Green Company</h1>
                <p style="margin: 5px 0 0; font-size: 14px;">The finest spices, delivered to your door.</p>
            </div>
            
            <div style="padding: 20px;">
                <p>Dear ${customerName},</p>
                <p>We are delighted to confirm that your order <strong>#${orderDetails._id}</strong> has been successfully placed and the payment was processed! The receipt is attached below.</p>
                
                <h3 style="color: #ec5d0a; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Order Summary</h3>
                <p><strong>Order ID:</strong> ${orderDetails._id}</p>
                <p><strong>Order Date:</strong> ${new Date(orderDetails.createdAt).toLocaleDateString()}</p>

                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding-bottom: 10px; border-bottom: 2px solid #ccc;">Item</th>
                            <th style="text-align: right; padding-bottom: 10px; border-bottom: 2px solid #ccc;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsList}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style="padding-top: 15px; font-weight: bold; font-size: 18px;">Total Price:</td>
                            <td style="padding-top: 15px; font-weight: bold; font-size: 18px; text-align: right;">Rs.${orderDetails.totalPrice.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>

                <p style="margin-top: 30px;">Thank you for shopping with us. We will notify you once your order is shipped!</p>
                <p>Sincerely,<br>The Epic Green Team</p>
            </div>

            <div style="background-color: #f0f0f0; padding: 10px 20px; font-size: 12px; text-align: center; color: #666;">
                <p>This is an automated confirmation email. Please do not reply.</p>
            </div>
        </div>
    `;
};


exports.sendOrderReceiptEmail = async (req, res) => {
    const { orderId, pdfBase64, customerEmail } = req.body;
    const userId = req.userId;
    
    // FIX: Force the recipient email to be the TEST_RECIPIENT_EMAIL for testing purposes.
    const recipientEmail = process.env.TEST_RECIPIENT_EMAIL;

    if (!recipientEmail) {
        return res.status(500).json({ message: 'Email configuration error. Recipient is undefined.' });
    }

    try {
        // 1. Fetch Order details to build the email body
        const order = await Order.findOne({ _id: orderId, customer: userId }).populate('items.spice').populate('customer');

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        
        const customerName = order.customer.name || 'Valued Customer';
        const htmlBody = generateEmailHtml(customerName, order);

        // 2. Prepare the email attachment
        const mailOptions = {
            // *** MODIFIED: Use the company name as the display sender name ***
            from: `"Epic Green Company" <${process.env.EMAIL_HOST_USER}>`,
            to: recipientEmail,
            subject: `Epic Green - Order Confirmed (#${orderId}) - Payment Successful`,
            html: htmlBody,
            attachments: [
                {
                    filename: `Receipt_Order_${orderId}.pdf`,
                    content: pdfBase64, // The PDF content sent from the frontend
                    encoding: 'base64',
                    contentType: 'application/pdf',
                },
            ],
        };

        // 3. Send the email
        await transporter.sendMail(mailOptions);

        console.log(`Receipt email successfully forwarded`);
        res.status(200).json({ 
            message: `Email successfully sent to ${recipientEmail}`,
            // Always true now since we are forcing the test email
            sentToTest: true 
        });

    } catch (error) {
        console.error('Error sending receipt email:', error);
        res.status(500).json({ message: 'Failed to send email.', error: error.message });
    }
};