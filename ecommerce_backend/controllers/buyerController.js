import EcomUserBuyer from "../models/EcomUserBuyer.js";
import { v4 as uuidv4 } from "uuid";

// Register a new buyer with UUID for buyerId
export const registerBuyer = async (req, res) => {
    try {
        const { userId, name, email, phone, address } = req.body;

        // Check if buyer already exists
        const existingBuyer = await EcomUserBuyer.findOne({ userId });
        if (existingBuyer) return res.status(200).json({ message: "Buyer already registered", buyer:existingBuyer});

        const buyer = new EcomUserBuyer({
            userId,
            buyerId: uuidv4(), 
            name,
            email,
            phone,
            address
        });

        await buyer.save();
        res.status(201).json({ message: "Buyer registered successfully!", buyer });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email or phone number already exists" });
        }
        res.status(500).json({ error: error.message });
    }
};

// Get buyer details
export const getBuyer = async (req, res) => {
    try {
        const buyer = await EcomUserBuyer.findOne({ userId: req.params.userId });
        if (!buyer) return res.status(404).json({ message: "Buyer not found" });
        res.json(buyer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBuyerByBuyerId = async (req, res) => {
    try {
        const buyer = await EcomUserBuyer.findOne({ buyerId: req.params.buyerId });
        console.log(buyer);
        if (!buyer) return res.status(404).json({ message: "Buyer not found" });
        res.json(buyer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const addToCart = async (req, res) => {
    try {
        const { buyerId } = req.params;
        let { productId, quantity } = req.body;

        quantity = Number(quantity);
        if (quantity <= 0) {
            return res.status(400).json({ message: "Quantity must be greater than zero" });
        }

        const buyer = await EcomUserBuyer.findOne({ buyerId });
        if (!buyer) return res.status(404).json({ message: "Buyer not found" });

        const existingItem = buyer.cart.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            buyer.cart.push({ productId, quantity });
        }

        await buyer.save();
        res.json({ message: "Item added to cart", cart: buyer.cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { buyerId, productId } = req.params;

        const buyer = await EcomUserBuyer.findOne({ buyerId });
        if (!buyer) return res.status(404).json({ message: "Buyer not found" });

        const initialCartLength = buyer.cart.length;
        buyer.cart = buyer.cart.filter(item => item.productId !== productId);

        if (buyer.cart.length === initialCartLength) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        await buyer.save();
        res.json({ message: "Item removed from cart", cart: buyer.cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const { buyerId } = req.params;

        const buyer = await EcomUserBuyer.findOne({ buyerId });
        if (!buyer) return res.status(404).json({ message: "Buyer not found" });

        res.json({ cart: buyer.cart }); // Ensure response format matches frontend expectation
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updateCartItem = async (req, res) => {
    try {
        const { buyerId, productId } = req.params;
        const { quantity } = req.body;

        if (quantity <= 0) {
            return res.status(400).json({ message: "Quantity must be greater than zero" });
        }

        // Ensure `buyerId` is correctly queried
        const buyer = await EcomUserBuyer.findOne({ buyerId: buyerId });
        if (!buyer) return res.status(404).json({ message: "Buyer not found" });

        // Ensure `productId` is found in the cart
        const cartItem = buyer.cart.find(item => item.productId.toString() === productId);
        if (!cartItem) return res.status(404).json({ message: "Product not found in cart" });

        // Update quantity
        cartItem.quantity = quantity;
        await buyer.save();

        res.json({ message: "Cart updated successfully", cart: buyer.cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

