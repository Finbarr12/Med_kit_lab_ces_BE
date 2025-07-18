import { Router } from "express";
import {
  createCheckoutSession,
  getCheckoutSummary,
  getCheckoutSession,
  getCustomerSessions,
} from "../controllers/checkoutController";

const router = Router();

router.get("/summary/:customerId/:sessionId", getCheckoutSummary);
router.post("/:customerId/:sessionId", createCheckoutSession);
router.get("/session/:sessionId", getCheckoutSession);
router.get("/customer/:customerId/sessions", getCustomerSessions);

export default router;
