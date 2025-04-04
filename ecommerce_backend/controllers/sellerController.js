import { v4 as uuidv4 } from "uuid";
import EcomUserSeller from "../models/EcomUserSeller.js";

export const registerSeller = async (req, res) => {
  try {
    const { userId, shopName, shopDescription, shopLocation } = req.body;

    if (!userId || !shopName) {
      return res.status(400).json({ message: "User ID and Shop Name are required" });
    }

    const shopImages = req.files?.["shopImages"] ? req.files["shopImages"].map(file => `/uploads/${file.filename}`) : [];
    const documents = req.files?.["documents"] ? req.files["documents"].map(file => `/uploads/${file.filename}`) : [];

    const existingSeller = await EcomUserSeller.findOne({ userId });
    if (existingSeller) {
      return res.status(409).json({ message: "User is already registered as a seller" });
    }

    // Generate UUID for sellerId
    const sellerId = uuidv4();

    const newSeller = new EcomUserSeller({
      sellerId,
      userId,
      shopName,
      shopDescription,
      shopLocation,
      shopImages,
      documents,
    });

    await newSeller.save();
    res.status(201).json({ message: "Seller registered successfully", seller: newSeller });

  } catch (error) {
    console.error("Error in registerSeller:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get seller details
// @route GET /api/seller/:sellerId
// @access Public
export const getSellerDetails = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await EcomUserSeller.findOne({ sellerId });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json(seller);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSellerByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const seller = await EcomUserSeller.findOne({ userId });

    console.log(seller);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.status(200).json(seller);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
