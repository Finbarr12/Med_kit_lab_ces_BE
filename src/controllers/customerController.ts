import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import Customer from "../models/Customer"

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, fullName, phone, address } = req.body

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email })
    if (existingCustomer) {
      return res.status(400).json({ message: "Customer already exists with this email" })
    }

    const customer = new Customer({
      email,
      fullName,
      phone,
      address,
    })

    await customer.save()

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id)

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    res.json({ customer })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getCustomerByEmail = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findOne({ email: req.params.email })

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    res.json({ customer })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { fullName, phone, address } = req.body

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { fullName, phone, address },
      { new: true, runValidators: true },
    )

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    res.json({
      message: "Customer updated successfully",
      customer,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const search = req.query.search as string

    const query: any = {}

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ]
    }

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Customer.countDocuments(query)

    res.json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
