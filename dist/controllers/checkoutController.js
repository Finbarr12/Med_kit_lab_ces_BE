"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerSessions = exports.getCheckoutSession = exports.getCheckoutSummary = exports.createCheckoutSession = void 0;
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
const Customer_1 = __importDefault(require("../models/Customer"));
const Settings_1 = __importDefault(require("../models/Settings"));
const checkoutSession_1 = __importDefault(require("../models/checkoutSession"));
const createCheckoutSession = async (req, res) => {
    try {
        const { sessionId, customerId } = req.params;
        if (!customerId) {
            return res
                .status(401)
                .json({ message: "User must be logged in to checkout" });
        }
        // Get the cart by sessionId
        const cart = await Cart_1.default.findOne({ sessionId }).populate("items.product", "productName category");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }
        // Validate stock
        for (const cartItem of cart.items) {
            const product = await Product_1.default.findById(cartItem.product);
            if (!product) {
                return res
                    .status(400)
                    .json({ message: `Product not found: ${cartItem.product}` });
            }
            const brand = product.brands.find((b) => b.name === cartItem.brandName);
            if (!brand) {
                return res
                    .status(400)
                    .json({ message: `Brand not found: ${cartItem.brandName}` });
            }
            if (brand.stock < cartItem.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.productName} - ${brand.name}. Available: ${brand.stock}`,
                });
            }
        }
        const sessionItems = cart.items.map((item) => ({
            product: item.product._id,
            brandName: item.brandName,
            quantity: item.quantity,
            price: item.price,
        }));
        const totalAmount = cart.totalAmount + (req.body.shippingFee || 0);
        const checkoutSession = new checkoutSession_1.default({
            customerId,
            items: sessionItems,
            totalAmount,
            shippingFee: req.body.shippingFee || 0,
            notes: req.body.notes,
        });
        await checkoutSession.save();
        await checkoutSession.populate("items.product", "productName category productImage");
        // Clear cart after checkout
        // cart.items = [];
        // cart.totalAmount = 0;
        // await cart.save();
        // Get store settings for bank info
        const settings = await Settings_1.default.findOne();
        const bankInfo = settings?.bankInfo || null;
        return res.status(201).json({
            message: "Checkout session created. Please upload payment proof.",
            session: checkoutSession,
            bankInfo,
            nextStep: "upload_payment_proof",
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Server error", error: error.message });
    }
};
exports.createCheckoutSession = createCheckoutSession;
const getCheckoutSummary = async (req, res) => {
    try {
        const { sessionId, customerId } = req.params;
        if (!customerId) {
            return res
                .status(401)
                .json({ message: "User must be logged in to view checkout summary" });
        }
        // Try to get the cart
        const cart = await Cart_1.default.findOne({ sessionId }).populate("items.product", "productName category productImage");
        let isCartEmpty = !cart || cart.items.length === 0;
        // Get customer details
        const customer = await Customer_1.default.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        // Get store settings
        const settings = await Settings_1.default.findOne();
        // If cart has items, return summary from cart
        if (!isCartEmpty) {
            // Attach customerId to cart if not already
            if (!cart.customerId) {
                cart.customerId = customerId;
                await cart.save();
            }
            return res.json({
                cart,
                customer,
                storeInfo: settings?.storeInfo || null,
                bankInfo: settings?.bankInfo || null,
                summary: {
                    subtotal: cart.totalAmount,
                    shippingFee: 0,
                    total: cart.totalAmount,
                },
            });
        }
        // If cart is empty, get latest checkout session instead
        const latestSession = await checkoutSession_1.default.findOne({ customerId })
            .sort({ createdAt: -1 })
            .populate("items.product", "productName category productImage");
        if (!latestSession) {
            return res
                .status(400)
                .json({ message: "Cart is empty and no previous checkout found." });
        }
        return res.json({
            cart: null,
            checkoutSession: latestSession,
            customer,
            storeInfo: settings?.storeInfo || null,
            bankInfo: settings?.bankInfo || null,
            summary: {
                subtotal: latestSession.totalAmount - latestSession.shippingFee,
                shippingFee: latestSession.shippingFee,
                total: latestSession.totalAmount,
            },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Server error", error: error.message });
    }
};
exports.getCheckoutSummary = getCheckoutSummary;
const getCheckoutSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await checkoutSession_1.default.findById(sessionId).populate("items.product", "productName category productImage");
        if (!session) {
            return res.status(404).json({ message: "Checkout session not found" });
        }
        res.json({ session });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getCheckoutSession = getCheckoutSession;
const getCustomerSessions = async (req, res) => {
    try {
        const { customerId } = req.params;
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const sessions = await checkoutSession_1.default.find({ customerId })
            .populate("items.product", "productName category productImage")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const total = await checkoutSession_1.default.countDocuments({ customerId });
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
exports.getCustomerSessions = getCustomerSessions;
//# sourceMappingURL=checkoutController.js.map