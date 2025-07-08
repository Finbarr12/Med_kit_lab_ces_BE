"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bypassRateLimit = exports.requestTimeout = exports.handle429Errors = void 0;
// Custom error handler to prevent 429 errors
const handle429Errors = (error, req, res, next) => {
    // Log the original error for debugging
    console.error("Error intercepted:", {
        status: error.status || error.statusCode,
        message: error.message,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
    });
    // Convert 429 errors to 503 (Service Unavailable) or 500
    if (error.status === 429 ||
        error.statusCode === 429 ||
        error.message?.includes("429")) {
        console.warn("Converting 429 error to 503");
        return res.status(503).json({
            message: "Service temporarily unavailable. Please try again in a moment.",
            error: "RATE_LIMIT_CONVERTED",
            retryAfter: 5, // seconds
        });
    }
    // Handle Cloudinary specific errors
    if (error.message?.includes("cloudinary") ||
        error.message?.includes("upload")) {
        return res.status(500).json({
            message: "File upload service error. Please try again.",
            error: "UPLOAD_SERVICE_ERROR",
        });
    }
    // Handle MongoDB connection errors that might cause 429
    if (error.message?.includes("MongoError") ||
        error.message?.includes("connection")) {
        return res.status(500).json({
            message: "Database connection error. Please try again.",
            error: "DATABASE_ERROR",
        });
    }
    // Pass other errors to default handler
    next(error);
};
exports.handle429Errors = handle429Errors;
// Request timeout middleware to prevent hanging requests
const requestTimeout = (timeoutMs = 30000) => {
    return (req, res, next) => {
        const timeout = setTimeout(() => {
            if (!res.headersSent) {
                res.status(408).json({
                    message: "Request timeout. Please try again.",
                    error: "REQUEST_TIMEOUT",
                });
            }
        }, timeoutMs);
        res.on("finish", () => clearTimeout(timeout));
        res.on("close", () => clearTimeout(timeout));
        next();
    };
};
exports.requestTimeout = requestTimeout;
// Rate limit bypass middleware (removes any rate limiting)
const bypassRateLimit = (req, res, next) => {
    // Remove any rate limit headers that might be set by proxies
    delete req.headers["x-ratelimit-limit"];
    delete req.headers["x-ratelimit-remaining"];
    delete req.headers["x-ratelimit-reset"];
    // Set headers to indicate no rate limiting
    res.setHeader("X-RateLimit-Bypass", "true");
    next();
};
exports.bypassRateLimit = bypassRateLimit;
//# sourceMappingURL=errorHandler.js.map