import { Router } from "express"
import { body } from "express-validator"
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
} from "../controllers/orderController"

const router = Router()

// Validation rules
const orderValidation = [
  body("customerId").optional().isMongoId().withMessage("Invalid customer ID"),
  body("customerInfo.fullName").notEmpty().trim().withMessage("Full name is required"),
  body("customerInfo.email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("customerInfo.phone").notEmpty().trim().withMessage("Phone is required"),
  body("customerInfo.address").notEmpty().trim().withMessage("Address is required"),
  body("customerInfo.city").notEmpty().trim().withMessage("City is required"),
  body("customerInfo.state").notEmpty().trim().withMessage("State is required"),
  body("customerInfo.zipCode").notEmpty().trim().withMessage("Zip code is required"),
  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
]

const statusValidation = [
  body("status")
    .isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid status"),
]

// Routes
router.post("/", orderValidation, createOrder)
router.get("/", getAllOrders)
router.get("/number/:orderNumber", getOrderByNumber)
router.get("/:id", getOrderById)
router.put("/:id/status", statusValidation, updateOrderStatus)

export default router
