import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import multer from "multer"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure Cloudinary storage for products
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "medkit/products",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  } as any,
})

// Configure Cloudinary storage for payments
const paymentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "medkit/payments",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "pdf"],
    transformation: [{ width: 1200, height: 1600, crop: "limit" }],
  } as any,
})

// Multer upload middleware for products
export const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})

// Multer upload middleware for payments
export const uploadPaymentProof = multer({
  storage: paymentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/
    const extname = allowedTypes.test(file.originalname.toLowerCase())
    const mimetype = file.mimetype.startsWith("image/") || file.mimetype === "application/pdf"

    if (mimetype && extname) {
      cb(null, true)
    } else {
      cb(new Error("Only image files and PDFs are allowed"))
    }
  },
})

export default cloudinary
