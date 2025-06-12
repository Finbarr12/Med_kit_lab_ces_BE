import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import Cart from "../models/Cart"
import Product from "../models/Product"

export const getCart = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params

    const cart = await Cart.findOne({ sessionId }).populate("items.product", "productName category productImage")

    if (!cart) {
      return res.json({
        cart: {
          sessionId,
          items: [],
          totalAmount: 0,
        },
      })
    }

    res.json({ cart })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const addToCart = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { sessionId } = req.params
    const { productId, brandName, quantity } = req.body

    // Verify product and brand
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const brand = product.brands.find((b) => b.name === brandName)
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" })
    }

    if (brand.stock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${brand.stock}`,
      })
    }

    // Find or create cart
    let cart = await Cart.findOne({ sessionId })
    if (!cart) {
      cart = new Cart({ sessionId, items: [] })
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.brandName === brandName,
    )

    if (existingItemIndex > -1) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity
      if (newQuantity > brand.stock) {
        return res.status(400).json({
          message: `Cannot add ${quantity} more. Total would exceed available stock of ${brand.stock}`,
        })
      }
      cart.items[existingItemIndex].quantity = newQuantity
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        brandName,
        quantity,
        price: brand.price,
      })
    }

    await cart.save()
    await cart.populate("items.product", "productName category productImage")

    res.json({
      message: "Item added to cart successfully",
      cart,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { sessionId } = req.params
    const { productId, brandName, quantity } = req.body

    const cart = await Cart.findOne({ sessionId })
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.brandName === brandName,
    )

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" })
    }

    // Verify stock availability
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const brand = product.brands.find((b) => b.name === brandName)
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" })
    }

    if (quantity > brand.stock) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${brand.stock}`,
      })
    }

    cart.items[itemIndex].quantity = quantity
    await cart.save()
    await cart.populate("items.product", "productName category productImage")

    res.json({
      message: "Cart item updated successfully",
      cart,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params
    const { productId, brandName } = req.body

    const cart = await Cart.findOne({ sessionId })
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    cart.items = cart.items.filter((item) => !(item.product.toString() === productId && item.brandName === brandName))

    await cart.save()
    await cart.populate("items.product", "productName category productImage")

    res.json({
      message: "Item removed from cart successfully",
      cart,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const clearCart = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params

    const cart = await Cart.findOne({ sessionId })
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    cart.items = []
    cart.totalAmount = 0
    await cart.save()

    res.json({
      message: "Cart cleared successfully",
      cart,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
