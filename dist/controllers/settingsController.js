"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBankInfo = exports.updateStoreInfo = exports.getSettings = void 0;
const Settings_1 = __importDefault(require("../models/Settings"));
const getSettings = async (req, res) => {
    try {
        // There should only be one settings document
        let settings = await Settings_1.default.findOne();
        // If no settings exist, create default settings
        if (!settings) {
            settings = await Settings_1.default.create({
                storeInfo: {
                    name: "Medkit Store",
                    address: "123 Health Street",
                    phone: "+1234567890",
                    email: "contact@medkitstore.com",
                    description: "Your trusted medical supplies store",
                },
                bankInfo: {
                    bankName: "Default Bank",
                    accountNumber: "0000000000",
                    accountName: "Medkit Store",
                },
            });
        }
        res.json({ settings });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getSettings = getSettings;
const updateStoreInfo = async (req, res) => {
    try {
        const { name, address, phone, email, description } = req.body;
        const logo = req.file?.path; // Cloudinary URL if uploaded
        // Find settings or create if not exists
        let settings = await Settings_1.default.findOne();
        if (!settings) {
            settings = new Settings_1.default({
                storeInfo: {
                    name,
                    address,
                    phone,
                    email,
                    description,
                },
                bankInfo: {
                    bankName: "Default Bank",
                    accountNumber: "0000000000",
                    accountName: "Default Name",
                },
            });
        }
        else {
            // Update existing store info
            settings.storeInfo.name = name || settings.storeInfo.name;
            settings.storeInfo.address = address || settings.storeInfo.address;
            settings.storeInfo.phone = phone || settings.storeInfo.phone;
            settings.storeInfo.email = email || settings.storeInfo.email;
            settings.storeInfo.description = description || settings.storeInfo.description;
        }
        // Update logo if provided
        if (logo) {
            settings.storeInfo.logo = logo;
        }
        await settings.save();
        res.json({
            message: "Store information updated successfully",
            settings,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.updateStoreInfo = updateStoreInfo;
const updateBankInfo = async (req, res) => {
    try {
        const { bankName, accountNumber, accountName } = req.body;
        // Find settings or create if not exists
        let settings = await Settings_1.default.findOne();
        if (!settings) {
            settings = new Settings_1.default({
                storeInfo: {
                    name: "Medkit Store",
                    address: "123 Health Street",
                    phone: "+1234567890",
                    email: "contact@medkitstore.com",
                    description: "Your trusted medical supplies store",
                },
                bankInfo: {
                    bankName,
                    accountNumber,
                    accountName,
                },
            });
        }
        else {
            // Update existing bank info
            settings.bankInfo.bankName = bankName || settings.bankInfo.bankName;
            settings.bankInfo.accountNumber = accountNumber || settings.bankInfo.accountNumber;
            settings.bankInfo.accountName = accountName || settings.bankInfo.accountName;
        }
        await settings.save();
        res.json({
            message: "Bank information updated successfully",
            settings,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.updateBankInfo = updateBankInfo;
//# sourceMappingURL=settingsController.js.map