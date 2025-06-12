import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import Order from "../models/Order"
import Product from "../models/Product"

export const createOrder = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { customerInfo, items } = req.body

    // Validate products and calculate total
    let totalAmount = 0
    const validatedItems = []

    for (const item of items) {
      const product = await Product.findById(item.product)
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.product}` })
      }

      const brand = product.brands.find((b) => b.name === item.brandName)
      if (!brand) {
        return res.status(400).json({ message: `Brand not found: ${item.brandName}` })
      }

      if (brand.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.productName} - ${brand.name}. Available: ${brand.stock}`,
        })
      }

      validatedItems.push({
        product: item.product,
        brandName: item.brandName,
        quantity: item.quantity,
        price: brand.price,
      })

      totalAmount += brand.price * item.quantity
    }

    const order = new Order({
      customerInfo,
      items: validatedItems,
      totalAmount,
    })

    await order.save()
    await order.populate("items.product", "productName category")

    // Update stock
    for (const item of validatedItems) {
      await Product.updateOne(
        { _id: item.product, "brands.name": item.brandName },
        { $inc: { "brands.$.stock": -item.quantity } },
      )
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const status = req.query.status as string

    const query: any = {}
    if (status) {
      query.status = status
    }

    const orders = await Order.find(query)
      .populate("items.product", "productName category")
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

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true }).populate(
      "items.product",
      "productName category",
    )

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
