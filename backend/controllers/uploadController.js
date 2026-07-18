const cloudinary = require('cloudinary').v2;
const AppError = require('../utils/appError');

const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                              process.env.CLOUDINARY_API_KEY && 
                              process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const fileType = req.body.type || 'poster';

    const fallbackUrls = {
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1000',
      theatre: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800',
      event: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'
    };

    if (!isCloudinaryConfigured) {
      console.log('[UPLOAD] Cloudinary credentials missing. Serving fallback placeholder URL.');
      const randomId = Math.floor(Math.random() * 1000);
      const baseUrl = fallbackUrls[fileType] || fallbackUrls.poster;
      return res.status(200).json({
        status: 'success',
        data: {
          url: `${baseUrl}&sig=${randomId}`
        }
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ticketshow',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('[UPLOAD ERROR]', error);
          return next(new AppError('Failed to upload file to Cloudinary', 500));
        }
        res.status(200).json({
          status: 'success',
          data: {
            url: result.secure_url
          }
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
};
