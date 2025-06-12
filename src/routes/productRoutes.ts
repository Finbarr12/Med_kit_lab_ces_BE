import { Router } from "express"
import { body } from "express-validator"
import { uploadProductImage } from "../config/cloudinary"
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByAdmin,
} from "../controllers/productController"

const router = Router()

// Validation rules
const productValidation = [
  body("productName").notEmpty().trim().withMessage("Product name is required"),
  body("category").notEmpty().trim().withMessage("Category is required"),
  body("description").notEmpty().trim().withMessage("Description is required"),
  body("adminId").notEmpty().withMessage("Admin ID is required"),
]

// Routes
router.post("/", uploadProductImage.single("productImage"), productValidation, createProduct)
router.get("/", getAllProducts)
router.get("/admin/:adminId", getProductsByAdmin)
router.get("/:id", getProductById)
router.put("/:id", uploadProductImage.single("productImage"), updateProduct)
router.delete("/:id", deleteProduct)

export default router
