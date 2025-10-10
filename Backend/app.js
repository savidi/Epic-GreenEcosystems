require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);








// Routes
const fertilizerRouter = require("./Routes/FertilizerRoute");
const productRouter = require("./Routes/ProductRoute");
const spicesRouter = require("./Routes/Spicegrid");
const router = require("./Routes/SpiceRoute");

const userRouter = require("./Routes/UserRouter");
const spiceRouter = require('./Routes/SpiceSaleRouter');
const orderRouter = require('./Routes/OrderRouter');
const paymentRouter = require('./Routes/PaymentRouter'); 
const salesRouter = require('./Routes/SalesRouter');
const quotationRouter = require('./Routes/QuotationRouter');

// Models
// Models and middleware
const Order = require('./model/Order');
const OrderPayments = require('./model/OrderPayments');
const User = require('./model/Register');


// Middleware
const auth = require('./Middleware/auth');

// Initialize Express App
const app = express();
const JWT_SECRET = process.env.JWT_SECRET; 

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    console.error('Stack:', err.stack);
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// 1. Stripe Webhook (must use express.raw before express.json)
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        try {
            const order = await Order.findById(orderId);
            if (order && order.orderStatus === 'pending') {
                order.orderStatus = 'paid';
                await order.save();

                const payment = new OrderPayments({
                    user: order.customer,
                    order: order._id,
                    amount: order.totalPrice,
                    transactionId: session.id,
                    status: 'succeeded',
                });
                await payment.save();
                console.log('Order and payment updated successfully!');
            }
        } catch (err) {
            console.error('Error updating order after successful payment:', err);
        }
    }
    res.status(200).json({ received: true });
});

// CORS middleware - allow both frontend ports
app.use(cors({ 
  origin: ["http://localhost:3000", "http://localhost:3002"], 
  // MODIFIED: Explicitly allow all common methods, ensuring POST works for email route
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true 
}));

// Static file serving for images
app.use('/images', express.static('images'));

// REQUEST DEDUPLICATION MIDDLEWARE
const recentRequests = new Map();
const REQUEST_CACHE_TIMEOUT = 10000; // Reduced to 10 seconds
const DUPLICATE_WINDOW = 2000; // Reduced to 2 seconds

app.use((req, res, next) => {
    // Skip for GET requests, webhooks, and authentication endpoints
    if (req.method === 'GET' || 
        req.path === '/webhook' || 
        req.path === '/staff/login' || 
        req.path === '/login' || 
        req.path === '/register') {
        return next();
    }

    // Clean old entries more aggressively
    const now = Date.now();
    for (const [key, timestamp] of recentRequests.entries()) {
        if (now - timestamp > REQUEST_CACHE_TIMEOUT) {
            recentRequests.delete(key);
        }
    }

    // Create a unique key for this request
    const requestKey = `${req.method}:${req.url}:${req.headers['user-agent']}`;
    
    // Check if we've seen this exact request recently
    if (recentRequests.has(requestKey)) {
        const lastRequestTime = recentRequests.get(requestKey);
        const timeDiff = now - lastRequestTime;
        
        if (timeDiff < DUPLICATE_WINDOW) { // If same request within 2 seconds
            console.log(`Blocking duplicate request: ${requestKey} (${timeDiff}ms ago)`);
            return res.status(429).json({
                success: false,
                error: 'Duplicate request',
                message: 'This exact request was sent recently. Please wait before retrying.',
                retryAfter: Math.ceil((DUPLICATE_WINDOW - timeDiff) / 1000)
            });
        }
    }
    
    // Store this request timestamp
    recentRequests.set(requestKey, now);
    
    next();
});

// CUSTOM JSON CLEANING MIDDLEWARE
app.use((req, res, next) => {
    // Skip for webhook route (already handled above)
    if (req.path === '/webhook') {
        return next();
    }

    // Only process JSON content-type
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        let rawBody = '';
        
        req.on('data', chunk => {
            rawBody += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                if (rawBody.trim()) {
                    console.log('Raw body received:', rawBody.substring(0, 200));
                    
                    // Clean the JSON string thoroughly
                    let cleanedBody = rawBody
                        .replace(/\u00A0/g, ' ')           // Replace non-breaking spaces
                        .replace(/\u2000-\u200F/g, ' ')   // Replace other Unicode spaces
                        .replace(/\uFEFF/g, '')           // Remove BOM
                        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // Remove control chars except \r\n\t
                        .replace(/\r\n/g, '\n')           // Normalize line endings
                        .replace(/\r/g, '\n')             // Normalize line endings
                        .trim();
                    
                    console.log('Cleaned body:', cleanedBody.substring(0, 200));
                    
                    // Parse the cleaned JSON
                    req.body = JSON.parse(cleanedBody);
                    console.log('Parsed successfully:', req.body);
                } else {
                    req.body = {};
                }
                next();
            } catch (error) {
                console.error('JSON Parse Error:', error.message);
                console.error('Original raw body:', rawBody);
                console.error('Request URL:', req.url);
                console.error('Request Method:', req.method);
                
                // Find problematic characters
                const problematicChars = [];
                for (let i = 0; i < Math.min(rawBody.length, 500); i++) {
                    const char = rawBody[i];
                    const charCode = char.charCodeAt(0);
                    if (charCode > 127 || (charCode < 32 && char !== '\r' && char !== '\n' && char !== '\t' && char !== ' ')) {
                        problematicChars.push({ 
                            char: char === ' ' ? '[SPACE]' : char, 
                            code: charCode, 
                            position: i,
                            context: rawBody.substring(Math.max(0, i-10), i+10)
                        });
                    }
                }
                
                return res.status(400).json({
                    success: false,
                    error: 'Invalid JSON format',
                    message: 'The request contains malformed JSON',
                    details: error.message,
                    originalBody: rawBody.substring(0, 200),
                    problematicCharacters: problematicChars.slice(0, 5)
                });
            }
        });

        req.on('error', (err) => {
            console.error('Request error:', err);
            return res.status(400).json({
                success: false,
                error: 'Request error',
                message: err.message
            });
        });
    } else {
        // Use regular express.json for non-JSON requests
        // MODIFIED: Increase limit to 50mb to handle large PDF Base64 data.
        express.json({ limit: '50mb' })(req, res, next);
    }
});

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Backend API is running", timestamp: new Date().toISOString() });
});

// Health check
app.get("/health", (req, res) => {
    res.json({ 
        status: "OK", 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Public routes
app.use('/api/sales', salesRouter);


// B. Authentication Routes
app.post("/register", async(req,res)=>{
    const {name,gmail,phone,address,password} = req.body;
    try{
        const encryptedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            gmail,
            phone,
            address,
            password: encryptedPassword,
        });
        res.send({status:"ok"});
    }catch(err){
        res.send({status:"err" });
    }
});


app.post("/login", async(req, res)=>{
    const {gmail, password} = req.body;
    try{
        const user = await User.findOne({gmail});
        if(!user){
            return res.json({status:"error", message:"User Not Found"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(isPasswordValid){
            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
            return res.json({ status: "ok", token });
        } else {
            return res.json({status:"error", message:"Incorrect password"});
        }
    } catch(err) {
        console.error(err);
        res.status(500).json({status:"error" , message:"Server error"});
    }
});

// C. Protected Routes (with auth middleware)
app.use("/api/users", auth, userRouter);
app.use("/api", auth, spiceRouter);
app.use("/api/orders", auth, orderRouter);
app.use("/api/payments", auth, paymentRouter);
app.use("/api/quotations", auth, quotationRouter);
app.get('/user-details', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('name gmail phone address');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Spice/Fertilizer/Product routes
app.use("/spices", router);
app.use("/fertilizer", fertilizerRouter);
app.use("/products", productRouter);
app.use("/grids", spicesRouter);

// Additional routes
const plantRoutes = require("./Routes/PlantRoutes");
const growthRoutes = require("./Routes/GrowthRoutes");
const harvestRoutes = require("./Routes/HarvestRoutes");
const supplierRoutes = require("./Routes/SupplierRoutes");
const fertilizersRoutes = require("./Routes/FertilizersRoutes");
const staffRoutes = require("./Routes/StaffRoute");
const fieldWorkerRoutes = require("./Routes/FWRoute");
const attendanceRoutes = require("./Routes/AttendanceRoute");
const taskRoutes = require("./Routes/taskRoutes");
const paymentRoutes = require("./Routes/paymentRoute");

app.use("/plants", plantRoutes);
app.use("/api/growth", growthRoutes);
app.use("/harvests", harvestRoutes);
app.use("/suppliers", supplierRoutes);
app.use("/fertilizers", fertilizersRoutes); // Consolidated fertilizer routes
app.use("/staff", staffRoutes);
app.use("/fieldworkers", fieldWorkerRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/payments", paymentRoutes);
app.use("/tasks", taskRoutes);

// Global error handling middleware
app.use((error, req, res, next) => {
    console.error('Global Error Handler:', error.message);
    console.error('Stack:', error.stack);
    console.error('Request URL:', req.url);
    console.error('Request Method:', req.method);
    
    // Handle JSON parsing errors specifically
    if (error.status === 400 && error.message.includes('JSON')) {
        return res.status(400).json({
            success: false,
            error: 'Invalid JSON format',
            message: 'The request contains malformed JSON with invalid characters',
            details: error.message,
            problematicData: error.body || 'No body data available',
            solution: 'Check your request for hidden Unicode characters or copy-paste issues'
        });
    }
    
    // Handle different types of errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: error.message
        });
    }
    
    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format',
            message: 'The provided ID is not valid'
        });
    }
    
    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            error: 'Duplicate Entry',
            message: 'This record already exists'
        });
    }
    
    // Default error response
    res.status(error.status || 500).json({
        success: false,
        error: 'Server Error',
        message: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        error: 'Route not found',
        method: req.method,
        url: req.url,
        message: `The endpoint ${req.method} ${req.url} does not exist`,
        timestamp: new Date().toISOString()
    });
});

// MongoDB connection and server start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:YnQ3gncYYDHcCXpU@cluster0.odg95ff.mongodb.net/test";

mongoose.connect(MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('Server is ready and crash-resistant');
    });
}).catch((err) => {
    console.error("DB Connection Error:", err);
    process.exit(1);
});