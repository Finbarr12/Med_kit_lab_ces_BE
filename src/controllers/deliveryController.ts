import type { Request, Response } from "express";
import CheckoutSession from "../models/checkoutSession";
import Order from "../models/Order";
import Product from "../models/Product";
import Customer from "../models/Customer";

export const addDeliveryDetails = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const {
      fullName,
      phone,
      address,
      city,
      state,
      zipCode,
      landmark,
      deliveryInstructions,
    } = req.body;

    const session = await CheckoutSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Checkout session not found" });
    }

    if (session.paymentStatus !== "approved") {
      return res.status(400).json({
        message: "Payment must be approved before adding delivery details",
      });
    }

    // Add delivery details to session
    session.deliveryDetails = {
      fullName,
      phone,
      address,
      city,
      state,
      zipCode,
      landmark,
      deliveryInstructions,
    };

    await session.save();

    // NOW CREATE THE ACTUAL ORDER
    const customer = await Customer.findById(session.customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Create order from approved session
    const order = new Order({
      customerId: session.customerId,
      customerInfo: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        zipCode: customer.address.zipCode,
      },
      items: session.items,
      totalAmount: session.totalAmount,
      shippingFee: session.shippingFee,
      status: "processing",
      paymentStatus: "confirmed",
      deliveryDetails: session.deliveryDetails,
      notes: session.notes,
    });

    await order.save();
    await order.populate("items.product", "productName category productImage");

    // Update stock for all items (now that order is confirmed)
    for (const item of session.items) {
      await Product.updateOne(
        { _id: item.product, "brands.name": item.brandName },
        { $inc: { "brands.$.stock": -item.quantity } }
      );
    }

    res.json({
      message: "Order created successfully! Your order is now being processed.",
      order,
      sessionNumber: session.sessionNumber,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateDeliveryDetails = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const {
      fullName,
      phone,
      address,
      city,
      state,
      zipCode,
      landmark,
      deliveryInstructions,
    } = req.body;

    const session = await CheckoutSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Checkout session not found" });
    }

    if (session.paymentStatus !== "approved") {
      return res
        .status(400)
        .json({ message: "Payment must be approved first" });
    }

    if (!session.deliveryDetails) {
      return res.status(400).json({ message: "No delivery details found" });
    }

    // Update delivery details
    session.deliveryDetails = {
      fullName: fullName || session.deliveryDetails.fullName,
      phone: phone || session.deliveryDetails.phone,
      address: address || session.deliveryDetails.address,
      city: city || session.deliveryDetails.city,
      state: state || session.deliveryDetails.state,
      zipCode: zipCode || session.deliveryDetails.zipCode,
      landmark: landmark || session.deliveryDetails.landmark,
      deliveryInstructions:
        deliveryInstructions || session.deliveryDetails.deliveryInstructions,
    };

    await session.save();

    res.json({
      message: "Delivery details updated successfully",
      session,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const validStatuses = ["processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData: any = { status };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    const order = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    }).populate("items.product", "productName category productImage");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
