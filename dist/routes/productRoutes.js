"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cloudinary_1 = require("../config/cloudinary");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
router.post("/", cloudinary_1.uploadProductImage, productController_1.createProduct);
router.get("/", productController_1.getAllProducts);
router.get("/:id", productController_1.getProductById);
router.put("/:id", cloudinary_1.uploadProductImage, productController_1.updateProduct);
router.delete("/:id", productController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map