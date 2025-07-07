import type { Request, Response } from "express"
import Order from "../models/Order"

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const status = req.query.status as string
    const paymentStatus = req.query.paymentStatus as string

    const query: any = {}
    if (status) {
      query.status = status
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus
    }

    const orders = await Order.find(query)
      .populate("items.product", "productName category productImage")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Order.countDocuments(query)

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product", "productName category productImage")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json({ order })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getOrderByNumber = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber }).populate(
      "items.product",
      "productName category productImage",
    )

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json({ order })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getCustomerOrders = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10

    const orders = await Order.find({ customerId })
      .populate("items.product", "productName category productImage")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Order.countDocuments({ customerId })

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
