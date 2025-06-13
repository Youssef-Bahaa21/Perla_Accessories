import multer from 'multer';
import { productStorage, categoryStorage } from '../config/cloudinary';
import path from 'path';
import { fileUploadLimiter } from './rate-limit.middleware';

/** Enhanced file security configuration */
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxFileSize = 10 * 1024 * 1024; // 10 MB
const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js', '.jar', '.php', '.jsp', '.asp'];

/** Enhanced file filter with security checks */
const fileFilter = (req: any, file: Express.Multer.File, cb: any): void => {
    try {
        // Check MIME type
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPG, PNG, WEBP allowed.'));
        }

        // Sanitize and validate filename
        if (!file.originalname) {
            return cb(new Error('Filename is required.'));
        }

        // Check for dangerous file extensions
        const fileExt = path.extname(file.originalname).toLowerCase();
        if (dangerousExtensions.includes(fileExt)) {
            return cb(new Error('File extension not allowed for security reasons.'));
        }

        // Check filename length
        if (file.originalname.length > 255) {
            return cb(new Error('Filename is too long.'));
        }

        // Check for path traversal attempts
        if (file.originalname.includes('../') || file.originalname.includes('..\\')) {
            return cb(new Error('Invalid filename: path traversal detected.'));
        }

        // Check for null bytes
        if (file.originalname.includes('\0')) {
            return cb(new Error('Invalid filename: null bytes detected.'));
        }

        // Validate that it's actually an image by checking file signature would be done here
        // For now, we rely on MIME type and Cloudinary's processing

        cb(null, true);
    } catch (error) {
        cb(new Error('File validation failed.'));
    }
};

/**
 * Save product image files to Cloudinary middleware factory with enhanced security
 * @param field the field name (e.g. "images")
 * @param maxFiles max number of files (e.g. 5)
 */
export function saveProductImages(field: string, maxFiles = 5) {
    // Create multer instance with Cloudinary storage
    const upload = multer({
        storage: productStorage,
        fileFilter,
        limits: {
            fileSize: maxFileSize,
            files: maxFiles,
            fieldSize: 1024 * 1024, // 1MB for field data
            fieldNameSize: 100, // limit field name length
            fields: 10, // limit number of fields
        },
    }).array(field, maxFiles);

    // Return middleware array with rate limiting and upload processing
    return [
        fileUploadLimiter,
        (req: any, res: any, next: any) => {
            console.log(`🔒 Processing secure product upload for field "${field}"`);
            console.log(`📊 Request from IP: ${req.ip}, User-Agent: ${req.get('User-Agent')?.substring(0, 50)}`);

            upload(req, res, (err) => {
                if (err) {
                    console.error('❌ Upload error:', err.message);

                    // Provide specific error messages for different error types
                    if (err.code) {
                        switch (err.code) {
                            case 'LIMIT_FILE_SIZE':
                                return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
                            case 'LIMIT_FILE_COUNT':
                                return res.status(413).json({ error: `Too many files. Maximum is ${maxFiles}.` });
                            case 'LIMIT_UNEXPECTED_FILE':
                                return res.status(400).json({ error: 'Unexpected file field.' });
                            default:
                                return res.status(400).json({ error: 'File upload error.' });
                        }
                    }

                    return res.status(400).json({ error: err.message || 'File upload failed.' });
                }

                const fileCount = req.files?.length || 0;
                console.log(`✅ Upload successful: ${fileCount} files uploaded securely`);

                // Log file details for security monitoring
                if (req.files && req.files.length) {
                    req.files.forEach((file: any, index: number) => {
                        console.log(`📎 File ${index + 1}:`, {
                            fieldname: file.fieldname,
                            originalname: file.originalname,
                            sanitizedName: file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'),
                            path: file.path,
                            filename: file.filename,
                            size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                            mimetype: file.mimetype,
                            uploadTime: new Date().toISOString()
                        });
                    });
                }

                next();
            });
        }
    ];
}

/**
 * Save category image files to Cloudinary middleware factory
 * @param field the field name (e.g. "image")
 * @param maxFiles max number of files (e.g. 1)
 */
export function saveCategoryImages(field: string, maxFiles = 1) {
    // Create multer instance with Cloudinary storage
    const upload = multer({
        storage: categoryStorage,
        fileFilter,
        limits: {
            fileSize: 10 * 1024 * 1024, // 10 MB per file
        },
    }).array(field, maxFiles);

    // Return a middleware that provides more debugging
    return (req: any, res: any, next: any) => {
        console.log(`Processing category upload request for field "${field}"`);

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

// For backward compatibility
export const saveImages = saveProductImages;
