import { Router } from "express"
import {
  registerAdmin,
  loginAdmin,
  getAllAdmins,
  getAdminById,
  registerValidation,
  loginValidation,
} from "../controllers/authController"

const router = Router()

router.post("/register", registerValidation, registerAdmin)
router.post("/login", loginValidation, loginAdmin)
router.get("/admins", getAllAdmins)
router.get("/admins/:id", getAdminById)

export default router
