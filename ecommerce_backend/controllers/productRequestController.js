import ProductRequest from "../models/ProductRequest.js";
import Product from "../models/Product.js";

export const approveOrRejectProduct = async (req, res) => {
    try {
        const { productId, status, adminId, rejectionReason } = req.body;

        if (!productId || !status || !adminId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Find the product request by productId
        const request = await ProductRequest.findOne({ productId });
        if (!request) {
            return res.status(404).json({ message: "Product request not found" });
        }

        // Update the product request status
        request.status = status;
        request.approvedBy = adminId;
        request.approvalTime = status === "approved" ? new Date() : null;
        request.rejectionReason = status === "rejected" ? rejectionReason : "";

        await request.save();

        // Update the product's approval status
        const updatedProduct = await Product.findOneAndUpdate(
            { productId },
            { approvalStatus: status },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: `Product ${status} successfully`, request, updatedProduct });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUnapprovedProducts = async (req, res) => {
    try {
        const unapprovedProducts = await Product.find({ approvalStatus: "pending" });

        res.status(200).json(unapprovedProducts.length > 0 ? unapprovedProducts : []);
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
};
