import { Injectable, inject } from '@angular/core';
import { ApiService } from './api/api.service';
import { Observable, from } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SitemapService {
    private api = inject(ApiService);

    private readonly baseUrls = [
        {
            url: 'https://perla-accessories.vercel.app',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'daily',
            priority: '1.0'
        },
        {
            url: 'https://perla-accessories.vercel.app/about',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: '0.8'
        },
        {
            url: 'https://perla-accessories.vercel.app/products',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'daily',
            priority: '0.9'
        },
        {
            url: 'https://perla-accessories.vercel.app/privacy-policy',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'yearly',
            priority: '0.3'
        },
        {
            url: 'https://perla-accessories.vercel.app/terms-of-service',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'yearly',
            priority: '0.3'
        },
        {
            url: 'https://perla-accessories.vercel.app/returns-policy',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: '0.4'
        },
        {
            url: 'https://perla-accessories.vercel.app/shipping-details',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: '0.4'
        }
    ];

    generateSitemap(): Observable<string> {
        return from(new Promise<string>((resolve) => {
            let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

            // Add base URLs
            this.baseUrls.forEach(page => {
                sitemap += `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
            });

            // Add category URLs
            this.api.categories.list().subscribe({
                next: (categories) => {
                    categories.forEach(category => {
                        sitemap += `
  <url>
    <loc>https://perla-accessories.vercel.app/products?category=${category.id}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
                    });

                    // Add product URLs (get all products for sitemap)
                    this.api.products.list().subscribe({
                        next: (products: any[]) => {
                            // Limit to first 100 products for sitemap performance
                            products.slice(0, 100).forEach((product: any) => {
                                sitemap += `
  <url>
    <loc>https://perla-accessories.vercel.app/products/${product.id}</loc>
    <lastmod>${new Date(product.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
                            });

                            sitemap += `
</urlset>`;
                            resolve(sitemap);
                        },
                        error: () => {
                            sitemap += `
</urlset>`;
                            resolve(sitemap);
                        }
                    });
                },
                error: () => {
                    // If categories fail, still generate with base URLs
                    sitemap += `
</urlset>`;
                    resolve(sitemap);
                }
            });
        }));
    }

    // Generate robots.txt content
    generateRobotsTxt(): string {
        return `User-agent: *
Allow: /

# Allow important pages
Allow: /products
Allow: /about
Allow: /privacy-policy
Allow: /terms-of-service
Allow: /returns-policy
Allow: /shipping-details

# Block admin areas
Disallow: /admin/
Disallow: /admin
Disallow: /account/
Disallow: /checkout/
Disallow: /cart/

# Block unnecessary files
Disallow: /api/
Disallow: /*.json
Disallow: /*.xml$
Disallow: /src/
Disallow: /dist/
Disallow: /node_modules/

# Block duplicate content
Disallow: /*?*utm_
Disallow: /*?*session
Disallow: /*?*tracking

# Allow CSS and JS
Allow: /*.css
Allow: /*.js

# Sitemap location
Sitemap: https://perla-accessories.vercel.app/sitemap.xml

# Special instructions for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /`;
    }
} 