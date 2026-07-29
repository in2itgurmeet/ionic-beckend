const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file buffer or base64 string to Cloudinary.
 * @param {Buffer|string} file - The file buffer or base64 string to upload
 * @param {string} folder - The folder name in Cloudinary (e.g., 'profile_images')
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
exports.uploadToCloudinary = (file, folder = 'general') => {
  return new Promise((resolve, reject) => {
    // If it's a base64 string
    if (typeof file === 'string' && file.startsWith('data:')) {
      cloudinary.uploader.upload(file, { folder }, (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      });
      return;
    }

    // If it's a Buffer (from req.file.buffer)
    if (Buffer.isBuffer(file)) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(file);
      return;
    }

    reject(new Error('Invalid file type for Cloudinary upload. Expected Buffer or base64 string.'));
  });
};
