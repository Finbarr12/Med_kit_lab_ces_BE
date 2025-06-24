import type { Request, Response } from "express";
import Settings from "../models/Settings";

export const getSettings = async (req: Request, res: Response) => {
  try {
    // There should only be one settings document
    let settings = await Settings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({
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
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateStoreInfo = async (req: Request, res: Response) => {
  try {
    const { name, address, phone, email, description } = req.body;
    const logo = req.file?.path; // Cloudinary URL if uploaded

    // Find settings or create if not exists
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
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
    } else {
      // Update existing store info
      settings.storeInfo.name = name || settings.storeInfo.name;
      settings.storeInfo.address = address || settings.storeInfo.address;
      settings.storeInfo.phone = phone || settings.storeInfo.phone;
      settings.storeInfo.email = email || settings.storeInfo.email;
      settings.storeInfo.description =
        description || settings.storeInfo.description;
    }

    await settings.save();

    res.json({
      message: "Store information updated successfully",
      settings,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateBankInfo = async (req: Request, res: Response) => {
  try {
    const { bankName, accountNumber, accountName } = req.body;

    // Find settings or create if not exists
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
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
    } else {
      // Update existing bank info
      settings.bankInfo.bankName = bankName || settings.bankInfo.bankName;
      settings.bankInfo.accountNumber =
        accountNumber || settings.bankInfo.accountNumber;
      settings.bankInfo.accountName =
        accountName || settings.bankInfo.accountName;
    }

    await settings.save();

    res.json({
      message: "Bank information updated successfully",
      settings,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
