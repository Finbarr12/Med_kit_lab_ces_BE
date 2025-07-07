import { Router } from "express";
import {
  createCheckoutSession,
  getCheckoutSummary,
  getCheckoutSession,
  getCustomerSessions,
} from "../controllers/checkoutController";

const router = Router();

router.get("/summary/:customerId", getCheckoutSummary);
router.post("/:customerId", createCheckoutSession);
router.get("/session/:sessionId", getCheckoutSession);
router.get("/customer/:customerId/sessions", getCustomerSessions);

export default router;
