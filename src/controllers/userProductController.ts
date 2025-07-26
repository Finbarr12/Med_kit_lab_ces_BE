import type { Request, Response } from "express"
import Product from "../models/Product"
import checkoutSession from "../models/checkoutSession"
import Reviews from "../models/Reviews"

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 12
    const category = req.query.category as string
    const search = req.query.search as string
    const minPrice = Number.parseFloat(req.query.minPrice as string)
    const maxPrice = Number.parseFloat(req.query.maxPrice as string)
    const sortBy = (req.query.sortBy as string) || "createdAt"
    const sortOrder = (req.query.sortOrder as string) || "desc"

    const query: any = {}

    if (category) {
      query.category = { $regex: category, $options: "i" }
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ]
    }

    // Price filtering (check if any brand falls within price range)
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      const priceQuery: any = {}
      if (!isNaN(minPrice)) priceQuery.$gte = minPrice
      if (!isNaN(maxPrice)) priceQuery.$lte = maxPrice

      query["brands.price"] = priceQuery
    }

    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1

    const products = await Product.find(query)
      .populate("createdBy", "email")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments(query)

    // Get unique categories for filtering
    const categories = await Product.distinct("category")

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      categories,
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

    // Get related products (same category, excluding current product)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(4)
      .select("productName category productImage brands")

    res.json({
      product,
      relatedProducts,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 12

    const products = await Product.find({
      category: { $regex: category, $options: "i" },
    })
      .populate("createdBy", "email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments({
      category: { $regex: category, $options: "i" },
    })

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      category,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const limit = Number.parseInt(req.query.limit as string) || 8

    // Get products with highest stock or most recent
    const products = await Product.find().populate("createdBy", "email").sort({ createdAt: -1 }).limit(limit)

    res.json({ products })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 12

    if (!q) {
      return res.status(400).json({ message: "Search query is required" })
    }

    const searchQuery = {
      $or: [
        { productName: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { "brands.name": { $regex: q, $options: "i" } },
      ],
    }

    const products = await Product.find(searchQuery)
      .populate("createdBy", "email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments(searchQuery)

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      searchQuery: q,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}



export const leaveReview = async (req:any, res:any) => {
  try {
    const {customerId, productId} = req.params
    const { rating, comment } = req.body;

    const session = await checkoutSession.findOne({
      customerId,
      "items.product": productId,
    });

    if (!session) {
      return res.status(403).json({ message: "You can only review products you've purchased and received." });
    }

    const existing = await Reviews.findOne({ customerId, productId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product." });
    }

    const review = await Reviews.create({
      customerId,
      productId,
      rating,
      comment
    });

    res.json({ message: "Review submitted successfully", review });
  } catch (error:any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const getProductReviews = async (req:any, res:any) => {
  try {
    const { productId } = req.params;

    const reviews = await Reviews.find({ productId })
      .populate("customerId", "firstName lastName") 
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error:any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};