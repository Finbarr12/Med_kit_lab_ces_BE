"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const cartController_1 = require("../controllers/cartController");
const router = (0, express_1.Router)();
// Validation rules
const addToCartValidation = [
    (0, express_validator_1.body)("productId").notEmpty().withMessage("Product ID is required"),
    (0, express_validator_1.body)("brandName").notEmpty().trim().withMessage("Brand name is required"),
    (0, express_validator_1.body)("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];
const updateCartValidation = [
    (0, express_validator_1.body)("productId").notEmpty().withMessage("Product ID is required"),
    (0, express_validator_1.body)("brandName").notEmpty().trim().withMessage("Brand name is required"),
    (0, express_validator_1.body)("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];
const removeFromCartValidation = [
    (0, express_validator_1.body)("productId").notEmpty().withMessage("Product ID is required"),
    (0, express_validator_1.body)("brandName").notEmpty().trim().withMessage("Brand name is required"),
];
// Routes
router.get("/:sessionId", cartController_1.getCart);
router.post("/:sessionId/add", addToCartValidation, cartController_1.addToCart);
router.put("/:sessionId/update", updateCartValidation, cartController_1.updateCartItem);
router.delete("/:sessionId/remove", removeFromCartValidation, cartController_1.removeFromCart);
router.delete("/:sessionId/clear", cartController_1.clearCart);
exports.default = router;
//# sourceMappingURL=cartRoutes.js.map