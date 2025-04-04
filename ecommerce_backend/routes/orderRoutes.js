import express from "express";
import { 
    placeOrder, 
    getOrder, 
    updateOrderStatus, 
    updateTracking, 
    getOrdersByBuyer 
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", placeOrder); // Place a new order
router.get("/:orderId", getOrder); // Get order details
router.put("/:orderId/status", updateOrderStatus); // Update order status
router.put("/:orderId/tracking", updateTracking); // Update tracking details
router.get("/buyer/:buyerId", getOrdersByBuyer); // Get all orders of a buyer

export default router;
