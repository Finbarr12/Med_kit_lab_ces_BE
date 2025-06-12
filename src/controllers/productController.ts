import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import Product from "../models/Product"

export const createProduct = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { productName, category, description, brands, adminId } = req.body
    const productImage = req.file?.path // Cloudinary secure_url

    if (!productImage) {
      return res.status(400).json({ message: "Product image is required" })
    }

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" })
    }

    const product = new Product({
      productName,
      category,
      description,
      brands: typeof brands === "string" ? JSON.parse(brands) : brands,
      productImage, // This will be the Cloudinary secure_url
      createdBy: adminId,
    })

    await product.save()
    await product.populate("createdBy", "email")

    res.status(201).json({
      message: "Product created successfully",
      product,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const category = req.query.category as string
    const search = req.query.search as string
    const adminId = req.query.adminId as string

    const query: any = {}

    if (category) {
      query.category = { $regex: category, $options: "i" }
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    if (adminId) {
      query.createdBy = adminId
    }

    const products = await Product.find(query)
      .populate("createdBy", "email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments(query)

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate("createdBy", "email")

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ product })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { productName, category, description, brands } = req.body
    const productImage = req.file?.path // Cloudinary secure_url

    const updateData: any = {
      productName,
      category,
      description,
      brands: typeof brands === "string" ? JSON.parse(brands) : brands,
    }

    if (productImage) {
      updateData.productImage = productImage // Cloudinary secure_url
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "email")

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({
      message: "Product updated successfully",
      product,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getProductsByAdmin = async (req: Request, res: Response) => {
  try {
    const { adminId } = req.params
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10

    const products = await Product.find({ createdBy: adminId })
      .populate("createdBy", "email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments({ createdBy: adminId })

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
