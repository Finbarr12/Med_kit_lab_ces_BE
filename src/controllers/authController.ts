import type { Request, Response } from "express";
import User from "../models/User";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find admin (there should only be one)
    const user = await User.findOne();
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
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const setup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phoneNumber } = req.body;

    // Check if admin already exists
    const existingUser = await User.findOne();
    if (existingUser) {
      return res.status(400).json({ message: "Admin already set up" });
    }

    // Create new admin
    const user = new User({ email, password, name, phoneNumber });
    await user.save();

    res.status(201).json({
      message: "Admin setup successful",
      user,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find admin (there should only be one)
    const user = await User.findOne();
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
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAdminInfo = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne().select("-password");
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateEmail = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find admin (there should only be one)
    const user = await User.findOne();
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
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
