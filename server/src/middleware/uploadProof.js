import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

/**
 * Custom multer StorageEngine that streams uploads directly to Cloudinary v2.
 */
class CloudinaryStorageEngine {
  _handleFile(req, file, cb) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'digital-heroes/proofs',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
        type: 'private',
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) return cb(error);
        cb(null, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          path: result.secure_url,
          size: result.bytes,
          filename: result.public_id,
        });
      }
    );
    file.stream.on('error', cb);
    file.stream.pipe(uploadStream);
  }

  _removeFile(req, file, cb) {
    cloudinary.uploader.destroy(file.filename, { type: 'private' }, (error) => cb(error));
  }
}

/**
 * Multer middleware for single proof image upload.
 * Field name: "proof"
 * Max file size: 5MB
 */
const uploadProof = multer({
  storage: new CloudinaryStorageEngine(),
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
