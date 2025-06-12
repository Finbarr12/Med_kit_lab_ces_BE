import { Router } from "express"
import { body } from "express-validator"
import { uploadPaymentProof } from "../config/cloudinary"
import {
  createPaymentRequest,
  getAllPaymentRequests,
  getPaymentById,
  approvePayment,
  rejectPayment,
} from "../controllers/paymentController"

const router = Router()

// Validation rules
const paymentValidation = [
  body("orderId").notEmpty().withMessage("Order ID is required"),
  body("customerInfo.fullName").notEmpty().trim().withMessage("Full name is required"),
  body("customerInfo.email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("customerInfo.phone").notEmpty().trim().withMessage("Phone is required"),
]

// Routes
router.post("/", uploadPaymentProof.single("paymentProof"), paymentValidation, createPaymentRequest)
router.get("/", getAllPaymentRequests)
router.get("/:id", getPaymentById)
router.put("/:id/approve/:adminId", approvePayment)
router.put(
  "/:id/reject/:adminId",
  [body("rejectionReason").notEmpty().trim().withMessage("Rejection reason is required")],
  rejectPayment,
)

export default router
