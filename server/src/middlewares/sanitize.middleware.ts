import mongoSanitize from 'express-mongo-sanitize';
import { Request, Response, NextFunction } from 'express';

export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
    // Apply mongoSanitize without wrapping in another function
    mongoSanitize.sanitize(req.body);
    mongoSanitize.sanitize(req.params);
    mongoSanitize.sanitize(req.query); // ✅ Do not reassign req.query

    // Trim body and params
    for (const source of [req.body, req.params]) {
        if (typeof source === 'object' && source !== null) {
            for (const key in source) {
                const val = source[key];
                if (typeof val === 'string') {
                    source[key] = val.trim();
                }
            }
        }
    }

    // Trim values in req.query directly without reassignment
    if (typeof req.query === 'object' && req.query !== null) {
        for (const key in req.query) {
            const val = req.query[key];
            if (typeof val === 'string') {
                (req.query as any)[key] = val.trim(); // ✅ mutate in-place
            }
        }
    }

    next();
}
