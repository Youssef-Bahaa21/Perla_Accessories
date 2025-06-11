import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import 'reflect-metadata';
import { sanitizeInputs } from './middlewares/sanitize.middleware';
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
app.set('trust proxy', true);

/* ---- CORS ---- */
// Use the CORS middleware from ./middlewares/cors which reads from environment
import corsMiddleware from './middlewares/cors';
app.use(corsMiddleware);

/* ---- Middleware order: cookies, JSON, security ---- */
app.use(cookieParser());
app.use(express.json());
app.use(sanitizeInputs);

/* ---- Security (helmet, hpp, xss-clean, rate-limit) ---- */
app.use('/api', security);

/* ---- CSRF Protection ---- */
app.use('/api', csrfMiddleware);

/* ✅ Swagger UI */
setupSwagger(app);

/* ---- API Routes ---- */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);

/* ---- Catch Errors ---- */
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Server error:', err);
    if (!res.headersSent) {
        res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    }
});

/* ---- Start Server ---- */
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
