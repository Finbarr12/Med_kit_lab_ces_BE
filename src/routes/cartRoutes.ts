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
router.get("/:customerId", getCart)
router.post("/:customerId/add", addToCartValidation, addToCart)
router.put("/:customerId/update", updateCartValidation, updateCartItem)
router.delete("/:customerId/remove", removeFromCartValidation, removeFromCart)
router.delete("/:customerId/clear", clearCart)

export default router
