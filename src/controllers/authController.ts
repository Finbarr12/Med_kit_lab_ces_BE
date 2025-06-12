import type { Request, Response } from "express"
import { body, validationResult } from "express-validator"
import User from "../models/User"

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Check if admin already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Admin already exists with this email" })
    }

    // Create new admin
    const user = new User({ email, password })
    await user.save()

    res.status(201).json({
      message: "Admin registered successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Find admin
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await User.find({}, { password: 0 }).sort({ createdAt: -1 })

    res.json({
      admins,
      total: admins.length,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getAdminById = async (req: Request, res: Response) => {
  try {
    const admin = await User.findById(req.params.id, { password: 0 })

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" })
    }

    res.json({ admin })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Validation rules
export const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
]

export const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
]
