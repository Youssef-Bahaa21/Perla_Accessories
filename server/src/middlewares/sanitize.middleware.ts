import mongoSanitize from 'express-mongo-sanitize';
import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import path from 'path';

/**
 * Comprehensive input sanitization middleware
 */
export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
    try {
        // Apply mongoSanitize to prevent NoSQL injection
        mongoSanitize.sanitize(req.body);
        mongoSanitize.sanitize(req.params);
        mongoSanitize.sanitize(req.query);

        // Deep sanitize all request data
        req.body = deepSanitize(req.body);
        req.params = deepSanitize(req.params);
        req.query = deepSanitize(req.query);

        // Sanitize file uploads if present
        if (req.file) {
            req.file = sanitizeFile(req.file);
        }
        if (req.files) {
            if (Array.isArray(req.files)) {
                req.files = req.files.map(file => sanitizeFile(file));
            } else {
                for (const field in req.files) {
                    const fieldFiles = req.files[field];
                    if (Array.isArray(fieldFiles)) {
                        req.files[field] = fieldFiles.map(file => sanitizeFile(file));
                    } else if (fieldFiles) {
                        req.files[field] = [sanitizeFile(fieldFiles)];
                    }
                }
            }
        }

        next();
    } catch (error) {
        console.error('Sanitization error:', error);
        res.status(400).json({ error: 'Invalid input data' });
    }
}

/**
 * Deep sanitize object recursively
 */
function deepSanitize(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepSanitize(item));
    }

    if (typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const sanitizedKey = sanitizeString(key);
                sanitized[sanitizedKey] = deepSanitize(obj[key]);
            }
        }
        return sanitized;
    }

    return obj;
}

/**
 * Sanitize string values
 */
function sanitizeString(str: string): string {
    if (typeof str !== 'string') {
        return str;
    }

    // Trim whitespace
    let sanitized = str.trim();

    // Escape HTML to prevent XSS
    sanitized = validator.escape(sanitized);

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Remove or escape SQL injection patterns
    sanitized = sanitized.replace(/['";\\]/g, '\\$&');

    // Remove script tags and javascript: protocols
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/vbscript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    // Limit length to prevent DoS
    if (sanitized.length > 10000) {
        sanitized = sanitized.substring(0, 10000);
    }

    return sanitized;
}

/**
 * Sanitize uploaded files
 */
function sanitizeFile(file: Express.Multer.File): Express.Multer.File {
    if (!file) return file;

    // Sanitize filename
    if (file.originalname) {
        // Remove path separators and null bytes
        let sanitizedName = file.originalname.replace(/[\/\\:*?"<>|]/g, '_');
        sanitizedName = sanitizedName.replace(/\0/g, '');

        // Ensure filename is not too long
        const ext = path.extname(sanitizedName);
        const name = path.basename(sanitizedName, ext);

        if (name.length > 100) {
            sanitizedName = name.substring(0, 100) + ext;
        }

        // Prevent hidden files and dangerous extensions
        if (sanitizedName.startsWith('.')) {
            sanitizedName = 'file_' + sanitizedName;
        }

        // Block dangerous file extensions
        const dangerousExts = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js', '.jar', '.php', '.jsp', '.asp'];
        const fileExt = path.extname(sanitizedName).toLowerCase();
        if (dangerousExts.includes(fileExt)) {
            sanitizedName = sanitizedName.replace(fileExt, '.txt');
        }

        file.originalname = sanitizedName;
    }

    // Validate file size (should be handled by multer, but double-check)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        throw new Error('File size exceeds maximum limit');
    }

    return file;
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
        throw new Error('Invalid email format');
    }

    const sanitized = email.trim().toLowerCase();

    if (!validator.isEmail(sanitized)) {
        throw new Error('Invalid email format');
    }

    return sanitized;
}

/**
 * Sanitize and validate URLs
 */
export function sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL format');
    }

    const sanitized = url.trim();

    if (!validator.isURL(sanitized, { protocols: ['http', 'https'] })) {
        throw new Error('Invalid URL format');
    }

    return sanitized;
}

/**
 * Middleware specifically for user-generated content (reviews, comments, etc.)
 */
export function sanitizeUserContent(req: Request, res: Response, next: NextFunction) {
    try {
        // Apply general sanitization first
        sanitizeInputs(req, res, () => { });

        // Additional sanitization for user content fields
        const contentFields = ['content', 'comment', 'description', 'message', 'text'];

        for (const field of contentFields) {
            if (req.body[field]) {
                req.body[field] = sanitizeUserContentString(req.body[field]);
            }
        }

        next();
    } catch (error) {
        console.error('User content sanitization error:', error);
        res.status(400).json({ error: 'Invalid content data' });
    }
}

/**
 * Sanitize user-generated content strings
 */
function sanitizeUserContentString(content: string): string {
    if (typeof content !== 'string') {
        return content;
    }

    let sanitized = content.trim();

    // Allow some basic HTML tags but escape others
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'];

    // Remove all HTML tags except allowed ones
    sanitized = sanitized.replace(/<(?!\/?(?:p|br|strong|em|u|ol|ul|li)\b)[^>]*>/gi, '');

    // Escape any remaining script content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    // Limit content length
    if (sanitized.length > 5000) {
        sanitized = sanitized.substring(0, 5000);
    }

    return sanitized;
}
