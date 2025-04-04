import EcomUserSeller from "../models/EcomUserSeller.js";

export const updateSellerApproval = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { approvalStatus, adminId, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({ message: "Invalid approval status" });
    }

    const seller = await EcomUserSeller.findOne({ sellerId });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.approvalStatus = approvalStatus;
    seller.approvedBy = adminId;
    seller.approvalTime = new Date();

    if (approvalStatus === "rejected") {
      seller.rejectionReason = rejectionReason || "No reason provided";
    }

    await seller.save();

    res.status(200).json({ message: `Seller ${approvalStatus} successfully`, seller });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllSellers = async (req, res) => {
  try {
    const sellers = await EcomUserSeller.find();
    res.status(200).json(sellers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
