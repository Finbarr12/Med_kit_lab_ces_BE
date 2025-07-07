import type { Request, Response } from "express"
import Payment from "../models/Payment"
import Order from "../models/Order"

export const uploadPaymentProof = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params
    const { paymentMethod = "bank_transfer", transactionReference } = req.body
    const paymentProof = req.file?.path // Cloudinary secure_url

    if (!paymentProof) {
      return res.status(400).json({ message: "Payment proof is required" })
    }

    // Check if order exists
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (order.status !== "pending_payment") {
      return res.status(400).json({ message: "Order is not awaiting payment" })
    }

    // Check if payment request already exists
    const existingPayment = await Payment.findOne({ orderId })
    if (existingPayment) {
      return res.status(400).json({ message: "Payment proof already submitted for this order" })
    }

    const payment = new Payment({
      orderId,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      paymentProof,
      paymentMethod,
      transactionReference,
      customerInfo: order.customerInfo,
    })

    await payment.save()

    // Update order status
    order.status = "payment_submitted"
    order.paymentStatus = "submitted"
    await order.save()

    await payment.populate("orderId", "orderNumber totalAmount")

    res.status(201).json({
      message: "Payment proof uploaded successfully. Awaiting admin verification.",
      payment,
      nextStep: "await_verification",
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
      .populate("orderId", "orderNumber totalAmount status items")
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
    const payment = await Payment.findById(req.params.id).populate({
      path: "orderId",
      populate: {
        path: "items.product",
        select: "productName category productImage",
      },
    })

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
    const { adminNotes } = req.body

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        approvedAt: new Date(),
        adminNotes,
      },
      { new: true },
    ).populate("orderId", "orderNumber")

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    // Update order status
    const order = await Order.findByIdAndUpdate(payment.orderId, {
      status: "awaiting_delivery_details",
      paymentStatus: "confirmed",
    })

    res.json({
      message: "Payment approved successfully. Customer can now add delivery details.",
      payment,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const rejectPayment = async (req: Request, res: Response) => {
  try {
    const { rejectionReason, adminNotes } = req.body

    if (!rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required" })
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectionReason,
        adminNotes,
        approvedAt: new Date(),
      },
      { new: true },
    ).populate("orderId", "orderNumber")

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    // Update order status back to pending payment
    await Order.findByIdAndUpdate(payment.orderId, {
      status: "pending_payment",
      paymentStatus: "failed",
    })

    res.json({
      message: "Payment rejected. Customer needs to resubmit payment proof.",
      payment,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getPaymentByOrderId = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params

    const payment = await Payment.findOne({ orderId }).populate("orderId", "orderNumber totalAmount status")

    if (!payment) {
      return res.status(404).json({ message: "Payment not found for this order" })
    }

    res.json({ payment })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
