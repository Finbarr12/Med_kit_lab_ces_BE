"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deliveryController_1 = require("../controllers/deliveryController");
const router = (0, express_1.Router)();
router.post("/:sessionId", deliveryController_1.addDeliveryDetails);
router.put("/:sessionId", deliveryController_1.updateDeliveryDetails);
exports.default = router;
//# sourceMappingURL=deliveryRoutes.js.map