import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RequestHandler } from 'express';
import validator from 'validator';

/**
 * Usage:
 *   router.post('/register',
 *     validateBody(RegisterDto),
 *     controllerFn);
 */
export default function validateBody<T extends object>(dto: new () => T): RequestHandler {
    return async (req, res, next) => {
        // Normalize email before transformation
        if (req.body?.email) {
            req.body.email = validator.normalizeEmail(req.body.email, {
                gmail_remove_dots: false,
            });
        }

        const instance = plainToInstance(dto, req.body);
        const errors = await validate(instance, { whitelist: true });

        if (errors.length) {
            res.status(400).json({
                message: 'Validation failed',
                errors: errors.map(e => ({
                    property: e.property,
                    constraints: e.constraints,
                })),
            });
            return;
        }

        req.body = instance;
        next();
    };
}
