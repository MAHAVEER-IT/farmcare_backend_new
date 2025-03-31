import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'farmcare',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp3', 'aac', 'wav', 'm4a'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('audio/')) {
      return cb(new Error('Only image and audio files are allowed!'), false);
    }
    cb(null, true);
  }
});

export { cloudinary, upload }; 