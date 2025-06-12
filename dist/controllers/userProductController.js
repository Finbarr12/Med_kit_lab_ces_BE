"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = exports.getFeaturedProducts = exports.getProductsByCategory = exports.getProductById = exports.getAllProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const getAllProducts = async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 12;
        const category = req.query.category;
        const search = req.query.search;
        const minPrice = Number.parseFloat(req.query.minPrice);
        const maxPrice = Number.parseFloat(req.query.maxPrice);
        const sortBy = req.query.sortBy || "createdAt";
        const sortOrder = req.query.sortOrder || "desc";
        const query = {};
        if (category) {
            query.category = { $regex: category, $options: "i" };
        }
        if (search) {
            query.$or = [
                { productName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
            ];
        }
        // Price filtering (check if any brand falls within price range)
        if (!isNaN(minPrice) || !isNaN(maxPrice)) {
            const priceQuery = {};
            if (!isNaN(minPrice))
                priceQuery.$gte = minPrice;
            if (!isNaN(maxPrice))
                priceQuery.$lte = maxPrice;
            query["brands.price"] = priceQuery;
        }
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
        const products = await Product_1.default.find(query)
            .populate("createdBy", "email")
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const total = await Product_1.default.countDocuments(query);
        // Get unique categories for filtering
        const categories = await Product_1.default.distinct("category");
        res.json({
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            categories,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id).populate("createdBy", "email");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        // Get related products (same category, excluding current product)
        const relatedProducts = await Product_1.default.find({
            category: product.category,
            _id: { $ne: product._id },
        })
            .limit(4)
            .select("productName category productImage brands");
        res.json({
            product,
            relatedProducts,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getProductById = getProductById;
const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 12;
        const products = await Product_1.default.find({
            category: { $regex: category, $options: "i" },
        })
            .populate("createdBy", "email")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const total = await Product_1.default.countDocuments({
            category: { $regex: category, $options: "i" },
        });
        res.json({
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            category,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getProductsByCategory = getProductsByCategory;
const getFeaturedProducts = async (req, res) => {
    try {
        const limit = Number.parseInt(req.query.limit) || 8;
        // Get products with highest stock or most recent
        const products = await Product_1.default.find().populate("createdBy", "email").sort({ createdAt: -1 }).limit(limit);
        res.json({ products });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getFeaturedProducts = getFeaturedProducts;
const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 12;
        if (!q) {
            return res.status(400).json({ message: "Search query is required" });
        }
        const searchQuery = {
            $or: [
                { productName: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { category: { $regex: q, $options: "i" } },
                { "brands.name": { $regex: q, $options: "i" } },
            ],
        };
        const products = await Product_1.default.find(searchQuery)
            .populate("createdBy", "email")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const total = await Product_1.default.countDocuments(searchQuery);
        res.json({
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            searchQuery: q,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.searchProducts = searchProducts;
//# sourceMappingURL=userProductController.js.map