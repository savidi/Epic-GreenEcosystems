const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ranasinghenk9@gmail.com',  // Your Gmail
    pass: 'rqcw johx eswy iyaa'  // Replace with your Gmail App Password
  },
  debug: true,  // Enable debug logs
  logger: true  // Enable logger
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('✅ Email server is ready to send emails');
  }
});

// Email sending route
router.post('/send-email', async (req, res) => {
  try {
    console.log('📧 Email request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { to, subject, supplierData } = req.body;

    // Validation
    if (!to) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient email is required' 
      });
    }

    if (!supplierData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Supplier data is required' 
      });
    }

    console.log('Sending email to:', to);
    console.log('Supplier name:', supplierData.name);

    // Create email content
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #c9905aff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: white; }
          td { padding: 12px; border: 1px solid #ddd; }
          .label { font-weight: bold; background-color: #f2f2f2; width: 40%; }
          .footer { text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2> Supplier Registration Confirmation</h2>
          </div>
          <div class="content">
            <p>Dear <strong>${supplierData.name}</strong>,</p>
            <p>Thank you for registering as a supplier with our system. Your registration has been successfully processed.</p>
            
            <h3>Registration Details:</h3>
            <table>
              <tr>
                <td class="label">Supplier Name</td>
                <td>${supplierData.name}</td>
              </tr>
              <tr>
                <td class="label">Phone Number</td>
                <td>${supplierData.phoneno}</td>
              </tr>
              <tr>
                <td class="label">Address</td>
                <td>${supplierData.address}</td>
              </tr>
              <tr>
                <td class="label">Email</td>
                <td>${supplierData.email}</td>
              </tr>
              <tr>
                <td class="label">Registration Date</td>
                <td>${supplierData.date}</td>
              </tr>
              <tr>
                <td class="label">Spice Type</td>
                <td>${supplierData.spicename}</td>
              </tr>
              <tr>
                <td class="label">Quantity</td>
                <td>${supplierData.qty} kg</td>
              </tr>
              <tr>
                <td class="label">Price</td>
                <td>LKR ${supplierData.price}</td>
              </tr>
            </table>
            
            <p style="margin-top: 20px;">If you have any questions, please feel free to contact us.</p>
            <p>Best regards,<br><strong>Supplier Management Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} Supplier Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Configure mail options
    const mailOptions = {
      from: {
        name: 'Supplier Management System',
        address: 'ranasinghenk9@gmail.com'
      },
      to: to,
      subject: subject || 'Supplier Registration Confirmation',
      html: emailContent,
      text: `Dear ${supplierData.name},\n\nThank you for registering as a supplier.\n\nRegistration Details:\nName: ${supplierData.name}\nPhone: ${supplierData.phoneno}\nAddress: ${supplierData.address}\nEmail: ${supplierData.email}\nDate: ${supplierData.date}\nSpice: ${supplierData.spicename}\nQuantity: ${supplierData.qty} kg\nPrice: LKR ${supplierData.price}\n\nBest regards,\nSupplier Management Team`
    };

    console.log('Attempting to send email...');

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(' Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId,
      recipient: to
    });

  } catch (error) {
    console.error('Email sending failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });

    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message,
      code: error.code
    });
  }
});

// Test route to verify email configuration
router.get('/test-email', async (req, res) => {
  try {
    const testEmail = {
      from: 'ranasinghenk9@gmail.com',
      to: 'ranasinghenk9@gmail.com', // Send to yourself for testing
      subject: 'Test Email - Supplier System',
      text: 'This is a test email. If you received this, email configuration is working!',
      html: '<h2>Email Configuration Test</h2><p>If you received this, your email is configured correctly!</p>'
    };

    const info = await transporter.sendMail(testEmail);
    
    res.json({
      success: true,
      message: 'Test email sent successfully!',
      messageId: info.messageId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
});

module.exports = router;