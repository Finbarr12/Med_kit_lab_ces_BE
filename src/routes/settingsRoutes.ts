import { Router } from "express";
import {
  getSettings,
  updateStoreInfo,
  updateBankInfo,
} from "../controllers/settingsController";

const router = Router();

router.get("/", getSettings);
router.put("/store", updateStoreInfo);
router.put("/bank", updateBankInfo);

export default router;
