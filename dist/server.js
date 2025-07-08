"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
// Import custom middleware
const errorHandler_1 = require("./middleware/errorHandler");
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const userProductRoutes_1 = __importDefault(require("./routes/userProductRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
const checkoutRoutes_1 = __importDefault(require("./routes/checkoutRoutes"));
const deliveryRoutes_1 = __importDefault(require("./routes/deliveryRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Apply rate limit bypass first
app.use(errorHandler_1.bypassRateLimit);
// Apply request timeout
app.use((0, errorHandler_1.requestTimeout)(60000)); // 60 second timeout
// Middleware - Remove any potential rate limiting
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
}));
// Increase payload limits
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
// Add request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/payments", paymentRoutes_1.default);
app.use("/api/customers", customerRoutes_1.default);
app.use("/api/cart", cartRoutes_1.default);
app.use("/api/user/products", userProductRoutes_1.default);
app.use("/api/settings", settingsRoutes_1.default);
app.use("/api/checkout", checkoutRoutes_1.default);
app.use("/api/delivery", deliveryRoutes_1.default);
// Health check route
app.get("/api/health", (req, res) => {
    res.json({
        message: "Medkit API is running!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime(),
        rateLimitBypass: true,
    });
});
// Apply 429 error handler before general error handler
app.use(errorHandler_1.handle429Errors);
// General error handling middleware
app.use((error, req, res, next) => {
    console.error("Final Error Handler:", error);
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res
                .status(400)
                .json({ message: "File too large. Maximum size is 50MB." });
        }
    }
    res.status(error.status || 500).json({
        message: error.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
});
// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ message: "Route not found" });
});
// Database connection with optimized settings
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/medkit-app";
        await mongoose_1.default.connect(mongoURI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            // bufferMaxEntries: 0,
            bufferCommands: false,
        });
        console.log("✅ Connected to MongoDB");
    }
    catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};
// Start server
const startServer = async () => {
    await connectDB();
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
        console.log(`📚 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`🚫 Rate limiting: DISABLED`);
    });
    // Increase server timeouts
    server.timeout = 120000; // 2 minutes
    server.keepAliveTimeout = 65000; // 65 seconds
    server.headersTimeout = 66000; // 66 seconds
};
startServer().catch(console.error);
exports.default = app;
//# sourceMappingURL=server.js.map