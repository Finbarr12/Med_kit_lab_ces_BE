"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deliveryController_1 = require("../controllers/deliveryController");
const router = (0, express_1.Router)();
router.post("/:customerId", deliveryController_1.addDeliveryDetails);
router.patch("/update/:customerId", deliveryController_1.updateDeliveryDetails);
exports.default = router;
//# sourceMappingURL=deliveryRoutes.js.map