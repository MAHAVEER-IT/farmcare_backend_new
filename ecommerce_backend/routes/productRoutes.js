import express from "express";
import { createProduct, getAllProducts, getApprovedProducts, getProductByCategory, getProductByProductId } from "../controllers/productController.js";
import upload from "../middleware/multer.js"; // Import multer config

const router = express.Router();

// Use Multer middleware to handle file uploads
router.post("/create", upload.fields([
    { name: "images", maxCount: 5 },
    { name: "document", maxCount: 1 }
]), createProduct);

router.get("/getallproducts/:sellerId", getAllProducts);
router.get("/approved", getApprovedProducts);
router.get("/category", getProductByCategory);
router.get("/:productId", getProductByProductId);

export default router;
