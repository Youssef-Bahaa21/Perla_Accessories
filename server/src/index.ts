import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import 'reflect-metadata';
import { sanitizeInputs, sanitizeUserContent } from './middlewares/sanitize.middleware';
import { productApiLimiter, orderApiLimiter, reviewApiLimiter, generalApiLimiter } from './middlewares/rate-limit.middleware';
import setupSwagger from './config/swaggerConfig';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/categories';
import reviewRoutes from './routes/reviews';
import couponRoutes from './routes/coupons';
import orderRoutes from './routes/orders';
import settingsRoutes from './routes/settings';

import security from './middlewares/security';
import csrfMiddleware from './middlewares/csrf.middleware';

dotenv.config();
const app = express();
const port = Number(process.env.PORT) || 3000;

/* ---- Trust Proxy for Railway ---- */
app.set('trust proxy', 1); // Trust first proxy (Railway)

/* ---- CORS ---- */
// Use the CORS middleware from ./middlewares/cors which reads from environment
import corsMiddleware from './middlewares/cors';
app.use(corsMiddleware);

/* ---- Middleware order: cookies, JSON, security ---- */
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ---- Security (helmet, hpp, xss-clean, rate-limit) ---- */
app.use('/api', security);

/* ---- Health Check Endpoint ---- */
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

/* ---- CSRF Token Endpoint (always available) ---- */
app.get('/api/csrf-token', (req, res) => {
    // Always return a success response for CSRF token requests
    res.cookie('XSRF-TOKEN', 'production-token', {
        httpOnly: false, // Allow Angular to read it
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });
    res.json({
        message: 'CSRF token set successfully',
        token: 'production-token'
    });
});

/* ---- CSRF Protection ---- */
if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_CSRF !== 'true') {
    app.use('/api', csrfMiddleware); // CSRF enabled only in development
    console.log('🔒 CSRF Protection: ENABLED (development)');
} else {
    console.log('⚠️ CSRF Protection: DISABLED (for production)');
}

/* ✅ Swagger UI */
setupSwagger(app);

/* ---- Input Sanitization ---- */
app.use('/api', sanitizeInputs);

/* ---- API Routes with Rate Limiting ---- */
app.use('/api/auth', generalApiLimiter, authRoutes);
app.use('/api/users', generalApiLimiter, userRoutes);
app.use('/api/products', productApiLimiter, productRoutes);
app.use('/api/categories', generalApiLimiter, categoryRoutes);
app.use('/api/reviews', reviewApiLimiter, sanitizeUserContent, reviewRoutes);
app.use('/api/settings', generalApiLimiter, settingsRoutes);
app.use('/api/coupons', generalApiLimiter, couponRoutes);
app.use('/api/orders', orderApiLimiter, orderRoutes);

/* ---- Catch Errors ---- */
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Server error:', err);
    if (!res.headersSent) {
        res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    }
});

/* ---- Start Server ---- */
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on 0.0.0.0:${port}`);
    console.log(`🌐 Health check available at: http://0.0.0.0:${port}/health`);
    console.log(`📚 API documentation: http://0.0.0.0:${port}/api-docs`);
    console.log(`🔗 CORS enabled for: ${process.env.FRONTEND_ORIGIN || 'default origins'}`);
});
