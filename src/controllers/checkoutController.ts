import type { Request, Response } from "express"
import Cart from "../models/Cart"
import Order from "../models/Order"
import Product from "../models/Product"
import Customer from "../models/Customer"
import Settings from "../models/Settings"

export const createOrderFromCart = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params
    const { shippingFee = 0, notes } = req.body

    // Get customer cart
    const cart = await Cart.findOne({ customerId }).populate("items.product", "productName category")
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" })
    }

    // Get customer info
    const customer = await Customer.findById(customerId)
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    // Validate stock availability for all items
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product)
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${cartItem.product}` })
      }

      const brand = product.brands.find((b) => b.name === cartItem.brandName)
      if (!brand) {
        return res.status(400).json({ message: `Brand not found: ${cartItem.brandName}` })
      }

      if (brand.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.productName} - ${brand.name}. Available: ${brand.stock}`,
        })
      }
    }

    // Create order from cart
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      brandName: item.brandName,
      quantity: item.quantity,
      price: item.price,
    }))

    const totalAmount = cart.totalAmount + shippingFee

    const order = new Order({
      customerId,
      customerInfo: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        zipCode: customer.address.zipCode,
      },
      items: orderItems,
      totalAmount,
      shippingFee,
      notes,
      status: "pending_payment",
    })

    await order.save()
    await order.populate("items.product", "productName category productImage")

    // Update stock for all items
    for (const cartItem of cart.items) {
      await Product.updateOne(
        { _id: cartItem.product, "brands.name": cartItem.brandName },
        { $inc: { "brands.$.stock": -cartItem.quantity } },
      )
    }

    // Clear the cart
    cart.items = []
    cart.totalAmount = 0
    await cart.save()

    // Get store bank details for payment
    const settings = await Settings.findOne()
    const bankInfo = settings?.bankInfo || null

    res.status(201).json({
      message: "Order created successfully. Please proceed with payment.",
      order,
      bankInfo,
      nextStep: "upload_payment_proof",
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getOrderSummary = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params

    // Get customer cart
    const cart = await Cart.findOne({ customerId }).populate("items.product", "productName category productImage")
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" })
    }

    // Get customer info
    const customer = await Customer.findById(customerId)
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" })
    }

    // Get store settings for shipping info
    const settings = await Settings.findOne()

    res.json({
      cart,
      customer,
      storeInfo: settings?.storeInfo || null,
      summary: {
        subtotal: cart.totalAmount,
        shippingFee: 0, // Can be calculated based on location
        total: cart.totalAmount,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
