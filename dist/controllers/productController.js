"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const createProduct = async (req, res) => {
    try {
        const { productName, category, description, brands } = req.body;
        const productImages = req.files.map((file) => file.path);
        if (!productImages || productImages.length === 0) {
            return res
                .status(400)
                .json({ message: "At least one product image is required" });
        }
        const product = new Product_1.default({
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
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.createProduct = createProduct;
const getAllProducts = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const search = req.query.search;
        const query = {};
        if (category) {
            query.category = { $regex: category, $options: "i" };
        }
        if (search) {
            query.$or = [
                { productName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        const products = await Product_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const total = await Product_1.default.countDocuments(query);
        res.json({
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ product });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getProductById = getProductById;
const updateProduct = async (req, res) => {
    try {
        const { productName, category, description, brands } = req.body;
        const uploadedImages = req.files || [];
        const updateData = {};
        if (productName)
            updateData.productName = productName;
        if (category)
            updateData.category = category;
        if (description)
            updateData.description = description;
        if (brands) {
            updateData.brands =
                typeof brands === "string" ? JSON.parse(brands) : brands;
        }
        if (uploadedImages.length > 0) {
            const productImages = uploadedImages.map((file) => file.path); // Cloudinary secure_url
            updateData.productImages = productImages;
        }
        const product = await Product_1.default.findByIdAndUpdate(req.params.id, updateData, {
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
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=productController.js.map