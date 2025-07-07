import { Router } from "express"
import { createOrderFromCart, getOrderSummary } from "../controllers/checkoutController"

const router = Router()

router.get("/summary/:customerId", getOrderSummary)
router.post("/:customerId", createOrderFromCart)

export default router
