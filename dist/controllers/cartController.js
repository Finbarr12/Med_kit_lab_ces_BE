"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const express_validator_1 = require("express-validator");
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
const getCart = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const cart = await Cart_1.default.findOne({ sessionId }).populate("items.product", "productName category productImage");
        if (!cart) {
            return res.json({
                cart: {
                    sessionId,
                    items: [],
                    totalAmount: 0,
                },
            });
        }
        res.json({ cart });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getCart = getCart;
const addToCart = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { sessionId } = req.params;
        const { productId, brandName, quantity } = req.body;
        // Verify product and brand
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const brand = product.brands.find((b) => b.name === brandName);
        if (!brand) {
            return res.status(404).json({ message: "Brand not found" });
        }
        if (brand.stock < quantity) {
            return res.status(400).json({
                message: `Insufficient stock. Available: ${brand.stock}`,
            });
        }
        // Find or create cart
        let cart = await Cart_1.default.findOne({ sessionId });
        if (!cart) {
            cart = new Cart_1.default({ sessionId, items: [] });
        }
        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId && item.brandName === brandName);
        if (existingItemIndex > -1) {
            // Update existing item
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (newQuantity > brand.stock) {
                return res.status(400).json({
                    message: `Cannot add ${quantity} more. Total would exceed available stock of ${brand.stock}`,
                });
            }
            cart.items[existingItemIndex].quantity = newQuantity;
        }
        else {
            // Add new item
            cart.items.push({
                product: productId,
                brandName,
                quantity,
                price: brand.price,
            });
        }
        await cart.save();
        await cart.populate("items.product", "productName category productImage");
        res.json({
            message: "Item added to cart successfully",
            cart,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { sessionId } = req.params;
        const { productId, brandName, quantity } = req.body;
        const cart = await Cart_1.default.findOne({ sessionId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId && item.brandName === brandName);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart" });
        }
        // Verify stock availability
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const brand = product.brands.find((b) => b.name === brandName);
        if (!brand) {
            return res.status(404).json({ message: "Brand not found" });
        }
        if (quantity > brand.stock) {
            return res.status(400).json({
                message: `Insufficient stock. Available: ${brand.stock}`,
            });
        }
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        await cart.populate("items.product", "productName category productImage");
        res.json({
            message: "Cart item updated successfully",
            cart,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { productId, brandName } = req.body;
        const cart = await Cart_1.default.findOne({ sessionId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        cart.items = cart.items.filter((item) => !(item.product.toString() === productId && item.brandName === brandName));
        await cart.save();
        await cart.populate("items.product", "productName category productImage");
        res.json({
            message: "Item removed from cart successfully",
            cart,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.removeFromCart = removeFromCart;
const clearCart = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const cart = await Cart_1.default.findOne({ sessionId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
        res.json({
            message: "Cart cleared successfully",
            cart,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.clearCart = clearCart;
//# sourceMappingURL=cartController.js.map