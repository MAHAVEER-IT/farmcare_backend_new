import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import { compressImage } from '../utils/imageUtils.js';
import { fileURLToPath } from 'url';

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

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log('Received file:', file);
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('image');

// Mongoose schema and model for storing photos
const photoSchema = new mongoose.Schema({
  data: String, // Store base64 image data
  contentType: String,
  filename: String,
  uploadDate: { type: Date, default: Date.now },
  userId: String,
  size: Number
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
      data: compressedImage,
      contentType: session.contentType,
      filename: session.filename,
      userId: req.body.userId || 'anonymous',
      size: compressedImage.length
    });

    await photo.save();
    uploadSessions.delete(uploadId);

    res.status(200).json({
      success: true,
      imageUrl: `/api/v1/photos/${photo._id}`,
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
    upload(req, res, function(err) {
      console.log('Processing upload...');

      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // If no file was provided, return success without image
      if (!req.file) {
        return res.status(200).json({
          success: true,
          message: 'No image provided'
        });
      }

      // If file was provided, return image URL
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      console.log('Generated image URL:', imageUrl);

      res.status(201).json({
        success: true,
        imageUrl: imageUrl,
        message: 'Image uploaded successfully'
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading'
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
