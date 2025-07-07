import { Router } from "express";
import { uploadPaymentProof } from "../config/cloudinary";
import {
  uploadPaymentProof as uploadProof,
  getAllPaymentRequests,
  getPaymentById,
  approvePayment,
  rejectPayment,
} from "../controllers/paymentController";

const router = Router();

router.post(
  "/upload/:sessionId",
  uploadPaymentProof.single("paymentProof"),
  uploadProof
);
router.get("/", getAllPaymentRequests);
router.get("/:id", getPaymentById);
router.put("/:id/approve", approvePayment);
router.put("/:id/reject", rejectPayment);

export default router;
