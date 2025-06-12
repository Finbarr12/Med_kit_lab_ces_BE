import { Router } from "express"
import { uploadProductImage } from "../config/cloudinary"
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController"

const router = Router()

router.post("/", uploadProductImage.single("productImage"), createProduct)
router.get("/", getAllProducts)
router.get("/:id", getProductById)
router.put("/:id", uploadProductImage.single("productImage"), updateProduct)
router.delete("/:id", deleteProduct)

export default router
