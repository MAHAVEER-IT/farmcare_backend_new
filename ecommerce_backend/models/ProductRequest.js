import mongoose from "mongoose";

const productRequestSchema = new mongoose.Schema({
    sellerId: { type: String, required: true }, // Seller requesting approval
    productId: { type: String, required: true }, // Product awaiting approval
    document: { type: String, required: true }, // Max 1 document upload for approval
    status: { 
        type: String, 
        enum: ["pending", "approved", "rejected"], 
        default: "pending" 
    },
    approvedBy: { type: String, default: null }, // Stores Admin ID
    approvalTime: { type: Date, default: null },
    rejectionReason: { type: String, default: "" }, // Optional rejection reason
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const ProductRequest = mongoose.model("ProductRequest", productRequestSchema);
export default ProductRequest;
