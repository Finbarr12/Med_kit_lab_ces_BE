import { Router } from "express"
import { getSettings, updateStoreInfo, updateBankInfo } from "../controllers/settingsController"
import { uploadProductImage } from "../config/cloudinary"

const router = Router()

router.get("/", getSettings)
router.put("/store", uploadProductImage.single("logo"), updateStoreInfo)
router.put("/bank", updateBankInfo)

export default router
