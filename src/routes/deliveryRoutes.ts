import { Router } from "express"
import { addDeliveryDetails, updateDeliveryDetails } from "../controllers/deliveryController"

const router = Router()

router.post("/:sessionId", addDeliveryDetails)
router.put("/:sessionId", updateDeliveryDetails)

export default router
