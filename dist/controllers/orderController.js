"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrderByNumber = exports.getOrderById = exports.getAllOrders = exports.createOrder = void 0;
const express_validator_1 = require("express-validator");
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const Customer_1 = __importDefault(require("../models/Customer"));
const createOrder = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { customerInfo, items, customerId } = req.body;
        // If customerId is provided, verify the customer exists
        if (customerId) {
            const customer = await Customer_1.default.findById(customerId);
            if (!customer) {
                return res.status(404).json({ message: "Customer not found" });
            }
        }
        // Validate products and calculate total
        let totalAmount = 0;
        const validatedItems = [];
        for (const item of items) {
            const product = await Product_1.default.findById(item.product);
            if (!product) {
                return res.status(400).json({ message: `Product not found: ${item.product}` });
            }
            const brand = product.brands.find((b) => b.name === item.brandName);
            if (!brand) {
                return res.status(400).json({ message: `Brand not found: ${item.brandName}` });
            }
            if (brand.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.productName} - ${brand.name}. Available: ${brand.stock}`,
                });
            }
            validatedItems.push({
                product: item.product,
                brandName: item.brandName,
                quantity: item.quantity,
                price: brand.price,
            });
            totalAmount += brand.price * item.quantity;
        }
        const order = new Order_1.default({
            customerInfo,
            items: validatedItems,
            totalAmount,
            ...(customerId && { customerId }), // Only add customerId if provided
        });
        await order.save();
        await order.populate("items.product", "productName category");
        // Update stock
        for (const item of validatedItems) {
            await Product_1.default.updateOne({ _id: item.product, "brands.name": item.brandName }, { $inc: { "brands.$.stock": -item.quantity } });
        }
        res.status(201).json({
            message: "Order created successfully",
            order,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.createOrder = createOrder;
const getAllOrders = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const query = {};
        if (status) {
            query.status = status;
        }
        const orders = await Order_1.default.find(query)
            .populate("items.product", "productName category")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const total = await Order_1.default.countDocuments(query);
        res.json({
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getAllOrders = getAllOrders;
const getOrderById = async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id).populate("items.product", "productName category productImage");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json({ order });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getOrderById = getOrderById;
const getOrderByNumber = async (req, res) => {
    try {
        const order = await Order_1.default.findOne({ orderNumber: req.params.orderNumber }).populate("items.product", "productName category productImage");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json({ order });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getOrderByNumber = getOrderByNumber;
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true }).populate("items.product", "productName category");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json({
            message: "Order status updated successfully",
            order,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=orderController.js.map