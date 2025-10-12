// Middleware/staffAuth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Required authentication - throws error if no token
const staffAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                status: 'fail',
                message: 'Authentication failed: No token provided' 
            });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, JWT_SECRET);
        
        req.staffId = decodedToken.staffId;
        req.staffType = decodedToken.staffType;
        req.position = decodedToken.position;
        req.isAuthenticated = true;
        
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

// Optional authentication - doesn't throw error if no token
const optionalStaffAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.isAuthenticated = false;
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, JWT_SECRET);
        
        req.staffId = decodedToken.staffId;
        req.staffType = decodedToken.staffType;
        req.position = decodedToken.position;
        req.isAuthenticated = true;
        
        next();
    } catch (error) {
        req.isAuthenticated = false;
        next();
    }
};

// Check if user is a manager
const isManager = (req, res, next) => {
    if (!req.isAuthenticated) {
        return res.status(401).json({
            status: 'fail',
            message: 'Authentication required for this operation'
        });
    }
    
    if (req.position !== 'Manager') {
        return res.status(403).json({
            status: 'fail',
            message: 'Access denied: Manager privileges required'
        });
    }
    
    next();
};

// Check specific staff type
const checkStaffType = (...allowedTypes) => {
    return (req, res, next) => {
        if (!req.isAuthenticated) {
            return res.status(401).json({
                status: 'fail',
                message: 'Authentication required'
            });
        }
        
        if (!allowedTypes.includes(req.staffType)) {
            return res.status(403).json({
                status: 'fail',
                message: `Access denied: Requires ${allowedTypes.join(' or ')} staff type`
            });
        }
        next();
    };
};

module.exports = { staffAuth, optionalStaffAuth, isManager, checkStaffType };