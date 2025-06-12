import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { ApiService } from './api/api.service';
import { Product, Category } from '../models';

export interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

@Injectable({
    providedIn: 'root'
})
export class SitemapService {
    private api = inject(ApiService);
    private domain = 'https://perla-accessories.vercel.app';

    generateSitemap(): Observable<string> {
        return forkJoin({
            products: this.getProducts(),
            categories: this.getCategories()
        }).pipe(
            map(({ products, categories }) => {
                const urls: SitemapUrl[] = [];

                // Static pages
                urls.push(
                    {
                        loc: this.domain,
                        lastmod: new Date().toISOString(),
                        changefreq: 'daily',
                        priority: 1.0
                    },
                    {
                        loc: `${this.domain}/about`,
                        lastmod: new Date().toISOString(),
                        changefreq: 'monthly',
                        priority: 0.8
                    },
                    {
                        loc: `${this.domain}/products`,
                        lastmod: new Date().toISOString(),
                        changefreq: 'daily',
                        priority: 0.9
                    },
                    {
                        loc: `${this.domain}/privacy-policy`,
                        lastmod: new Date().toISOString(),
                        changefreq: 'yearly',
                        priority: 0.3
                    },
                    {
                        loc: `${this.domain}/terms-of-service`,
                        lastmod: new Date().toISOString(),
                        changefreq: 'yearly',
                        priority: 0.3
                    },
                    {
                        loc: `${this.domain}/returns-policy`,
                        lastmod: new Date().toISOString(),
                        changefreq: 'yearly',
                        priority: 0.5
                    }
                );

                // Category pages
                categories.forEach(category => {
                    urls.push({
                        loc: `${this.domain}/products?category=${category.id}`,
                        lastmod: new Date().toISOString(),
                        changefreq: 'weekly',
                        priority: 0.7
                    });
                });

                // Product pages
                products.forEach(product => {
                    urls.push({
                        loc: `${this.domain}/products/${product.id}`,
                        lastmod: product.created_at ? new Date(product.created_at).toISOString() : new Date().toISOString(),
                        changefreq: 'weekly',
                        priority: 0.8
                    });
                });

                return this.generateXml(urls);
            })
        );
    }

    private getProducts(): Observable<Product[]> {
        // Get products for sitemap
        return this.api.products.list().pipe(
            map((response: any) => response.data || response)
        );
    }

    private getCategories(): Observable<Category[]> {
        return this.api.categories.list();
    }

    private generateXml(urls: SitemapUrl[]): string {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        urls.forEach(url => {
            xml += '  <url>\n';
            xml += `    <loc>${this.escapeXml(url.loc)}</loc>\n`;

            if (url.lastmod) {
                xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
            }

            if (url.changefreq) {
                xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
            }

            if (url.priority !== undefined) {
                xml += `    <priority>${url.priority}</priority>\n`;
            }

            xml += '  </url>\n';
        });

        xml += '</urlset>';
        return xml;
    }

    private escapeXml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    generateRobotsTxt(): string {
        return `User-agent: *
Allow: /

# Allow all pages except admin and user-specific pages
Disallow: /admin
Disallow: /admin/*
Disallow: /cart
Disallow: /cart/*
Disallow: /checkout
Disallow: /checkout/*
Disallow: /auth
Disallow: /auth/*
Disallow: /order-confirmation
Disallow: /orders
Disallow: /orders/*

# Allow important pages for SEO
Allow: /
Allow: /about
Allow: /products
Allow: /products/*
Allow: /privacy-policy
Allow: /terms-of-service
Allow: /returns-policy

# Sitemap location
Sitemap: ${this.domain}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1`;
    }
} 