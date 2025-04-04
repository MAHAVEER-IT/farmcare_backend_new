import { v4 as uuidv4 } from "uuid";
import Order from "../models/Order.js";
import EcomUserBuyer from "../models/EcomUserBuyer.js";
import Product from "../models/Product.js";

export const placeOrder = async (req, res) => {
    const { buyerId, products, paymentMethod } = req.body;

    try {
        console.log("🔹 Received order request:", req.body);

        // ✅ Fetch Buyer Details (Address)
        const buyer = await EcomUserBuyer.findOne({ buyerId });
        if (!buyer) {
            console.error("❌ Buyer not found");
            return res.status(404).json({ message: "Buyer not found" });
        }
        const { address } = buyer;

        // ✅ Generate Order ID
        const orderId = uuidv4();
        console.log("✅ Generated Order ID:", orderId);

        // ✅ Create New Order
        const newOrder = new Order({
            orderId,
            buyerId,
            products,
            deliveryAddress: address, // ✅ Use buyer's address
            paymentMethod,
            orderStatus: "processing",
            trackingId: uuidv4(),
            trackingDetails: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // ✅ Save Order
        await newOrder.save();
        console.log("✅ Order saved:", newOrder);

        // ✅ Update Buyer's Order History
        buyer.orderHistory.push(orderId);
        await buyer.save();
        console.log("✅ Updated buyer's order history");

        // ✅ Update Product Stock & Sales
        for (const item of products) {
            console.log(`🔹 Checking product: ${item.productId}`);
            const product = await Product.findOne({ productId: item.productId });

            if (!product) {
                console.error(`❌ Product ${item.productId} not found`);
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }

            if (product.stock < item.quantity) {
                console.error(`❌ Insufficient stock for ${product.name}`);
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            product.stock -= item.quantity;
            product.totalSales += item.quantity;
            product.orders.push(orderId);
            await product.save();
            console.log(`✅ Updated stock & sales for ${product.name}`);
        }

        res.status(201).json({ message: "Order placed successfully!", order: newOrder });

    } catch (error) {
        console.error("❌ Error placing order:", error);
        res.status(500).json({ error: error.message });
    }
};

// 📌 Get order details by orderId
export const getOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📌 Update order status (Processing → Shipped → Delivered)
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        const order = await Order.findOneAndUpdate(
            { orderId },
            { orderStatus, updatedAt: Date.now() },
            { new: true }
        );

        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json({ message: "Order status updated", order });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📌 Update tracking details
export const updateTracking = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { location, status } = req.body;

        const order = await Order.findOne({ orderId });
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.trackingDetails.push({ timestamp: new Date(), location, status });
        await order.save();

        res.json({ message: "Tracking details updated", trackingDetails: order.trackingDetails });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📌 Get all orders for a specific buyer
export const getOrdersByBuyer = async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.params.buyerId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
