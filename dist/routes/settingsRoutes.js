"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settingsController_1 = require("../controllers/settingsController");
const cloudinary_1 = require("../config/cloudinary");
const router = (0, express_1.Router)();
router.get("/", settingsController_1.getSettings);
router.put("/store", cloudinary_1.uploadProductImage.single("logo"), settingsController_1.updateStoreInfo);
router.put("/bank", settingsController_1.updateBankInfo);
exports.default = router;
//# sourceMappingURL=settingsRoutes.js.map