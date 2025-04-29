import express from 'express';
import { auth } from '../middleware/auth.js';
import { uploadPhoto, deletePhoto, getPhoto } from '../controllers/photoController.js';
import { upload as cloudinaryUpload } from '../config/cloudinary.js';
import multer from 'multer';

const router = express.Router();

// Handle file upload with Cloudinary
router.post('/upload', 
  auth,
  cloudinaryUpload.single('image'),
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  },
  uploadPhoto
);

// Get a specific photo
router.get('/:id', getPhoto);

// Delete a photo
router.delete('/:id', deletePhoto);

export default router;
