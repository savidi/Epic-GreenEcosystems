const express = require("express");
const router = express.Router();

// Import controller functions
const Fertilizer = require("../controllers/FertilizersControlers"); 

// Debug middleware for all fertilizer routes
router.use((req, res, next) => {
    console.log(`\n=== FERTILIZER ROUTE DEBUG ===`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Original URL:', req.originalUrl);
    console.log('Base URL:', req.baseUrl);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('User-Agent:', req.headers['user-agent']);
    console.log('Body:', req.body);
    console.log('Query:', req.query);
    console.log('Params:', req.params);
    
    // Check for unusual patterns
    if (req.method === 'GET' && req.body && Object.keys(req.body).length > 0) {
        console.log('⚠️ WARNING: GET request has body data (this should not happen)');
        console.log('Body content:', JSON.stringify(req.body, null, 2));
    }
    
    // Check for malformed data patterns
    if (req.body && req.body.date) {
        if (req.body.date.endsWith('-')) {
            console.log('⚠️ WARNING: Incomplete date detected:', req.body.date);
        } else if (req.body.date.length < 10) {
            console.log('⚠️ WARNING: Short date detected:', req.body.date);
        }
    }
    
    console.log('=== END DEBUG ===\n');
    next();
});

// Error handling middleware for this router
router.use((error, req, res, next) => {
    console.error('❌ Fertilizer Route Error:', error.message);
    console.error('Request:', req.method, req.originalUrl);
    console.error('Body:', req.body);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: error.message,
            details: error.errors
        });
    }
    
    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID',
            message: 'The provided ID format is invalid'
        });
    }
    
    // Pass to global error handler
    next(error);
});

// GET all fertilizers
router.get("/", (req, res, next) => {
    console.log('📋 GET /fertilizers - Fetching all fertilizers');
    Fertilizer.getAllFertilizers(req, res, next);
});

// POST new fertilizer
router.post("/", (req, res, next) => {
    console.log('📝 POST /fertilizers - Creating new fertilizer');
    console.log('Data received:', req.body);
    
    // Additional validation before passing to controller
    const { fertilizerName, fType, quantity, price, date } = req.body;
    
    if (!fertilizerName || !fType || !quantity || !price || !date) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields',
            message: 'All fields (fertilizerName, fType, quantity, price, date) are required',
            received: req.body
        });
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid date format',
            message: 'Date must be in YYYY-MM-DD format',
            received: date
        });
    }
    
    Fertilizer.addFertilizers(req, res, next);
});

// GET fertilizer by ID
router.get("/:id", (req, res, next) => {
    console.log('🔍 GET /fertilizers/:id - Fetching fertilizer by ID:', req.params.id);
    Fertilizer.getById(req, res, next);
});

// PUT update fertilizer
router.put("/:id", (req, res, next) => {
    console.log('✏️ PUT /fertilizers/:id - Updating fertilizer:', req.params.id);
    console.log('Update data:', req.body);
    Fertilizer.updateFertilizers(req, res, next);
});

// DELETE fertilizer
router.delete("/:id", (req, res, next) => {
    console.log('🗑️ DELETE /fertilizers/:id - Deleting fertilizer:', req.params.id);
    Fertilizer.deleteFertilizers(req, res, next);
});

// Catch-all for unmatched routes within /fertilizers
router.use('*', (req, res) => {
    console.log(`❓ Unmatched fertilizer route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `Fertilizer route ${req.method} ${req.originalUrl} not found`,
        availableRoutes: [
            'GET /fertilizers',
            'POST /fertilizers', 
            'GET /fertilizers/:id',
            'PUT /fertilizers/:id',
            'DELETE /fertilizers/:id'
        ]
    });
});

module.exports = router;