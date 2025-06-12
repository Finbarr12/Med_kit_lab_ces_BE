"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cloudinary_1 = require("../config/cloudinary");
const paymentController_1 = require("../controllers/paymentController");
const router = (0, express_1.Router)();
router.post("/", cloudinary_1.uploadPaymentProof.single("paymentProof"), paymentController_1.createPaymentRequest);
router.get("/", paymentController_1.getAllPaymentRequests);
router.get("/:id", paymentController_1.getPaymentById);
router.put("/:id/approve", paymentController_1.approvePayment);
router.put("/:id/reject", paymentController_1.rejectPayment);
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map