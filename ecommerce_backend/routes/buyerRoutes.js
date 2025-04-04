import express from "express";
import { registerBuyer, getBuyer, addToCart, removeFromCart, getCart, updateCartItem, getBuyerByBuyerId } from "../controllers/buyerController.js";

const router = express.Router();

router.post("/register", registerBuyer);
router.get("/:userId", getBuyer);
router.get("/buyer/:buyerId", getBuyerByBuyerId);
router.post("/:buyerId/cart", addToCart);
router.delete("/:buyerId/cart/:productId", removeFromCart);
router.put("/:buyerId/cart/:productId", updateCartItem);
router.get("/:buyerId/cart", getCart);

export default router;
