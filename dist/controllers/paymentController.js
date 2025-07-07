"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectPayment = exports.approvePayment = exports.getPaymentById = exports.getAllPaymentRequests = exports.uploadPaymentProof = void 0;
const checkoutSession_1 = __importDefault(require("../models/checkoutSession"));
const uploadPaymentProof = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const paymentProof = req.file?.path; // Cloudinary secure_url
        if (!paymentProof) {
            return res.status(400).json({ message: "Payment proof is required" });
        }
        // Find checkout session
        const session = await checkoutSession_1.default.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Checkout session not found" });
        }
        if (session.paymentStatus !== "pending" &&
            session.paymentStatus !== "rejected") {
            return res
                .status(400)
                .json({ message: "Payment proof already submitted or approved" });
        }
        // Update session with payment proof
        session.paymentProof = paymentProof;
        session.paymentStatus = "submitted";
        await session.save();
        await session.populate("items.product", "productName category productImage");
        res.json({
            message: "Payment proof uploaded successfully. Awaiting admin verification.",
            session,
            nextStep: "await_verification",
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.uploadPaymentProof = uploadPaymentProof;
const getAllPaymentRequests = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const query = {};
        if (status) {
            query.paymentStatus = status;
        }
        else {
            // Only show sessions with payment proof submitted
            query.paymentStatus = { $in: ["submitted", "approved", "rejected"] };
        }
        const sessions = await checkoutSession_1.default.find(query)
            .populate("items.product", "productName category productImage")
            .populate("customerId", "fullName email phone")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const total = await checkoutSession_1.default.countDocuments(query);
        res.json({
            sessions,
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
        const session = await checkoutSession_1.default.findById(req.params.id)
            .populate("items.product", "productName category productImage")
            .populate("customerId", "fullName email phone address");
        if (!session) {
            return res.status(404).json({ message: "Payment request not found" });
        }
        res.json({ session });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getPaymentById = getPaymentById;
const approvePayment = async (req, res) => {
    try {
        const { adminNotes } = req.body;
        const session = await checkoutSession_1.default.findByIdAndUpdate(req.params.id, {
            paymentStatus: "approved",
            adminNotes,
        }, { new: true }).populate("items.product", "productName category productImage");
        if (!session) {
            return res.status(404).json({ message: "Payment request not found" });
        }
        res.json({
            message: "Payment approved successfully. Customer can now add delivery details.",
            session,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.approvePayment = approvePayment;
const rejectPayment = async (req, res) => {
    try {
        const { rejectionReason, adminNotes } = req.body;
        if (!rejectionReason) {
            return res.status(400).json({ message: "Rejection reason is required" });
        }
        const session = await checkoutSession_1.default.findByIdAndUpdate(req.params.id, {
            paymentStatus: "rejected",
            rejectionReason,
            adminNotes,
        }, { new: true }).populate("items.product", "productName category productImage");
        if (!session) {
            return res.status(404).json({ message: "Payment request not found" });
        }
        res.json({
            message: "Payment rejected. Customer can resubmit payment proof.",
            session,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.rejectPayment = rejectPayment;
//# sourceMappingURL=paymentController.js.map