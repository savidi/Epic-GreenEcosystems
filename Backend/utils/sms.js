const axios = require('axios');

const TEXT_LK_API = 'https://app.text.lk/api/http/sms/send';
const API_TOKEN = process.env.TEXT_LK_TOKEN || '1873|aApH4u9MIUWimXALaQ4cB7JU8a6HoubveNeakRKm7d62a6be'; // replace with .env variable

/**
 * Send SMS via Text.lk
 * @param {string} recipient - recipient number (e.g. 94710000000)
 * @param {string} message - message text
 */
async function sendSMS(recipient, message) {
    try {
        const response = await axios.post(
            TEXT_LK_API,
            {
                api_token: API_TOKEN,
                recipient,
                sender_id: 'TextLKDemo', // you can replace this with your own registered sender ID
                type: 'plain',
                message,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }
        );

        console.log('✅ SMS sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ SMS send error:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = { sendSMS };
