import Product from "../models/Product.js";
import ProductRequest from "../models/ProductRequest.js";
import EcomUserSeller from "../models/EcomUserSeller.js"; // Import Seller Model
import { v4 as uuidv4 } from "uuid";

export const createProduct = async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        console.log("Received files:", req.files);

        const { sellerId, name, description, price, category, stock } = req.body;

        // Validate required fields
        if (!sellerId || !name || !description || !price || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the seller exists & is approved
        const seller = await EcomUserSeller.findOne({ sellerId });
        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }
        if (seller.approvalStatus !== "approved") {
            return res.status(403).json({ message: "Seller is not approved to add products" });
        }

        // Ensure the uploaded document exists
        if (!req.files || !req.files.document) {
            return res.status(400).json({ message: "Approval document is required" });
        }

        // Validate price
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ message: "Invalid price" });
        }

        // Validate stock
        const parsedStock = stock ? parseInt(stock) : 0;
        if (isNaN(parsedStock) || parsedStock < 0) {
            return res.status(400).json({ message: "Invalid stock value" });
        }

        // Handle uploaded images
        const images = req.files.images ? req.files.images.map(file => `/uploads/${file.filename}`) : [];

        // Handle approval document upload
        const document = `/uploads/${req.files.document[0].filename}`;

        // Create the new product (pending approval)
        const newProduct = new Product({
            sellerId,
            productId: uuidv4(),
            name,
            description,
            price: parsedPrice,
            category,
            stock: parsedStock,
            images,
            approvalStatus: "pending",
        });

        await newProduct.save();

        // Create the product approval request
        const newRequest = new ProductRequest({
            sellerId,
            productId: newProduct.productId,
            document,
        });

        await newRequest.save();

        res.status(201).json({ 
            message: "Product created & approval request submitted successfully!", 
            product: newProduct, 
            request: newRequest 
        });

    } catch (error) {
        console.error("Error in createProduct:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getAllProducts = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await Product.find({ sellerId });
    res.status(200).json(products.length ? products : { message: "No products found", products: [] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getApprovedProducts = async (req, res) => {
    try {
        const approvedProducts = await Product.find({ approvalStatus: "approved" });

        if (approvedProducts.length === 0) {
            return res.status(404).json({ message: "No approved products found" });
        }

        res.status(200).json(approvedProducts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getProductByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findOne({ productId });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product by productId:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
export const getProductByCategory = async (req, res) => {
    try {
        const category = req.query.category;
    
        // Validate category input
        const validCategories = ["vegetables", "fruits", "dairy", "seeds", "tools", "others"];
        if (!validCategories.includes(category)) {
          return res.status(400).json({ message: "Invalid category" });
        }
    
        const products = await Product.find({ category });
        res.json(products);
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    };
