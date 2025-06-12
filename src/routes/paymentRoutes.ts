import { Router } from "express"
import { uploadPaymentProof } from "../config/cloudinary"
import {
  createPaymentRequest,
  getAllPaymentRequests,
  getPaymentById,
  approvePayment,
  rejectPayment,
} from "../controllers/paymentController"

const router = Router()

router.post("/", uploadPaymentProof.single("paymentProof"), createPaymentRequest)
router.get("/", getAllPaymentRequests)
router.get("/:id", getPaymentById)
router.put("/:id/approve", approvePayment)
router.put("/:id/reject", rejectPayment)

export default router
