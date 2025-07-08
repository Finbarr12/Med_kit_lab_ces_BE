import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

// Import custom middleware
import {
  handle429Errors,
  requestTimeout,
  bypassRateLimit,
} from "./middleware/errorHandler";

// Import routes
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import customerRoutes from "./routes/customerRoutes";
import cartRoutes from "./routes/cartRoutes";
import userProductRoutes from "./routes/userProductRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import checkoutRoutes from "./routes/checkoutRoutes";
import deliveryRoutes from "./routes/deliveryRoutes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Apply rate limit bypass first
app.use(bypassRateLimit);

// Apply request timeout
app.use(requestTimeout(60000)); // 60 second timeout

// Middleware - Remove any potential rate limiting
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// Increase payload limits
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/user/products", userProductRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/delivery", deliveryRoutes);

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
app.use(handle429Errors);

// General error handling middleware
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Final Error Handler:", error);

    if (error instanceof multer.MulterError) {
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
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Database connection with optimized settings
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/medkit-app";
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // bufferMaxEntries: 0,
      bufferCommands: false,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
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

export default app;
