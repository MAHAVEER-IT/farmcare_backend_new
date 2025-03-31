import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import { compressImage } from '../utils/imageUtils.js';
import { fileURLToPath } from 'url';
import { cloudinary, upload as cloudinaryUpload } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const localUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    console.log('Received file:', file);
    if (!file.originalname.match(/\.(jpg|jpeg|png|mp3|aac|wav|m4a)$/)) {
      return cb(new Error('Only image and audio files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('image');

// Mongoose schema and model for storing photos
const photoSchema = new mongoose.Schema({
  url: String,
  publicId: String,
  uploadDate: { type: Date, default: Date.now },
  userId: String
});

const Photo = mongoose.model('Photo', photoSchema);

// Add a temporary storage for chunked uploads
const uploadSessions = new Map();

export const startUpload = async (req, res) => {
  try {
    const { totalChunks, filename, contentType } = req.body;
    const uploadId = Date.now().toString();
    
    uploadSessions.set(uploadId, {
      chunks: new Array(totalChunks).fill(null),
      filename,
      contentType,
      completed: 0
    });

    res.status(200).json({
      success: true,
      uploadId,
      message: 'Upload session started'
    });
  } catch (error) {
    console.error('Start upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting upload'
    });
  }
};

export const uploadChunk = async (req, res) => {
  try {
    const { uploadId, chunk, chunkIndex } = req.body;
    const session = uploadSessions.get(uploadId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Upload session not found'
      });
    }

    session.chunks[chunkIndex] = chunk;
    session.completed++;

    res.status(200).json({
      success: true,
      message: 'Chunk uploaded successfully'
    });
  } catch (error) {
    console.error('Chunk upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading chunk'
    });
  }
};

export const completeUpload = async (req, res) => {
  try {
    const { uploadId } = req.body;
    const session = uploadSessions.get(uploadId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Upload session not found'
      });
    }

    const completeImage = session.chunks.join('');
    const compressedImage = await compressImage(completeImage);

    const photo = new Photo({
      url: compressedImage,
      publicId: session.filename,
      userId: req.body.userId || 'anonymous'
    });

    await photo.save();
    uploadSessions.delete(uploadId);

    res.status(200).json({
      success: true,
      imageUrl: compressedImage,
      message: 'Upload completed successfully'
    });
  } catch (error) {
    console.error('Complete upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing upload'
    });
  }
};

// Controller function for handling image uploads
export const uploadPhoto = async (req, res) => {
  try {
    console.log('Starting upload process...');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    if (!req.file) {
      console.log('No file received in request');
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Create photo record in database
    const photo = new Photo({
      url: req.file.path,
      publicId: req.file.filename,
      userId: req.user._id
    });

    await photo.save();
    console.log('Photo saved to database:', photo);

    res.status(201).json({
      success: true,
      imageUrl: req.file.path,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading image'
    });
  }
};

export const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(photo.publicId);

    // Delete from database
    await photo.remove();

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting photo'
    });
  }
};

export const getPhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    res.status(200).json({
      success: true,
      photo
    });
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving photo'
    });
  }
};

export const uploadImage = async (req, res) => {
  try {
    const { image, filename, contentType } = req.body;

    if (!image || !filename) {
      return res.status(400).json({
        success: false,
        message: 'Image and filename are required'
      });
    }

    // Decode base64 image
    const imageBuffer = Buffer.from(image, 'base64');
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, imageBuffer);

    // Return success response
    const imageUrl = `/uploads/${filename}`;
    res.status(200).json({
      success: true,
      imageUrl: imageUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image'
    });
  }
};

export const getImage = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Set content type and send file
    res.setHeader('Content-Type', 'image/jpeg');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving image'
    });
  }
};
