import { Router } from "express"
import { body } from "express-validator"
import {
  createCustomer,
  getCustomerById,
  getCustomerByEmail,
  updateCustomer,
  getAllCustomers,
} from "../controllers/customerController"

const router = Router()

// Validation rules
const customerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("fullName").notEmpty().trim().withMessage("Full name is required"),
  body("phone").notEmpty().trim().withMessage("Phone is required"),
  body("address.street").notEmpty().trim().withMessage("Street address is required"),
  body("address.city").notEmpty().trim().withMessage("City is required"),
  body("address.state").notEmpty().trim().withMessage("State is required"),
  body("address.zipCode").notEmpty().trim().withMessage("Zip code is required"),
]

const updateCustomerValidation = [
  body("fullName").notEmpty().trim().withMessage("Full name is required"),
  body("phone").notEmpty().trim().withMessage("Phone is required"),
  body("address.street").notEmpty().trim().withMessage("Street address is required"),
  body("address.city").notEmpty().trim().withMessage("City is required"),
  body("address.state").notEmpty().trim().withMessage("State is required"),
  body("address.zipCode").notEmpty().trim().withMessage("Zip code is required"),
]

// Routes
router.post("/", customerValidation, createCustomer)
router.get("/", getAllCustomers)
router.get("/:id", getCustomerById)
router.get("/email/:email", getCustomerByEmail)
router.put("/:id", updateCustomerValidation, updateCustomer)

export default router
