import express from "express";
import { updateSellerApproval, getAllSellers } from "../controllers/adminController.js";

const router = express.Router();

// Approve or reject seller request
router.put("/seller/:sellerId", updateSellerApproval);

// Get all sellers
router.get("/sellers", getAllSellers);

export default router;
