import type { Request, Response } from "express"
import CheckoutSession from "../models/CheckoutSession"

export const uploadPaymentProof = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params
    const paymentProof = req.file?.path // Cloudinary secure_url

    if (!paymentProof) {
      return res.status(400).json({ message: "Payment proof is required" })
    }

    // Find checkout session
    const session = await CheckoutSession.findById(sessionId)
    if (!session) {
      return res.status(404).json({ message: "Checkout session not found" })
    }

    if (session.paymentStatus !== "pending" && session.paymentStatus !== "rejected") {
      return res.status(400).json({ message: "Payment proof already submitted or approved" })
    }

    // Update session with payment proof
    session.paymentProof = paymentProof
    session.paymentStatus = "submitted"
    await session.save()

    await session.populate("items.product", "productName category productImage")

    res.json({
      message: "Payment proof uploaded successfully. Awaiting admin verification.",
      session,
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
      query.paymentStatus = status
    } else {
      // Only show sessions with payment proof submitted
      query.paymentStatus = { $in: ["submitted", "approved", "rejected"] }
    }

    const sessions = await CheckoutSession.find(query)
      .populate("items.product", "productName category productImage")
      .populate("customerId", "fullName email phone")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await CheckoutSession.countDocuments(query)

    res.json({
      sessions,
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
    const session = await CheckoutSession.findById(req.params.id)
      .populate("items.product", "productName category productImage")
      .populate("customerId", "fullName email phone address")

    if (!session) {
      return res.status(404).json({ message: "Payment request not found" })
    }

    res.json({ session })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const approvePayment = async (req: Request, res: Response) => {
  try {
    const { adminNotes } = req.body

    const session = await CheckoutSession.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: "approved",
        adminNotes,
      },
      { new: true },
    ).populate("items.product", "productName category productImage")

    if (!session) {
      return res.status(404).json({ message: "Payment request not found" })
    }

    res.json({
      message: "Payment approved successfully. Customer can now add delivery details.",
      session,
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

    const session = await CheckoutSession.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: "rejected",
        rejectionReason,
        adminNotes,
      },
      { new: true },
    ).populate("items.product", "productName category productImage")

    if (!session) {
      return res.status(404).json({ message: "Payment request not found" })
    }

    res.json({
      message: "Payment rejected. Customer can resubmit payment proof.",
      session,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
