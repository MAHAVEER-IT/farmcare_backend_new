import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true }, // Unique Order ID
    buyerId: { type: String, required: true }, // Buyer placing the order
    
    deliveryAddress: { 
        street: { type: String, required: true }, 
        city: { type: String, required: true }, 
        state: { type: String, required: true }, 
        zip: { type: String, required: true }, 
        country: { type: String, required: true }
    }, // Delivery Address

    products: [
        {
            productId: { type: String, required: true }, // Product ID
            quantity: { type: Number, required: true } // Quantity ordered
        }
    ],

    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" }, // Payment status
    orderStatus: { 
        type: String, 
        enum: ["processing", "shipped", "out for delivery", "delivered", "cancelled"], 
        default: "processing" 
    }, // Order status
    deliveryMethod: { type: String, enum: ["Standard", "Express", "Pickup"], default: "Standard" }, // Delivery method
    estimatedDelivery: { type: Date }, // Estimated delivery date
    trackingId: { type: String, unique: true }, // Tracking ID for shipment

    paymentMethod: { 
        type: String, 
        enum: ["Credit Card", "Debit Card", "UPI", "Cash on Delivery", "Online Payment"], 
        default: "Cash on Delivery" 
    }, // Payment method

    specialInstructions: { type: String }, // Special instructions from buyer (if any)

    // Tracking the real-time location of the order
    trackingDetails: [
        {
            timestamp: { type: Date, default: Date.now }, // Time of location update
            location: { type: String, required: true }, // Geolocation tracking (as a string)
            status: { 
                type: String, 
                enum: ["dispatched", "in transit", "out for delivery", "delivered"], 
                required: true 
            } // Status of package movement
        }
    ],

    createdAt: { type: Date, default: Date.now }, // Timestamp of order creation
    updatedAt: { type: Date, default: Date.now } // Timestamp of last update
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
