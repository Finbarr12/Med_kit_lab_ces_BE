"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.updateDeliveryDetails = exports.addDeliveryDetails = void 0;
const checkoutSession_1 = __importDefault(require("../models/checkoutSession"));
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const Customer_1 = __importDefault(require("../models/Customer"));
const addDeliveryDetails = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { fullName, phone, address, city, state, zipCode, landmark, deliveryInstructions, } = req.body;
        // Find latest approved session for customer
        const session = await checkoutSession_1.default.findOne({
            customerId,
            paymentStatus: "approved",
        }).sort({ createdAt: -1 });
        if (!session) {
            return res
                .status(404)
                .json({ message: "No approved checkout session found" });
        }
        // Add delivery details
        session.deliveryDetails = {
            fullName,
            phone,
            address,
            city,
            state,
            zipCode,
            landmark,
            deliveryInstructions,
        };
        await session.save();
        // Retrieve customer
        const customer = await Customer_1.default.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        // Create order
        const order = new Order_1.default({
            customerId,
            customerInfo: {
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone,
                address: customer.address.street,
                city: customer.address.city,
                state: customer.address.state,
                zipCode: customer.address.zipCode,
            },
            items: session.items,
            totalAmount: session.totalAmount,
            shippingFee: session.shippingFee,
            status: "processing",
            paymentStatus: "confirmed",
            deliveryDetails: session.deliveryDetails,
            notes: session.notes,
        });
        await order.save();
        await order.populate("items.product", "productName category productImage");
        // Update stock
        for (const item of session.items) {
            await Product_1.default.updateOne({ _id: item.product, "brands.name": item.brandName }, { $inc: { "brands.$.stock": -item.quantity } });
        }
        res.json({
            message: "Order created successfully! Your order is now being processed.",
            order,
            sessionNumber: session.sessionNumber,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.addDeliveryDetails = addDeliveryDetails;
const updateDeliveryDetails = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { fullName, phone, address, city, state, zipCode, landmark, deliveryInstructions, } = req.body;
        // Find the latest approved session for the customer
        const session = await checkoutSession_1.default.findOne({
            customerId,
            paymentStatus: "approved",
        }).sort({ createdAt: -1 });
        if (!session) {
            return res
                .status(404)
                .json({ message: "No approved checkout session found" });
        }
        if (!session.deliveryDetails) {
            return res.status(400).json({ message: "No delivery details to update" });
        }
        // Update fields if provided
        session.deliveryDetails = {
            fullName: fullName || session.deliveryDetails.fullName,
            phone: phone || session.deliveryDetails.phone,
            address: address || session.deliveryDetails.address,
            city: city || session.deliveryDetails.city,
            state: state || session.deliveryDetails.state,
            zipCode: zipCode || session.deliveryDetails.zipCode,
            landmark: landmark || session.deliveryDetails.landmark,
            deliveryInstructions: deliveryInstructions || session.deliveryDetails.deliveryInstructions,
        };
        await session.save();
        res.json({
            message: "Delivery details updated successfully",
            session,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.updateDeliveryDetails = updateDeliveryDetails;
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, trackingNumber } = req.body;
        const validStatuses = ["processing", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const updateData = { status };
        if (trackingNumber) {
            updateData.trackingNumber = trackingNumber;
        }
        const order = await Order_1.default.findByIdAndUpdate(orderId, updateData, {
            new: true,
            runValidators: true,
        }).populate("items.product", "productName category productImage");
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
//# sourceMappingURL=deliveryController.js.map