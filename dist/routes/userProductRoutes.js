"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userProductController_1 = require("../controllers/userProductController");
const router = (0, express_1.Router)();
// Routes
router.get("/", userProductController_1.getAllProducts);
router.get("/featured", userProductController_1.getFeaturedProducts);
router.get("/search", userProductController_1.searchProducts);
router.get("/category/:category", userProductController_1.getProductsByCategory);
router.get("/:id", userProductController_1.getProductById);
exports.default = router;
//# sourceMappingURL=userProductRoutes.js.map