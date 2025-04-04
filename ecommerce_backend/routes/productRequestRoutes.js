import express from "express";
import { approveOrRejectProduct, getUnapprovedProducts } from "../controllers/productRequestController.js";

const router = express.Router();

router.put("/approve-or-reject", approveOrRejectProduct); // Auto-updates product approval status
router.get("/unapproved", getUnapprovedProducts); // Route to get all unapproved products

export default router;
