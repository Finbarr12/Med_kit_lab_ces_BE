"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const orderController_1 = require("../controllers/orderController");
const router = (0, express_1.Router)();
// Validation rules
const orderValidation = [
    (0, express_validator_1.body)("customerId").optional().isMongoId().withMessage("Invalid customer ID"),
    (0, express_validator_1.body)("customerInfo.fullName").notEmpty().trim().withMessage("Full name is required"),
    (0, express_validator_1.body)("customerInfo.email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    (0, express_validator_1.body)("customerInfo.phone").notEmpty().trim().withMessage("Phone is required"),
    (0, express_validator_1.body)("customerInfo.address").notEmpty().trim().withMessage("Address is required"),
    (0, express_validator_1.body)("customerInfo.city").notEmpty().trim().withMessage("City is required"),
    (0, express_validator_1.body)("customerInfo.state").notEmpty().trim().withMessage("State is required"),
    (0, express_validator_1.body)("customerInfo.zipCode").notEmpty().trim().withMessage("Zip code is required"),
    (0, express_validator_1.body)("items").isArray({ min: 1 }).withMessage("At least one item is required"),
];
const statusValidation = [
    (0, express_validator_1.body)("status")
        .isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"])
        .withMessage("Invalid status"),
];
// Routes
router.post("/", orderValidation, orderController_1.createOrder);
router.get("/", orderController_1.getAllOrders);
router.get("/number/:orderNumber", orderController_1.getOrderByNumber);
router.get("/:id", orderController_1.getOrderById);
router.put("/:id/status", statusValidation, orderController_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map