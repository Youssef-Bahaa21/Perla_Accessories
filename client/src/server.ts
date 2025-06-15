import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

// Enhanced middleware for better SEO
app.use((req, res, next) => {
  // Add security headers for better SEO
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Ensure proper caching for static assets
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }

  next();
});

/**
 * API endpoints for SEO data
 */
app.get('/api/seo/product/:id', (req, res) => {
  // This would typically fetch from your database
  // For now, return mock data structure
  const productId = req.params.id;

  // You should replace this with actual database calls
  const mockProduct = {
    id: productId,
    name: `Product ${productId}`,
    description: `Beautiful accessory product ${productId} from Perla Accessories`,
    image: `https://perla-accessories.onrender.com/assets/images/products/product-${productId}.jpg`,
    price: '29.99',
    category: 'Accessories'
  };

  res.json(mockProduct);
});

/**
 * Serve static files from /browser
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false, // Important: don't serve index.html as static
    setHeaders: (res, path) => {
      // Set appropriate headers for different file types
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  // Enhanced URL construction
  const fullUrl = `${protocol}://${headers.host}${originalUrl}`;

  // Add request context for better SSR
  const requestContext = {
    url: fullUrl,
    userAgent: headers['user-agent'] || '',
    isBot: /bot|crawl|slurp|spider|facebook|twitter|linkedin/i.test(headers['user-agent'] || ''),
    acceptLanguage: headers['accept-language'] || 'en'
  };

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: fullUrl,
      publicPath: browserDistFolder,
      providers: [
        { provide: APP_BASE_HREF, useValue: baseUrl },
        { provide: 'REQUEST_CONTEXT', useValue: requestContext }
      ],
    })
    .then((html) => {
      // Enhanced HTML response with proper headers
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', requestContext.isBot ? 'public, max-age=300' : 'no-cache');
      res.send(html);
    })
    .catch((err) => {
      console.error('SSR Error:', err);
      next(err);
    });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).send('Internal Server Error');
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
    console.log(`SSR enabled for better SEO and social media sharing`);
  });
}

export default app;
