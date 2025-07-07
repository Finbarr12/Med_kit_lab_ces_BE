import { Router } from "express"
import { addDeliveryDetails, updateDeliveryDetails, updateOrderStatus } from "../controllers/deliveryController"

const router = Router()

router.post("/:orderId", addDeliveryDetails)
router.put("/:orderId", updateDeliveryDetails)
router.put("/:orderId/status", updateOrderStatus)

export default router
