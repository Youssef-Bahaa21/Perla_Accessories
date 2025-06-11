import multer from 'multer';
import { storage } from '../config/cloudinary';

/** Only allow specific image types */
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const fileFilter = (req: any, file: Express.Multer.File, cb: any): void => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, WEBP allowed.'));
    }
};

/**
 * Save image files to Cloudinary middleware factory
 * @param field the field name (e.g. "images")
 * @param maxFiles max number of files (e.g. 5)
 */
export function saveImages(field: string, maxFiles = 5) {


    // Create multer instance with Cloudinary storage
    const upload = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 10 * 1024 * 1024, // 10 MB per file
        },
    }).array(field, maxFiles);

    // Return a middleware that provides more debugging
    return (req: any, res: any, next: any) => {
        console.log(`Processing upload request for field "${field}"`);

        upload(req, res, (err) => {
            if (err) {
                console.error('Upload error:', err);
                return next(err);
            }

            console.log(`Upload successful: ${req.files?.length || 0} files uploaded`);

            // Add upload success timestamp
            if (req.files && req.files.length) {
                req.files.forEach((file: any, index: number) => {
                    console.log(`File ${index + 1}:`, {
                        fieldname: file.fieldname,
                        originalname: file.originalname,
                        path: file.path,
                        filename: file.filename,
                        size: file.size,
                        mimetype: file.mimetype
                    });
                });
            }

            next();
        });
    };
}
