import { Router } from "express"
import { login, setup, changePassword, getAdminInfo, updateEmail } from "../controllers/authController"

const router = Router()

router.post("/setup", setup)
router.post("/login", login)
router.get("/admin", getAdminInfo)
router.put("/change-password", changePassword)
router.put("/update-email", updateEmail)

export default router
