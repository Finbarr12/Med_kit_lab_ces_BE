import { Router } from "express";
import {
  addDeliveryDetails,
  updateDeliveryDetails,
} from "../controllers/deliveryController";

const router = Router();

router.post("/:customerId", addDeliveryDetails);
router.patch("/update/:customerId", updateDeliveryDetails);

export default router;
