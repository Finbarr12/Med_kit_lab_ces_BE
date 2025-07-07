import type { Request, Response } from "express"
import Order from "../models/Order"

export const addDeliveryDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params
    const { fullName, phone, address, city, state, zipCode, landmark, deliveryInstructions } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (order.status !== "awaiting_delivery_details") {
      return res.status(400).json({
        message: "Order is not ready for delivery details. Payment must be confirmed first.",
      })
    }

    // Update delivery details
    order.deliveryDetails = {
      fullName,
      phone,
      address,
      city,
      state,
      zipCode,
      landmark,
      deliveryInstructions,
    }

    order.status = "processing"
    await order.save()

    await order.populate("items.product", "productName category productImage")

    res.json({
      message: "Delivery details added successfully. Your order is now being processed.",
      order,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const updateDeliveryDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params
    const { fullName, phone, address, city, state, zipCode, landmark, deliveryInstructions } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (!order.deliveryDetails) {
      return res.status(400).json({ message: "No delivery details found for this order" })
    }

    if (order.status === "shipped" || order.status === "delivered") {
      return res.status(400).json({ message: "Cannot update delivery details for shipped/delivered orders" })
    }

    // Update delivery details
    order.deliveryDetails = {
      fullName: fullName || order.deliveryDetails.fullName,
      phone: phone || order.deliveryDetails.phone,
      address: address || order.deliveryDetails.address,
      city: city || order.deliveryDetails.city,
      state: state || order.deliveryDetails.state,
      zipCode: zipCode || order.deliveryDetails.zipCode,
      landmark: landmark || order.deliveryDetails.landmark,
      deliveryInstructions: deliveryInstructions || order.deliveryDetails.deliveryInstructions,
    }

    await order.save()
    await order.populate("items.product", "productName category productImage")

    res.json({
      message: "Delivery details updated successfully",
      order,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params
    const { status, trackingNumber } = req.body

    const validStatuses = ["processing", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const updateData: any = { status }
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber
    }

    const order = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    }).populate("items.product", "productName category productImage")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json({
      message: "Order status updated successfully",
      order,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
