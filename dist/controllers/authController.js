"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmail = exports.getAdminInfo = exports.changePassword = exports.setup = exports.login = void 0;
const User_1 = __importDefault(require("../models/User"));
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find admin (there should only be one)
        const user = await User_1.default.findOne();
        if (!user) {
            return res.status(400).json({ message: "Admin account not set up yet" });
        }
        // Check if email matches
        if (user.email !== email) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.login = login;
const setup = async (req, res) => {
    try {
        const { email, password, name, phoneNumber } = req.body;
        // Check if admin already exists
        const existingUser = await User_1.default.findOne();
        if (existingUser) {
            return res.status(400).json({ message: "Admin already set up" });
        }
        // Create new admin
        const user = new User_1.default({ email, password, name, phoneNumber });
        await user.save();
        res.status(201).json({
            message: "Admin setup successful",
            user,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.setup = setup;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        // Find admin (there should only be one)
        const user = await User_1.default.findOne();
        if (!user) {
            return res.status(404).json({ message: "Admin not found" });
        }
        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        // Update password
        user.password = newPassword;
        await user.save();
        res.json({ message: "Password changed successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.changePassword = changePassword;
const getAdminInfo = async (req, res) => {
    try {
        const user = await User_1.default.findOne().select("-password");
        if (!user) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getAdminInfo = getAdminInfo;
const updateEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find admin (there should only be one)
        const user = await User_1.default.findOne();
        if (!user) {
            return res.status(404).json({ message: "Admin not found" });
        }
        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password is incorrect" });
        }
        // Update email
        user.email = email;
        await user.save();
        res.json({
            message: "Email updated successfully",
            user: {
                id: user._id,
                email: user.email,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.updateEmail = updateEmail;
//# sourceMappingURL=authController.js.map