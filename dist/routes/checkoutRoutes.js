"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkoutController_1 = require("../controllers/checkoutController");
const router = (0, express_1.Router)();
router.get("/summary/:customerId", checkoutController_1.getCheckoutSummary);
router.post("/:customerId", checkoutController_1.createCheckoutSession);
router.get("/session/:sessionId", checkoutController_1.getCheckoutSession);
router.get("/customer/:customerId/sessions", checkoutController_1.getCustomerSessions);
exports.default = router;
//# sourceMappingURL=checkoutRoutes.js.map