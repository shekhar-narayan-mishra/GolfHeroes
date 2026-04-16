import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'digital-heroes/proofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    type: 'private', // stored privately — requires signed URL to access
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
  },
});

/**
 * Multer middleware for single proof image upload.
 * Field name: "proof"
 * Max file size: 5MB
 */
const uploadProof = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and PDF files are accepted.'));
    }
  },
});

export default uploadProof;
