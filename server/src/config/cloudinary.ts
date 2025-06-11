import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

;

// Create Cloudinary storage engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'perla-products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1000, crop: 'limit' }],
        // Use unique filename based on original filename and current time
        filename_override: (req: any, file: any) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const originalName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
            return `${originalName}-${uniqueSuffix}`;
        },
    } as any, // Type casting needed due to TypeScript definitions
});

// Test Cloudinary connection
cloudinary.uploader.upload(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    { public_id: "tiny-test" },
    function (error, result) {
        if (error) {
            console.error("Cloudinary connection test failed:", error);
        } else {
        }
    }
);

export { cloudinary, storage }; 