import type { Request, Response } from "express";
import Product from "../models/Product";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { productName, category, description, brands } = req.body;

    const productImages = (req.files as Express.Multer.File[]).map(
      (file) => file.path
    );

    if (!productImages || productImages.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one product image is required" });
    }

    const product = new Product({
      productName,
      category,
      description,
      brands: typeof brands === "string" ? JSON.parse(brands) : brands,
      productImages, // Array of Cloudinary secure URLs
      createdBy: "admin",
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const search = req.query.search as string;

    const query: any = {};

    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { productName, category, description, brands } = req.body;
    const uploadedImages = (req.files as Express.Multer.File[]) || [];

    const updateData: any = {};

    if (productName) updateData.productName = productName;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (brands) {
      updateData.brands =
        typeof brands === "string" ? JSON.parse(brands) : brands;
    }

    if (uploadedImages.length > 0) {
      const productImages = uploadedImages.map((file) => file.path); // Cloudinary secure_url
      updateData.productImages = productImages;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
