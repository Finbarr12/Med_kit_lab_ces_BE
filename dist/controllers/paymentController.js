"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectPayment = exports.approvePayment = exports.getPaymentById = exports.getAllPaymentRequests = exports.createPaymentRequest = void 0;
const Payment_1 = __importDefault(require("../models/Payment"));
const Order_1 = __importDefault(require("../models/Order"));
const createPaymentRequest = async (req, res) => {
    try {
        const { orderId, customerInfo } = req.body;
        const paymentProof = req.file?.path; // Cloudinary secure_url
        if (!paymentProof) {
            return res.status(400).json({ message: "Payment proof is required" });
        }
        // Check if order exists
        const order = await Order_1.default.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        // Check if payment request already exists
        const existingPayment = await Payment_1.default.findOne({ orderId });
        if (existingPayment) {
            return res.status(400).json({ message: "Payment request already exists for this order" });
        }
        const payment = new Payment_1.default({
            orderId,
            amount: order.totalAmount,
            paymentProof, // Cloudinary secure_url
            customerInfo,
        });
        await payment.save();
        await payment.populate("orderId", "orderNumber totalAmount");
        res.status(201).json({
            message: "Payment request submitted successfully",
            payment,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.createPaymentRequest = createPaymentRequest;
const getAllPaymentRequests = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const query = {};
        if (status) {
            query.status = status;
        }
        const payments = await Payment_1.default.find(query)
            .populate("orderId", "orderNumber totalAmount status")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const total = await Payment_1.default.countDocuments(query);
        res.json({
            payments,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getAllPaymentRequests = getAllPaymentRequests;
const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment_1.default.findById(req.params.id).populate("orderId", "orderNumber totalAmount status items");
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.json({ payment });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getPaymentById = getPaymentById;
const approvePayment = async (req, res) => {
    try {
        const payment = await Payment_1.default.findByIdAndUpdate(req.params.id, {
            status: "approved",
            approvedAt: new Date(),
        }, { new: true }).populate("orderId", "orderNumber");
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        // Update order status to confirmed
        await Order_1.default.findByIdAndUpdate(payment.orderId, { status: "confirmed" });
        res.json({
            message: "Payment approved successfully",
            payment,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.approvePayment = approvePayment;
const rejectPayment = async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        const payment = await Payment_1.default.findByIdAndUpdate(req.params.id, {
            status: "rejected",
            rejectionReason,
            approvedAt: new Date(),
        }, { new: true }).populate("orderId", "orderNumber");
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.json({
            message: "Payment rejected successfully",
            payment,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.rejectPayment = rejectPayment;
//# sourceMappingURL=paymentController.js.map