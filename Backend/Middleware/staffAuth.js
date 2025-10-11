// Middleware/staffAuth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const staffAuth = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                status: 'fail',
                message: 'Authentication failed: No token provided' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decodedToken = jwt.verify(token, JWT_SECRET);
        
        // Add staff info to request
        req.staffId = decodedToken.staffId;
        req.staffType = decodedToken.staffType;
        req.position = decodedToken.position;
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                status: 'fail',
                message: 'Authentication failed: Token expired' 
            });
        }
        return res.status(401).json({ 
            status: 'fail',
            message: 'Authentication failed: Invalid token' 
        });
    }
};

// Middleware to check if user is a manager
const isManager = (req, res, next) => {
    if (req.position !== 'Manager') {
        return res.status(403).json({
            status: 'fail',
            message: 'Access denied: Manager privileges required'
        });
    }
    next();
};

// Middleware to check specific staff type
const checkStaffType = (...allowedTypes) => {
    return (req, res, next) => {
        if (!allowedTypes.includes(req.staffType)) {
            return res.status(403).json({
                status: 'fail',
                message: `Access denied: Requires ${allowedTypes.join(' or ')} staff type`
            });
        }
        next();
    };
};

module.exports = { staffAuth, isManager, checkStaffType };