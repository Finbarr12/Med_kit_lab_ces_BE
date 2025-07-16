"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCustomers = exports.updateCustomer = exports.getCustomerByEmail = exports.getCustomerById = exports.login_customer = exports.createCustomer = void 0;
const express_validator_1 = require("express-validator");
const Customer_1 = __importDefault(require("../models/Customer"));
const createCustomer = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, fullName, phone, password, address } = req.body;
        // Check if customer already exists
        const existingCustomer = await Customer_1.default.findOne({ email });
        if (existingCustomer) {
            return res
                .status(400)
                .json({ message: "Customer already exists with this email" });
        }
        const customer = new Customer_1.default({
            email,
            fullName,
            phone,
            password,
            address,
        });
        await customer.save();
        res.status(201).json({
            message: "Customer created successfully",
            customer,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.createCustomer = createCustomer;
const login_customer = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Customer_1.default.find({ email, password });
        if (!user) {
            return res.status(200).send("User not found");
        }
        return res.status(200).json({
            message: "Authenticated success",
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.login_customer = login_customer;
const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer_1.default.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.json({ customer });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getCustomerById = getCustomerById;
const getCustomerByEmail = async (req, res) => {
    try {
        const customer = await Customer_1.default.findOne({ email: req.params.email });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.json({ customer });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getCustomerByEmail = getCustomerByEmail;
const updateCustomer = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { fullName, phone, address } = req.body;
        const customer = await Customer_1.default.findByIdAndUpdate(req.params.id, { fullName, phone, address }, { new: true, runValidators: true });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.json({
            message: "Customer updated successfully",
            customer,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.updateCustomer = updateCustomer;
const getAllCustomers = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const query = {};
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }
        const customers = await Customer_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const total = await Customer_1.default.countDocuments(query);
        res.json({
            customers,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getAllCustomers = getAllCustomers;
//# sourceMappingURL=customerController.js.map