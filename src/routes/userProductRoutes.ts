import { Router } from "express"
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
} from "../controllers/userProductController"

const router = Router()

// Routes
router.get("/", getAllProducts)
router.get("/featured", getFeaturedProducts)
router.get("/search", searchProducts)
router.get("/category/:category", getProductsByCategory)
router.get("/:id", getProductById)

export default router
