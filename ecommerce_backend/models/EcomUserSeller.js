import mongoose from "mongoose";

const ecomUserSellerSchema = new mongoose.Schema(
  {
    sellerId: { type: String, required: true }, // Unique Seller ID
    userId: { type: String, required: true }, // Unique User ID
    shopName: { type: String, required: true },
    shopDescription: { type: String, default: "" },
    shopLocation: { type: String, default: "" },

    // Approval Status & Admin Actions
    approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    approvedBy: { type: String, default: null }, // Stores Admin ID
    approvalTime: { type: Date, default: null },
    rejectionReason: { type: String, default: "" }, // Optional rejection reason

    // Store Image & Document URLs
    shopImages: [{ type: String }],
    documents: [{ type: String }],

    // Store Product IDs (No DB reference)
    products: [{ type: String }],

    // Seller Stats
    totalSales: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },

    // Request Timestamp
    requestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // Auto-adds createdAt & updatedAt
);

const EcomUserSeller = mongoose.model("EcomUserSeller", ecomUserSellerSchema);
export default EcomUserSeller;
