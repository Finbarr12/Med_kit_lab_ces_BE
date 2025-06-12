"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPaymentProof = exports.uploadProductImage = void 0;
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = __importDefault(require("multer"));
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Configure Cloudinary storage for products
const productStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: "medkit/products",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        transformation: [{ width: 800, height: 600, crop: "limit" }],
    },
});
// Configure Cloudinary storage for payments
const paymentStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: "medkit/payments",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "pdf"],
        transformation: [{ width: 1200, height: 1600, crop: "limit" }],
    },
});
// Multer upload middleware for products
exports.uploadProductImage = (0, multer_1.default)({
    storage: productStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only image files are allowed"));
        }
    },
});
// Multer upload middleware for payments
exports.uploadPaymentProof = (0, multer_1.default)({
    storage: paymentStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = file.mimetype.startsWith("image/") || file.mimetype === "application/pdf";
        if (mimetype && extname) {
            cb(null, true);
        }
        else {
            cb(new Error("Only image files and PDFs are allowed"));
        }
    },
});
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map