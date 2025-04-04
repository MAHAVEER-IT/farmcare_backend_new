import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import sellerRoutes from './routes/sellerRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import productRequestRoutes from './routes/productRequestRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';

// Create router
const router = express.Router();

// Setup file upload middleware (if needed)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mount all ecommerce routes
router.use('/sellers', sellerRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/product-requests', productRequestRoutes);
router.use('/products', productRoutes);
router.use('/admin', adminRoutes);
router.use('/buyers', buyerRoutes);

export default router; 