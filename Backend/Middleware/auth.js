const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key'; // Use the same secret key from your app.js

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication failed: No token provided' });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.userId = decodedToken.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Authentication failed: Invalid token' });
    }
};

module.exports = auth; // Export the auth function