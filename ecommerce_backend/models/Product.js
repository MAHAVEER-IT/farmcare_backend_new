import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    sellerId: { type: String, required: true }, 
    productId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { 
        type: String, 
        enum: ["vegetables", "fruits", "dairy", "seeds", "tools", "others"],
        default: "others"
    },
    stock: { type: Number, default: 0 },
    images: [{ type: String }], 
    approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    orders: [{type:String}],
    orderType: { type: String, enum: ["online", "cash on delivery"]},
    totalSales: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model("Product", productSchema);
export default Product;
