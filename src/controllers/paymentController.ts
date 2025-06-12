import type { Request, Response } from "express"
import Payment from "../models/Payment"
import Order from "../models/Order"

export const createPaymentRequest = async (req: Request, res: Response) => {
  try {
    const { orderId, customerInfo } = req.body
    const paymentProof = req.file?.path // Cloudinary secure_url

    if (!paymentProof) {
      return res.status(400).json({ message: "Payment proof is required" })
    }

    // Check if order exists
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if payment request already exists
    const existingPayment = await Payment.findOne({ orderId })
    if (existingPayment) {
      return res.status(400).json({ message: "Payment request already exists for this order" })
    }

    const payment = new Payment({
      orderId,
      amount: order.totalAmount,
      paymentProof, // Cloudinary secure_url
      customerInfo,
    })

    await payment.save()
    await payment.populate("orderId", "orderNumber totalAmount")

    res.status(201).json({
      message: "Payment request submitted successfully",
      payment,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getAllPaymentRequests = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const status = req.query.status as string

    const query: any = {}
    if (status) {
      query.status = status
    }

    const payments = await Payment.find(query)
      .populate("orderId", "orderNumber totalAmount status")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Payment.countDocuments(query)

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("orderId", "orderNumber totalAmount status items")

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    res.json({ payment })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const approvePayment = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        approvedAt: new Date(),
      },
      { new: true },
    ).populate("orderId", "orderNumber")

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    // Update order status to confirmed
    await Order.findByIdAndUpdate(payment.orderId, { status: "confirmed" })

    res.json({
      message: "Payment approved successfully",
      payment,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const rejectPayment = async (req: Request, res: Response) => {
  try {
    const { rejectionReason } = req.body

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectionReason,
        approvedAt: new Date(),
      },
      { new: true },
    ).populate("orderId", "orderNumber")

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    res.json({
      message: "Payment rejected successfully",
      payment,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
