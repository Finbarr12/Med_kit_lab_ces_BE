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
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const userProductRoutes_1 = __importDefault(require("./routes/userProductRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/payments", paymentRoutes_1.default);
app.use("/api/customers", customerRoutes_1.default);
app.use("/api/cart", cartRoutes_1.default);
app.use("/api/user/products", userProductRoutes_1.default);
app.use("/api/settings", settingsRoutes_1.default);
// Health check route
app.get("/api/health", (req, res) => {
    res.json({
        message: "Medkit API is running!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});
// Error handling middleware
app.use((error, req, res, next) => {
    console.error("Error:", error);
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
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
// Database connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/medkit-app";
        await mongoose_1.default.connect(mongoURI);
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
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
        console.log(`📚 Environment: ${process.env.NODE_ENV || "development"}`);
    });
};
startServer().catch(console.error);
exports.default = app;
//# sourceMappingURL=server.js.map