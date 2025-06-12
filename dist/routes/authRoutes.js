"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post("/setup", authController_1.setup);
router.post("/login", authController_1.login);
router.get("/admin", authController_1.getAdminInfo);
router.put("/change-password", authController_1.changePassword);
router.put("/update-email", authController_1.updateEmail);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map