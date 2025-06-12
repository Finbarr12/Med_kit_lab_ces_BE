import { Router } from "express"
import { body } from "express-validator"
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cartController"

const router = Router()

// Validation rules
const addToCartValidation = [
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("brandName").notEmpty().trim().withMessage("Brand name is required"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
]

const updateCartValidation = [
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("brandName").notEmpty().trim().withMessage("Brand name is required"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
]

const removeFromCartValidation = [
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("brandName").notEmpty().trim().withMessage("Brand name is required"),
]

// Routes
router.get("/:sessionId", getCart)
router.post("/:sessionId/add", addToCartValidation, addToCart)
router.put("/:sessionId/update", updateCartValidation, updateCartItem)
router.delete("/:sessionId/remove", removeFromCartValidation, removeFromCart)
router.delete("/:sessionId/clear", clearCart)

export default router
