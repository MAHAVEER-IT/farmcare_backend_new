import mongoose from "mongoose";

const ecomUserBuyerSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Unique User ID
    buyerId: { type: String, required: true, unique: true }, // Unique Buyer ID
    name: { type: String, required: true }, // Buyer's name
    email: { type: String, required: true, unique: true }, // Buyer's email
    phone: { type: String, required: true, unique: true }, // Contact number
    address: { 
        street: { type: String, required: true }, 
        city: { type: String, required: true }, 
        state: { type: String, required: true }, 
        zip: { type: String, required: true }, 
        country: { type: String, required: true }
    }, // Buyer's address

    orderHistory: [{ type: String }], // List of order IDs placed by the buyer
    totalSpent: { type: Number, default: 0 }, // Total money spent by the buyer
    wishlist: [{ type: String }], // List of product IDs in the wishlist
    cart: [
        {
            productId: { type: String, required: true }, // Product ID
            quantity: { type: Number, required: true }, // Quantity of product in cart
        }
    ], // List of items in the cart

    preferredPaymentMethod: { type: String, enum: ["Credit Card", "Debit Card", "UPI", "Cash on Delivery"], default: "Cash on Delivery" }, // Payment method preference
    loyaltyPoints: { type: Number, default: 0 }, // Loyalty points for discounts or rewards

    createdAt: { type: Date, default: Date.now }, // Timestamp of account creation
    updatedAt: { type: Date, default: Date.now } // Timestamp of last update
});

const EcomUserBuyer = mongoose.model("EcomUserBuyer", ecomUserBuyerSchema);
export default EcomUserBuyer;
