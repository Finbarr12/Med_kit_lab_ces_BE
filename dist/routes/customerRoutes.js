"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const customerController_1 = require("../controllers/customerController");
const router = (0, express_1.Router)();
// Validation rules
const customerValidation = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Valid email is required"),
    (0, express_validator_1.body)("fullName").notEmpty().trim().withMessage("Full name is required"),
    (0, express_validator_1.body)("phone").notEmpty().trim().withMessage("Phone is required"),
    (0, express_validator_1.body)("address.street")
        .notEmpty()
        .trim()
        .withMessage("Street address is required"),
    (0, express_validator_1.body)("address.city").notEmpty().trim().withMessage("City is required"),
    (0, express_validator_1.body)("address.state").notEmpty().trim().withMessage("State is required"),
    (0, express_validator_1.body)("address.zipCode").notEmpty().trim().withMessage("Zip code is required"),
    // Add password validation
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];
const updateCustomerValidation = [
    (0, express_validator_1.body)("fullName").notEmpty().trim().withMessage("Full name is required"),
    (0, express_validator_1.body)("phone").notEmpty().trim().withMessage("Phone is required"),
    (0, express_validator_1.body)("address.street")
        .notEmpty()
        .trim()
        .withMessage("Street address is required"),
    (0, express_validator_1.body)("address.city").notEmpty().trim().withMessage("City is required"),
    (0, express_validator_1.body)("address.state").notEmpty().trim().withMessage("State is required"),
    (0, express_validator_1.body)("address.zipCode").notEmpty().trim().withMessage("Zip code is required"),
];
// Routes
router.post("/", customerValidation, customerController_1.createCustomer);
router.post("/login", customerController_1.login_customer);
router.get("/", customerController_1.getAllCustomers);
router.get("/:id", customerController_1.getCustomerById);
router.get("/email/:email", customerController_1.getCustomerByEmail);
router.put("/:id", updateCustomerValidation, customerController_1.updateCustomer);
exports.default = router;
//# sourceMappingURL=customerRoutes.js.map