import express from "express";
import upload from "../middleware/multer.js";
import { registerSeller, getSellerDetails, getSellerByUserId } from "../controllers/sellerController.js";

const router = express.Router();

// Register seller
router.post(
  "/register",
  upload.fields([
    { name: "shopImages", maxCount: 5 },
    { name: "documents", maxCount: 5 },
  ]),
  registerSeller
);

// Get seller details by sellerId
router.get("/:sellerId", getSellerDetails);

// ✅ Get seller details by userId (New Route)
router.get("/user/:userId", getSellerByUserId);

export default router;
