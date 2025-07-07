import { Router } from "express"
import { uploadPaymentProof } from "../config/cloudinary"
import {
  uploadPaymentProof as uploadProof,
  getAllPaymentRequests,
  getPaymentById,
  approvePayment,
  rejectPayment,
  getPaymentByOrderId,
} from "../controllers/paymentController"

const router = Router()

router.post("/upload/:orderId", uploadPaymentProof.single("paymentProof"), uploadProof)
router.get("/", getAllPaymentRequests)
router.get("/order/:orderId", getPaymentByOrderId)
router.get("/:id", getPaymentById)
router.put("/:id/approve", approvePayment)
router.put("/:id/reject", rejectPayment)

export default router
